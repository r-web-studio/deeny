import type { Metadata } from "next";
import LandingPageClient from "@/components/landing-page";

export const metadata: Metadata = {
  title: "DeenFlow — Islamic Productivity",
  description: "Premium Islamic productivity app for prayer tracking, dhikr, journaling, and spiritual growth.",
};

export default function RootPage() {
  return <LandingPageClient />;
}
