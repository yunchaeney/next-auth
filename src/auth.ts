import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "./lib/db";
import { User } from "./lib/schema";
import { compare } from "bcryptjs";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("credentials", credentials);

        const { email, password } = credentials;

        if (!email || !password) {
          throw new CredentialsSignin("입력값이 부족합니다.");
        }

        // DB 연동
        connectDB();

        // email 값으로 DB 조회
        const user = await User.findOne({ email }).select("+password +role");

        if (!user) {
          throw new CredentialsSignin("가입되지 않은 회원입니다.");
        }

        // 사용자가 입력한 비밀번호와 DB의 비밀번호가 일치하는지 확인
        const isMacthed = await compare(String(password), user.password);

        if (!isMacthed) {
          throw new CredentialsSignin("비밀번호가 일치하지 않습니다.");
        }

        return {
          name: user.name,
          email: user.email,
          role: user.role,
          id: user._id,
        };
      },
    }),

    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRETS,
    }),
  ],

  callbacks: {
    signIn: async ({ user, account }: { user: any; account: any }) => {
      console.log("signIn", user, account);

      if (account?.provider === "github") {
        const { name, email } = user;

        await connectDB(); // db 연결
        const existingUser = await User.findOne({
          email,
          authProviderId: "github",
        });

        if (!existingUser) {
          // 소셜 가입
          await new User({
            name,
            email,
            authProviderId: "github",
            role: "user",
          }).save();
        }

        const socialUser = await User.findOne({
          email,
          authProviderId: "github",
        });

        user.role = socialUser?.role || "user";
        user.id = socialUser?._id || null;

        return true;
      } else {
        //Credentials
        return true;
      }
    },

    async jwt({ token, user }: { token: any; user: any }) {
      console.log("jwt", token, user);
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token.role) {
        session.user.role = token.role;
        session.user.id = token.id;
      }

      return session;
    },
  },
});
