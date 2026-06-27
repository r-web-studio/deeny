"use client";
import { useI18n, Locale } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES: { value: Locale; label: string; flag: string; code: string }[] = [
  { value: "en", label: "English", flag: "🇬🇧", code: "EN" },
  { value: "uz", label: "O'zbek", flag: "🇺🇿", code: "UZ" },
  { value: "ru", label: "Русский", flag: "🇷🇺", code: "RU" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷", code: "TR" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const current = LANGUAGES.find((l) => l.value === locale) || LANGUAGES[0];

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger className="w-[88px] h-9 rounded-full border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors">
        <span className="text-base mr-1">{current.flag}</span>
        <SelectValue>
          <span className="text-xs font-semibold tracking-wider">{current.code}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[160px]">
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value} className="py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
