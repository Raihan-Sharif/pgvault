"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// Import translations
import bn from "@/locales/bn.json";
import en from "@/locales/en.json";

type Language = "en" | "bn";
type TranslationKeys = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  toggleLanguage: () => void;
}

const translations: Record<Language, TranslationKeys> = { en, bn };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Load saved language preference
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("pgvault-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "bn")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("pgvault-language", lang);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "en" ? "bn" : "en";
    setLanguage(newLang);
  }, [language, setLanguage]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{
          language: "en",
          setLanguage,
          t: translations.en,
          toggleLanguage,
        }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Helper hook for getting translations
export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
