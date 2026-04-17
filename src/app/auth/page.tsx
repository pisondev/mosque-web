import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthPageClient from "@/components/auth/AuthPageClient";

export default async function AuthPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mosque_session")?.value;

  if (token) {
    redirect("/dashboard");
  }

  return <AuthPageClient />;
}
