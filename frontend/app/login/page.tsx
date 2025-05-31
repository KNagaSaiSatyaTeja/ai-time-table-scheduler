import { LoginForm } from "@/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Time Table Scheduler",
  description: "Login to your account",
};

export default function LoginPage() {
  return <LoginForm />;
}
