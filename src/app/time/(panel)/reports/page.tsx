"use client";

import { useI18n } from "@/lib/i18n";

export default function ReportsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("reportsTitle")}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{t("reportsSubtitle")}</p>
      </div>

      <div className="ui-card rounded-3xl p-6">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-teal-400/20 bg-gradient-to-b from-white/[0.03] to-transparent p-8 text-center">
          <p className="max-w-lg text-sm leading-relaxed text-slate-500">{t("reportsPlaceholder")}</p>
          <div
            className="mt-8 w-full max-w-3xl rounded-xl border border-white/[0.06] bg-[rgba(3,6,14,0.5)] p-4 text-left text-xs text-slate-600"
            dangerouslySetInnerHTML={{
              __html: `<!-- Power BI / HTML embed area -->
<div style="padding:24px;border-radius:12px;background:rgba(8,12,22,0.9);color:#64748b;font-family:system-ui;border:1px solid rgba(255,255,255,0.06)">
  <strong style="color:#2dd4bf">Flupy Time</strong> · ${t("reportsTitle")}
</div>`
            }}
          />
        </div>
      </div>
    </div>
  );
}
