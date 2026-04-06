"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";
import { apiFetch, ApiError } from "@/lib/api";

type AttRow = {
  id: string;
  fullName: string;
  employeeCode: string;
  eventType: string;
  occurredAt: string;
  workdayDate: string;
  onTime: boolean;
};

export default function AttendancePage() {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [items, setItems] = useState<AttRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const data = await apiFetch<{ items: AttRow[] }>("/admin/attendance/recent?limit=80", { token });
      setItems(data.items || []);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : t("errorLoad"));
    }
  }, [token, t]);

  useEffect(() => {
    load();
  }, [load]);

  function eventLabel(type: string) {
    const key = `event${type}` as const;
    const v = t(key);
    return v === key ? type : v;
  }

  function fmtDate(iso: string) {
    try {
      return new Date(iso).toLocaleString(locale === "es" ? "es-DO" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("attendanceTitle")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("attendanceSubtitle")}</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="self-start rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/40"
        >
          {t("retry")}
        </button>
      </div>
      {err && <p className="text-sm text-rose-400">{err}</p>}

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/40 scrollbar-thin">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">{t("name")}</th>
              <th className="px-4 py-3 font-medium">{t("employeeCode")}</th>
              <th className="px-4 py-3 font-medium">{t("eventType")}</th>
              <th className="px-4 py-3 font-medium">{t("status")}</th>
              <th className="px-4 py-3 font-medium">{t("occurredAt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {t("noData")}
                </td>
              </tr>
            )}
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-white">{row.fullName}</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-200/80">{row.employeeCode}</td>
                <td className="px-4 py-3">{eventLabel(row.eventType)}</td>
                <td className="px-4 py-3">
                  {row.eventType === "CHECK_IN" ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.onTime ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"
                      }`}
                    >
                      {row.onTime ? t("onTime") : t("late")}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{fmtDate(row.occurredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
