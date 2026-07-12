"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Volume2, VolumeX, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getNotificationSettings,
  saveNotificationSettings,
  usePrayerNotifications,
  ALL_PRAYERS,
  type NotificationSettings,
  type PrayerName,
} from "@/lib/hooks/use-prayer-notifications";
import toast from "react-hot-toast";

export function NotificationSettingsComponent({
  countryId,
  lat,
  lon,
}: {
  countryId?: string;
  lat?: number;
  lon?: number;
}) {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permissionState, setPermissionState] = useState<string>("default");
  const { requestPermission, scheduleNotifications } = usePrayerNotifications(countryId, lat, lon);

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const handleEnableToggle = async () => {
    if (!settings.enabled) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error("Notification permission denied. Please enable in browser settings.");
        return;
      }
    }
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    scheduleNotifications();
    toast.success(newSettings.enabled ? "Notifications enabled" : "Notifications disabled");
  };

  const handlePrayerToggle = (prayer: PrayerName) => {
    const prayers = settings.prayers.includes(prayer)
      ? settings.prayers.filter((p) => p !== prayer)
      : [...settings.prayers, prayer];
    const newSettings = { ...settings, prayers };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    scheduleNotifications();
  };

  const handleSoundChange = (sound: NotificationSettings["sound"]) => {
    const newSettings = { ...settings, sound };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notifications blocked. Enable in browser settings.");
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> Prayer Notifications
        </CardTitle>
        <CardDescription>Get notified when each prayer time arrives</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissionState === "denied" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <BellOff className="h-4 w-4" />
            Notifications are blocked. Please enable them in your browser settings.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {settings.enabled ? "Notifications are on" : "Notifications are off"}
            </p>
          </div>
          <button
            onClick={handleEnableToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled ? "bg-islamic-green" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {permissionState === "default" && (
          <Button variant="outline" size="sm" onClick={handleRequestPermission}>
            <Bell className="h-4 w-4 mr-2" /> Enable Notifications
          </Button>
        )}

        {settings.enabled && (
          <>
            <div className="space-y-2">
              <Label>Prayers</Label>
              <div className="grid grid-cols-5 gap-2">
                {ALL_PRAYERS.map((prayer) => (
                  <button
                    key={prayer}
                    onClick={() => handlePrayerToggle(prayer)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs ${
                      settings.prayers.includes(prayer)
                        ? "border-islamic-green bg-islamic-green/10 text-islamic-green"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    {settings.prayers.includes(prayer) && (
                      <Check className="h-3 w-3" />
                    )}
                    {prayer}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sound</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "adhan" as const, label: "Adhan", icon: Volume2 },
                  { value: "notification" as const, label: "Gentle", icon: Volume2 },
                  { value: "silent" as const, label: "Silent", icon: VolumeX },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleSoundChange(value)}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-sm ${
                      settings.sound === value
                        ? "border-islamic-green bg-islamic-green/10 text-islamic-green"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
