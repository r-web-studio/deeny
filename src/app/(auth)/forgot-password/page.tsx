import type { Metadata } from "next";
import ForgotPasswordPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
