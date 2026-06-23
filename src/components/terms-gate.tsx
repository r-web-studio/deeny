"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const TERMS_KEY = "deenflow-terms-agreed";

export function TermsGate({ children }: { children: React.ReactNode }) {
  const [agreed, setAgreed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem(TERMS_KEY);
    setAgreed(value === "true");
  }, []);

  const handleAgree = () => {
    setLoading(true);
    localStorage.setItem(TERMS_KEY, "true");
    setAgreed(true);
  };

  if (agreed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-islamic-green" />
      </div>
    );
  }

  if (!agreed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-islamic-green-light/20 p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-islamic-green/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg relative z-10"
        >
          <Card className="glass-strong shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-islamic-green to-islamic-green/80 flex items-center justify-center text-white text-2xl font-bold mb-2">
                {APP_NAME.charAt(0)}
              </div>
              <CardTitle className="text-2xl">Terms & Privacy Agreement</CardTitle>
              <CardDescription>
                Please review and agree to our terms before continuing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3 max-h-64 overflow-y-auto text-sm text-muted-foreground">
                <p>
                  Welcome to {APP_NAME}. Before you can use our application, you must agree to our
                  Terms of Service and Privacy Policy.
                </p>
                <p>
                  <strong>Key points:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Your personal tracking data is stored locally on your device</li>
                  <li>We do not sell or share your personal information</li>
                  <li>The AI companion uses OpenAI&apos;s API to process messages</li>
                  <li>You must be at least 13 years old to use this service</li>
                  <li>The AI companion is for informational purposes only</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleAgree}
                  className="w-full bg-islamic-green hover:bg-islamic-green/90"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  I Agree to Terms & Privacy Policy
                </Button>

                <div className="flex justify-center gap-4 text-sm">
                  <Link href="/terms" target="_blank" className="text-islamic-green hover:underline">
                    Read Terms of Service
                  </Link>
                  <Link href="/privacy" target="_blank" className="text-islamic-green hover:underline">
                    Read Privacy Policy
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
