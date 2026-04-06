"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/messages";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className={`inline-flex rounded-full border border-white/10 bg-slate-900/80 p-0.5 text-xs font-medium text-slate-300 ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["es", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`rounded-full px-2.5 py-1 transition ${
            locale === l
              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
              : "hover:text-white"
          }`}
        >
          {l === "es" ? t("langEs") : t("langEn")}
        </button>
      ))}
    </div>
  );
}
