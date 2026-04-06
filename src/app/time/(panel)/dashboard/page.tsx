"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";
import { apiFetch, ApiError } from "@/lib/api";

type Summary = {
  activeEmployees: number;
  geofences: number;
  checkInsToday: number;
  tardinessToday: number;
  workdayDate: string;
};

type AttRow = {
  id: string;
  fullName: string;
  employeeCode: string;
  eventType: string;
  occurredAt: string;
  workdayDate: string;
  onTime: boolean;
};

type ActRow = {
  id: string;
  eventType: string;
  occurredAt: string;
  employeeName: string;
  officeName: string;
  index: number;
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/20 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-white sm:text-4xl">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [attendance, setAttendance] = useState<AttRow[]>([]);
  const [activity, setActivity] = useState<ActRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const [s, a, act] = await Promise.all([
        apiFetch<Summary>("/admin/dashboard/summary", { token }),
        apiFetch<{ items: AttRow[] }>("/admin/attendance/recent?limit=30", { token }),
        apiFetch<{ items: ActRow[] }>("/admin/activity/recent?limit=12", { token })
      ]);
      setSummary(s);
      setAttendance(a.items || []);
      setActivity(act.items || []);
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
      const d = new Date(iso);
      return d.toLocaleString(locale === "es" ? "es-DO" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t("dashboardTitle")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">{t("dashboardSubtitle")}</p>
          {summary?.workdayDate && (
            <p className="mt-1 text-xs text-slate-500">
              {locale === "es" ? "Día operativo" : "Workday"}: {summary.workdayDate}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="rounded-xl border border-white/15 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-emerald-500/40"
          >
            {t("retry")}
          </button>
          <button
            type="button"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
          >
            {t("newAction")}
          </button>
        </div>
      </div>

      {err && <p className="text-sm text-rose-400">{err}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("activeEmployees")} value={summary?.activeEmployees ?? "—"} />
        <StatCard label={t("checkInsToday")} value={summary?.checkInsToday ?? "—"} />
        <StatCard label={t("tardiness")} value={summary?.tardinessToday ?? "—"} />
        <StatCard label={t("geofences")} value={summary?.geofences ?? "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-white">{t("recentAttendance")}</h2>
          <div className="mt-4 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-2 font-medium">{t("name")}</th>
                  <th className="pb-3 pr-2 font-medium">{t("type")}</th>
                  <th className="pb-3 pr-2 font-medium">{t("status")}</th>
                  <th className="pb-3 font-medium">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      {t("noData")}
                    </td>
                  </tr>
                )}
                {attendance.map((row) => (
                  <tr key={row.id} className="text-slate-300">
                    <td className="py-3 pr-2 font-medium text-white">{row.fullName}</td>
                    <td className="py-3 pr-2">{eventLabel(row.eventType)}</td>
                    <td className="py-3 pr-2">
                      {row.eventType === "CHECK_IN" ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.onTime ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"
                          }`}
                        >
                          {row.onTime ? t("onTime") : t("late")}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400">{fmtDate(row.occurredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-white">{t("recentActivity")}</h2>
          <ul className="mt-4 space-y-3">
            {activity.length === 0 && <li className="text-slate-500">{t("noData")}</li>}
            {activity.map((row) => (
              <li
                key={row.id}
                className="rounded-2xl border border-white/5 bg-slate-950/50 px-4 py-3 text-sm text-slate-300"
              >
                <p>
                  {t("activityLine", {
                    name: row.employeeName,
                    event: eventLabel(row.eventType),
                    office: row.officeName || "—"
                  })}
                </p>
                <p className="mt-1 text-xs text-slate-500">{t("updateN", { n: row.index })}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
