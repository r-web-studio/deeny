"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
              <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">Last updated: June 23, 2026</p>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using DeenFlow (the &quot;Application&quot;), you accept and agree to be
                bound by the terms and provisions of this agreement. If you do not agree to these terms,
                please do not use the Application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                DeenFlow is a Islamic productivity application that helps users track their daily
                spiritual practices, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Prayer time tracking and scheduling</li>
                <li>Dhikr (remembrance of Allah) counting</li>
                <li>Task and todo management</li>
                <li>AI-powered Islamic companion for guidance</li>
                <li>No-porn streak tracking for self-improvement</li>
                <li>Quran reading and listening</li>
                <li>Journaling and mood tracking</li>
                <li>Islamic calendar and date tracking</li>
                <li>Achievement and gamification features</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly update your account information if it changes</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 13 years old to create an account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Use the Application for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any portion of the Application</li>
                <li>Interfere with or disrupt the Application or servers</li>
                <li>Use automated systems to access the Application without permission</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Impersonate any person or entity</li>
                <li>Violate any applicable local, state, national, or international law</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. AI Companion Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                The AI companion feature is powered by artificial intelligence and is provided for
                informational and educational purposes only. Please be aware:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>AI responses may not always be accurate or complete</li>
                <li>The AI is not a substitute for qualified religious scholars or professionals</li>
                <li>For important religious decisions, please consult a qualified scholar</li>
                <li>The AI should not be used for medical, legal, or financial advice</li>
                <li>We are not responsible for any decisions made based on AI responses</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Application and its original content, features, and functionality are owned by
                DeenFlow and are protected by international copyright, trademark, patent, trade secret,
                and other intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you create using the Application (journal entries,
                tasks, etc.). You grant us no rights to your personal content, which remains stored
                locally on your device.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">7. Data and Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Application is also governed by our Privacy Policy, which is incorporated
                into these Terms by reference. Please review our Privacy Policy to understand our
                practices regarding your personal data.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Most of your personal data (prayer records, journal entries, tasks, streaks) is stored
                locally on your device and is never transmitted to our servers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Application integrates with third-party services (Supabase, OpenAI, Quran APIs).
                Your use of these services is subject to their respective terms of service and privacy
                policies. We are not responsible for the practices of these third-party services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE APPLICATION IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                KIND, WHETHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APPLICATION WILL BE
                UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                IN NO EVENT SHALL DEENFLOW BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS,
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE
                APPLICATION.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">11. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account and access to the Application at our sole
                discretion, without prior notice, for conduct that we determine violates these Terms
                or is harmful to other users, us, or third parties, or for any other reason.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may terminate your account at any time by contacting us or using the account
                deletion feature in settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any
                changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date.
                Your continued use of the Application after any changes constitutes acceptance of the
                new Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Email: admin@islom.uz</li>
                <li>Telegram: @portalislomuzadmin_bot</li>
              </ul>
            </section>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/privacy">
            <Button variant="link" className="text-islamic-green">
              Privacy Policy
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
