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
  const [editItem, setEditItem] = useState<Gf | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const openEdit = useCallback((g: Gf) => {
    setEditItem(g);
    setLat(String(g.latitude));
    setLng(String(g.longitude));
    setRadius(String(g.radiusMeters));
    setFormErr(null);
  }, []);

  const closeEdit = useCallback(() => {
    setEditItem(null);
    setFormErr(null);
  }, []);

  const submitEdit = useCallback(async () => {
    if (!token || !editItem) return;
    setSaving(true);
    setFormErr(null);
    try {
      await apiFetch(`/geofences/${encodeURIComponent(editItem.geofenceKey)}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          latitude: Number(lat),
          longitude: Number(lng),
          radiusMeters: Number(radius)
        })
      });
      await load();
      closeEdit();
    } catch (e) {
      setFormErr(e instanceof ApiError ? e.message : t("errorLoad"));
    } finally {
      setSaving(false);
    }
  }, [token, editItem, lat, lng, radius, load, closeEdit, t]);

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/[0.1] bg-[rgba(3,6,14,0.65)] px-3 py-2 text-sm text-white outline-none focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20";

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
          className="self-start rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm text-slate-200 backdrop-blur-sm transition hover:border-teal-400/30"
        >
          {t("retry")}
        </button>
      </div>
      {err && <p className="text-sm text-rose-400">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-white/[0.1] py-16 text-center text-slate-500">
            {t("noData")}
          </p>
        )}
        {items.map((g) => (
          <article
            key={g.geofenceKey}
            className="ui-card-soft rounded-3xl p-5"
          >
            <p className="font-mono text-sm font-semibold text-teal-300">{g.geofenceKey}</p>
            <p className="mt-2 text-sm text-white">{g.officeName}</p>
            <p className="mt-3 text-xs text-slate-500">{t("office")}</p>
            <p className="text-sm text-slate-300">{g.officeId.slice(0, 8)}…</p>
            <p className="mt-3 text-xs text-slate-500">{t("coords")}</p>
            <p className="font-mono text-sm text-slate-300">
              {Number(g.latitude).toFixed(5)}, {Number(g.longitude).toFixed(5)}
            </p>
            <p className="mt-3 text-xs text-slate-500">{t("radiusM")}</p>
            <p className="text-lg font-semibold text-white">{g.radiusMeters}</p>
            <button
              type="button"
              onClick={() => openEdit(g)}
              className="mt-4 w-full rounded-xl border border-teal-400/35 bg-teal-400/10 py-2 text-sm font-medium text-teal-200 transition hover:bg-teal-400/18"
            >
              {t("edit")}
            </button>
          </article>
        ))}
      </div>

      {editItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="gf-edit-title"
        >
          <div className="ui-modal w-full max-w-md p-5">
            <h2 id="gf-edit-title" className="text-lg font-semibold text-white">
              {t("editGeofence")}
            </h2>
            <p className="mt-1 font-mono text-xs text-slate-500">{editItem.geofenceKey}</p>
            <p className="mt-2 text-sm text-slate-400">{editItem.officeName}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400">{t("latitude")}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">{t("longitude")}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">{t("radiusM")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </div>
            </div>
            {formErr && <p className="mt-3 text-sm text-rose-400">{formErr}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:border-white/[0.15]"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void submitEdit()}
                className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50"
              >
                {saving ? t("saving") : t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
