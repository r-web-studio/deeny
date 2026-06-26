"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Globe, Palette, Save, Loader2, Camera, Type, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore, applyTheme } from "@/lib/stores/theme-store";
import { useUserStore } from "@/lib/stores/user-store";
import { useColorStore, COLOR_PRESETS } from "@/lib/stores/color-store";
import { useFontStore, FONT_PRESETS } from "@/lib/stores/font-store";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import toast from "react-hot-toast";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "America/Toronto", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Europe/Istanbul", "Asia/Dubai", "Asia/Riyadh",
  "Asia/Karachi", "Asia/Tashkent", "Asia/Almaty", "Asia/Bishkek",
  "Asia/Dushanbe", "Asia/Kabul", "Asia/Tehran", "Asia/Jakarta",
  "Asia/Kuala_Lumpur", "Africa/Cairo", "Africa/Casablanca", "Africa/Lagos",
  "Australia/Sydney",
];

const COUNTRIES = [
  "Uzbekistan", "Turkey", "Saudi Arabia", "UAE", "Pakistan",
  "Indonesia", "Malaysia", "Egypt", "Kazakhstan", "Russia",
  "Kyrgyzstan", "Tajikistan", "Afghanistan", "Iran", "Morocco",
  "Jordan", "Germany", "France", "United Kingdom", "United States", "Canada",
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { colorPresetId, setColorPreset } = useColorStore();
  const { fontPresetId, setFontPreset } = useFontStore();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("deenflow-profile");
    if (saved) {
      const profile = JSON.parse(saved);
      setFullName(profile.fullName || "");
      setUsername(profile.username || "");
      setCountry(profile.country || "");
      setTimezone(profile.timezone || "UTC");
      setAvatarPreview(profile.avatarUrl || null);
    }
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      // Save to user store
      const currentProfile = localStorage.getItem("deenflow-profile");
      const profile = currentProfile ? JSON.parse(currentProfile) : {};
      profile.avatarUrl = base64;
      localStorage.setItem("deenflow-profile", JSON.stringify(profile));
      useUserStore.getState().setUser({
        fullName: profile.fullName || fullName,
        email: useUserStore.getState().user?.email || "",
        username: profile.username || username,
        avatarUrl: base64,
        country: profile.country || country,
        timezone: profile.timezone || timezone,
      });
      toast.success("Avatar updated!");
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    const currentProfile = localStorage.getItem("deenflow-profile");
    const profile = currentProfile ? JSON.parse(currentProfile) : {};
    profile.avatarUrl = null;
    localStorage.setItem("deenflow-profile", JSON.stringify(profile));
    useUserStore.getState().setUser({
      fullName: profile.fullName || fullName,
      email: useUserStore.getState().user?.email || "",
      username: profile.username || username,
      avatarUrl: null,
      country: profile.country || country,
      timezone: profile.timezone || timezone,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    const profileData = { fullName, username, country, timezone, avatarUrl: avatarPreview };
    localStorage.setItem("deenflow-profile", JSON.stringify(profileData));
    useUserStore.getState().setUser({
      fullName,
      email: useUserStore.getState().user?.email || "",
      username,
      avatarUrl: avatarPreview,
      country,
      timezone,
    });
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    toast.success(t("settings.saved"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-2xl md:text-3xl font-bold">{t("settings.title")}</h1>

      {/* Profile Card */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> {t("settings.profile")}
          </CardTitle>
          <CardDescription>{t("settings.profileDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-islamic-green to-islamic-green/70 flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName ? fullName.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> {t("settings.changeAvatar")}
              </Button>
              {avatarPreview && (
                <Button variant="ghost" size="sm" onClick={removeAvatar} className="text-destructive">
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("settings.fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("settings.fullNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">{t("settings.username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("settings.usernamePlaceholder")}
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-islamic-green hover:bg-islamic-green/90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("settings.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Location & Time */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> {t("settings.locationTime")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("settings.country")}</Label>
              <Select value={country} onValueChange={(v) => setCountry(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.countryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.timezone")}</Label>
              <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "UTC")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> {t("settings.appearance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Theme */}
            <div className="space-y-2">
              <Label>{t("settings.theme")}</Label>
              <div className="flex gap-3">
                {(["light", "dark", "system"] as const).map((themeOption) => (
                  <Button
                    key={themeOption}
                    variant={theme === themeOption ? "default" : "outline"}
                    onClick={() => {
                      setTheme(themeOption);
                      applyTheme(themeOption);
                      setColorPreset(colorPresetId);
                    }}
                    className={theme === themeOption ? "bg-islamic-green hover:bg-islamic-green/90" : ""}
                  >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <Label>{t("settings.colorPalette")}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setColorPreset(preset.id)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      colorPresetId === preset.id
                        ? "border-foreground shadow-md scale-105"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: preset.light.islamicGreen }}
                      />
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: preset.light.gold }}
                      />
                    </div>
                    <span className="text-xs font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" /> {t("settings.fontFamily") || "Font Family"}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FONT_PRESETS.map((fp) => (
                  <button
                    key={fp.id}
                    onClick={() => setFontPreset(fp.id)}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      fontPresetId === fp.id
                        ? "border-foreground shadow-md scale-105"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="text-lg font-bold" style={{ fontFamily: fp.headingFont }}>
                      بسم
                    </span>
                    <span className="text-xs font-medium">{fp.name}</span>
                    <span className="text-[10px] text-muted-foreground">{fp.arabicName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label>{t("settings.language")}</Label>
              <LanguageSwitcher />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-islamic-green hover:bg-islamic-green/90"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {t("settings.save")}
      </Button>
    </motion.div>
  );
}
