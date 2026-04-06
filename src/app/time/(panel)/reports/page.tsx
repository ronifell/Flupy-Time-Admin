"use client";

import { useI18n } from "@/lib/i18n";

export default function ReportsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("reportsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("reportsSubtitle")}</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/20 bg-gradient-to-b from-slate-950/80 to-slate-900/40 p-8 text-center">
          <p className="max-w-lg text-sm leading-relaxed text-slate-400">{t("reportsPlaceholder")}</p>
          <div
            className="mt-8 w-full max-w-3xl rounded-xl border border-white/5 bg-slate-950/60 p-4 text-left text-xs text-slate-600"
            dangerouslySetInnerHTML={{
              __html: `<!-- Power BI / HTML embed area -->
<div style="padding:24px;border-radius:12px;background:rgba(15,23,42,0.9);color:#94a3b8;font-family:system-ui">
  <strong style="color:#34d399">Flupy Time</strong> · ${t("reportsTitle")}
</div>`
            }}
          />
        </div>
      </div>
    </div>
  );
}
