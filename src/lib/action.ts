"use server";

import { redirect } from "next/navigation";
import connectDB from "./db";
import { User } from "./schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";

export async function register(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password"); // password 는 hash (암호화)

  if (!name || !email || !password) {
    console.log("입력값이 부족합니다.");
  }

  connectDB();

  // 있는 회원인지 조회
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("이미 가입된 이메일");
  }

  // 비밀번호 암호화
  const hashedPassword = await hash(String(password), 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  await user.save();

  redirect("/login");
}

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password"); // password 는 hash (암호화)

  if (!email || !password) {
    console.log("입력값이 부족합니다.");
    return;
  }

  try {
    // auth.js 연동
    console.log("try", email, password);
    await signIn("credentials", {
      redirect: false,
      callbackUrl: "/",
      email,
      password,
    });
  } catch (error) {
    console.log(error);
  }

  redirect("/");
}

export async function githubLogin() {
  await signIn("github", { callbackUrl: "/" });
}
