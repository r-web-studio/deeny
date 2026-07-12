"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Shield, Wifi, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOS(): "android" | "ios" | "other" {
  if (typeof window === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  return "other";
}

export default function DownloadPage() {
  const [os, setOS] = useState<"android" | "ios" | "other">("other");

  useEffect(() => {
    setOS(getOS());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8"
    >
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-islamic-green to-islamic-green/80 flex items-center justify-center shadow-xl shadow-islamic-green/25">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Sakinah</h1>
          <p className="text-muted-foreground">Islamic Productivity App</p>
        </div>

        {os === "android" && (
          <Card className="glass border-islamic-green/20">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Download for Android</h2>
                <p className="text-sm text-muted-foreground">
                  Get the native app with notifications and offline support
                </p>
              </div>
              <a
                href="/sakinah.apk"
                download="Sakinah.apk"
                className="inline-flex items-center justify-center w-full bg-islamic-green hover:bg-islamic-green/90 text-white h-12 text-base rounded-md px-4 py-2 font-medium transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Download APK
              </a>
              <p className="text-xs text-center text-muted-foreground">
                Version 1.0 • ~10MB • Android 7.0+
              </p>
            </CardContent>
          </Card>
        )}

        {os === "ios" && (
          <Card className="glass border-islamic-green/20">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Install on iOS</h2>
                <p className="text-sm text-muted-foreground">
                  Add Sakinah to your home screen for the best experience
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { step: 1, text: 'Tap the Share button (square with arrow up) in Safari' },
                  { step: 2, text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: 3, text: 'Tap "Add" in the top right corner' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-islamic-green/10 text-islamic-green text-sm font-bold flex-shrink-0">
                      {step}
                    </div>
                    <p className="text-sm text-muted-foreground pt-0.5">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {os === "other" && (
          <Card className="glass border-islamic-green/20">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Get Sakinah</h2>
                <p className="text-sm text-muted-foreground">
                  Install the app on your device
                </p>
              </div>
              <div className="space-y-3">
                <a
                  href="/sakinah.apk"
                  download="Sakinah.apk"
                  className="inline-flex items-center justify-center w-full bg-islamic-green hover:bg-islamic-green/90 text-white rounded-md px-4 py-2 font-medium transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download for Android
                </a>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">On iOS?</p>
                  <p className="text-xs text-muted-foreground">
                    Open this page in Safari, tap Share → Add to Home Screen
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Wifi, label: "Offline Support", desc: "Works without internet" },
            { icon: Bell, label: "Prayer Alerts", desc: "Notifications with sound" },
            { icon: Shield, label: "Private", desc: "Data stays on your device" },
            { icon: Smartphone, label: "Native Feel", desc: "Full-screen app experience" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center">
              <Icon className="h-5 w-5 text-islamic-green" />
              <p className="text-xs font-medium">{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
