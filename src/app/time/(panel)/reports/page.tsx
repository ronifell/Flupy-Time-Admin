"use client";

import { useI18n } from "@/lib/i18n";

const POWERBI_REPORT_SRC =
  "https://app.powerbi.com/view?r=eyJrIjoiYzdhMzQ3MWItZjhmMS00Zjk0LWE1M2YtYjZlM2U4OTI1YmJhIiwidCI6IjkxNTMxY2Y1LTQ4ODQtNDZiNS1iYzY1LTQzYTkwMjZkMjVmMSIsImMiOjJ9&pageName=6631277f7227c153f0fd";

export default function ReportsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("reportsTitle")}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{t("reportsSubtitle")}</p>
      </div>

      <div className="ui-card rounded-3xl p-4 sm:p-6">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-950">
          <div
            className="relative w-full min-h-[280px]"
            style={{ aspectRatio: "800 / 636" }}
          >
            <iframe
              title="Control de Asistencia Voz srl"
              src={POWERBI_REPORT_SRC}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
