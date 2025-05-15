"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const supportedLocales = [
  { code: "en-US", label: "English" },
  { code: "fr-FR", label: "Français" },
  { code: "es-MX", label: "Español (México)" },
];

declare global {
    interface Window {
        builderState: {
        locale?: string;
        [key: string]: any;
        };
    }
}

export function LocalePicker() {
  const [locale, setLocale] = useState("Default");

  useEffect(() => {
    const storedInCookie = Cookies.get("locale");
    const storedInLocalStorage = localStorage.getItem("locale");
    const fallback = navigator.language || "Default";
    const localeToUse = storedInCookie || storedInLocalStorage || fallback;
    
    setLocale(localeToUse);
    
    // Ensure both storage mechanisms have the same value
    if (!storedInCookie) {
      Cookies.set("locale", localeToUse, { expires: 365 });
    }
    if (!storedInLocalStorage) {
      localStorage.setItem("locale", localeToUse);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
    
    // Store in both localStorage and cookies for client and server access
    localStorage.setItem("locale", newLocale);
    Cookies.set("locale", newLocale, { expires: 365 });

    if (typeof window !== "undefined" && window.builderState) {
      window.builderState.locale = newLocale;
    }

    window.location.reload();
  };

  return (
    <select value={locale} onChange={handleChange}>
      {supportedLocales.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {loc.label}
        </option>
      ))}
    </select>
  );
}