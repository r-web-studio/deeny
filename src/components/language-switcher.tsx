"use client";
import { useI18n, Locale } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const LANGUAGES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "uz", label: "O'zbek", flag: "🇺🇿" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
