"use client";

import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/messages";

export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className={`inline-flex rounded-full border border-white/[0.1] bg-white/[0.04] p-0.5 text-xs font-medium text-slate-400 backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["es", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`rounded-full px-3 py-1 transition ${
            locale === l
              ? "bg-white/[0.12] text-teal-200 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]"
              : "hover:bg-white/[0.06] hover:text-slate-200"
          }`}
        >
          {l === "es" ? t("langEs") : t("langEn")}
        </button>
      ))}
    </div>
  );
}
