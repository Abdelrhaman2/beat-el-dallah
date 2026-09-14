"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, translations } from "./index";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)["ar"];
  isArabic: boolean;
  dir: "rtl" | "ltr";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    // Read saved locale or default to Arabic
    const saved = localStorage.getItem("beit-el-dallah-locale") as Locale;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    } else {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("beit-el-dallah-locale", newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  };

  const isArabic = locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isArabic, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
