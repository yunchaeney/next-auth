import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function layout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (session) {
    redirect("/");
  }
  return <>{children}</>;
}
