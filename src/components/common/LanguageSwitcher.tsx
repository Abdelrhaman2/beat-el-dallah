"use client";

import { useI18n } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border border-brand-border bg-brand-surface text-brand-espresso hover:border-brand-caramel hover:text-brand-caramel transition-all cursor-pointer shadow-sm ${className}`}
      aria-label="Switch Language / تغيير اللغة"
    >
      <Globe className="w-3.5 h-3.5 text-brand-caramel" />
      <span>{locale === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
