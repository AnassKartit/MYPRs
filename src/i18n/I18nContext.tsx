import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { en, fr, TranslationKey } from "./translations";

export type Locale = "en" | "fr";
export type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

const translations: Record<Locale, Record<TranslationKey, string>> = { en, fr };

function detectLocale(): Locale {
  const browserLang = (navigator.language || "").split("-")[0].toLowerCase();
  if (browserLang === "fr") return "fr";
  return "en";
}

function getPluralSuffix(count: number): "_one" | "_other" {
  return count === 1 ? "_one" : "_other";
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(detectLocale);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = translations[locale];

      let resolved: string | undefined;

      // Try plural form if count is provided
      if (params && typeof params.count === "number") {
        const pluralKey = (key + getPluralSuffix(params.count)) as TranslationKey;
        resolved = dict[pluralKey];
      }

      if (!resolved) {
        resolved = dict[key];
      }

      // Fallback to English
      if (!resolved) {
        resolved = translations.en[key] || key;
      }

      // Interpolation
      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          resolved = resolved.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        }
      }

      return resolved;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
