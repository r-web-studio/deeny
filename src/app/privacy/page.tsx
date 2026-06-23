"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/login">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>

        <Card className="glass">
          <CardContent className="p-6 md:p-10 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: June 23, 2026</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to DeenFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal
                information and your right to privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our application and services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using DeenFlow, you agree to the collection and use of information in accordance with
                this policy. If you do not agree with the terms of this privacy policy, please do not
                access the application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. Information We Collect</h2>

              <h3 className="text-lg font-medium">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may collect personal information that you voluntarily provide to us when you register
                for an account, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Name and email address</li>
                <li>Profile information (username, avatar, country, timezone)</li>
                <li>Authentication credentials (password, securely stored via Supabase)</li>
              </ul>

              <h3 className="text-lg font-medium">Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information when you use the application, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Device information (browser type, operating system)</li>
                <li>Log data (access times, pages viewed, features used)</li>
                <li>Application usage patterns and interactions</li>
              </ul>

              <h3 className="text-lg font-medium">User-Generated Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                The application allows you to create and store the following content locally on your device:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Prayer tracking records</li>
                <li>Dhikr counter sessions</li>
                <li>Task and todo lists</li>
                <li>Journal entries</li>
                <li>No-porn streak tracking data</li>
                <li>AI companion chat conversations</li>
                <li>Quran bookmarks</li>
                <li>Achievement progress</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Important:</strong> This content is stored locally in your browser using
                localStorage and is NOT transmitted to our servers. We do not have access to your
                personal tracking data, journal entries, or chat conversations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve the application</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. AI Companion Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                DeenFlow includes an AI companion feature powered by OpenAI&apos;s GPT models. When you
                use the AI companion:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Your messages are sent to OpenAI&apos;s API for processing</li>
                <li>Conversations are stored locally in your browser (localStorage)</li>
                <li>We do not store or retain your AI conversations on our servers</li>
                <li>OpenAI&apos;s own privacy policy applies to data processed by their API</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. Data Storage and Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use Supabase for authentication and database services. Your authentication data
                (email, hashed password) is stored securely on Supabase&apos;s servers with industry-standard
                encryption.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Personal tracking data (prayers, dhikr, journal entries, streaks, tasks) is stored
                exclusively in your browser&apos;s localStorage. This data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Never leaves your device</li>
                <li>Is not synced across devices or browsers</li>
                <li>Is lost if you clear your browser data</li>
                <li>Cannot be accessed by us or any third party</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">6. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li><strong>Supabase</strong> &ndash; Authentication and database (supabase.com)</li>
                <li><strong>OpenAI</strong> &ndash; AI companion processing (openai.com)</li>
                <li><strong>Al-Quran Cloud</strong> &ndash; Quran text API (api.alquran.cloud)</li>
                <li><strong>islom.uz</strong> &ndash; Quran audio recitations</li>
                <li><strong>Aladhan API</strong> &ndash; Islamic/Hijri date conversion</li>
                <li><strong>islomapi.uz</strong> &ndash; Prayer times for Uzbekistan</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Each third-party service has its own privacy policy. We encourage you to review them.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">7. Children&apos;s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for use by children under the age of 13. We do not
                knowingly collect personal information from children under 13. If we become aware that
                we have collected personal information from a child under 13, we will take steps to
                delete such information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Email: admin@islom.uz</li>
                <li>Telegram: @portalislomuzadmin_bot</li>
              </ul>
            </section>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/terms">
            <Button variant="link" className="text-islamic-green">
              Terms of Service
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
