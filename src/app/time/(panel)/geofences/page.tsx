"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";
import { apiFetch, ApiError } from "@/lib/api";

type Gf = {
  geofenceKey: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  officeId: string;
  officeName: string;
};

export default function GeofencesPage() {
  const { t } = useI18n();
  const { token } = useAuth();
  const [items, setItems] = useState<Gf[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const data = await apiFetch<{ items: Gf[] }>("/geofences", { token });
      setItems(data.items || []);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : t("errorLoad"));
    }
  }, [token, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("geofencesTitle")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("geofencesSubtitle")}</p>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-white/15 py-16 text-center text-slate-500">
            {t("noData")}
          </p>
        )}
        {items.map((g) => (
          <article
            key={g.geofenceKey}
            className="rounded-3xl border border-white/10 bg-slate-900/50 p-5 shadow-lg shadow-black/20"
          >
            <p className="font-mono text-sm font-semibold text-emerald-300">{g.geofenceKey}</p>
            <p className="mt-2 text-sm text-white">{g.officeName}</p>
            <p className="mt-3 text-xs text-slate-500">{t("office")}</p>
            <p className="text-sm text-slate-300">{g.officeId.slice(0, 8)}…</p>
            <p className="mt-3 text-xs text-slate-500">{t("coords")}</p>
            <p className="font-mono text-sm text-slate-300">
              {Number(g.latitude).toFixed(5)}, {Number(g.longitude).toFixed(5)}
            </p>
            <p className="mt-3 text-xs text-slate-500">{t("radiusM")}</p>
            <p className="text-lg font-semibold text-white">{g.radiusMeters}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
