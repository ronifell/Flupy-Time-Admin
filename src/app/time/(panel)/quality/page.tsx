"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";
import { apiFetch, ApiError, mediaUrl } from "@/lib/api";
import { QualityLightbox, type LightboxPhoto } from "@/components/QualityLightbox";

type QItem = {
  id: string;
  orderId: string;
  workType: string;
  status: string;
  inspectorDecision: string;
  technicianName: string;
  technicianCode: string;
  photoCount: number;
  anyFe: boolean;
  firstPhotoUrl: string | null;
  createdAt: string;
};

function badgeForItem(item: QItem, t: (k: string) => string) {
  if (item.status === "APPROVED" || item.inspectorDecision === "OK") {
    return { label: t("uiStatusOk"), className: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" };
  }
  if (item.status === "REJECTED" || item.inspectorDecision === "ERROR") {
    return { label: t("uiStatusError"), className: "bg-rose-500/15 text-rose-300 ring-rose-500/30" };
  }
  if (item.inspectorDecision === "FE" || item.anyFe) {
    return { label: t("uiStatusFe"), className: "bg-amber-500/15 text-amber-200 ring-amber-500/35" };
  }
  return { label: t("uiStatusInProgress"), className: "bg-sky-500/10 text-sky-200 ring-sky-500/25" };
}

export default function QualityPage() {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [items, setItems] = useState<QItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    qualityId: string;
    photos: LightboxPhoto[];
    index: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setErr(null);
    try {
      const data = await apiFetch<{ items: QItem[] }>("/admin/quality/items", { token });
      setItems(data.items || []);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : t("errorLoad"));
    }
  }, [token, t]);

  useEffect(() => {
    load();
  }, [load]);

  const openGallery = useCallback(
    async (q: QItem) => {
      if (!token) return;
      try {
        const detail = await apiFetch<{
          id: string;
          photos: { id: string; photoUrl: string; photoType: string }[];
        }>(`/admin/quality/${q.id}`, { token });
        const photos = (detail.photos || []).map((p) => ({
          id: p.id,
          photoUrl: p.photoUrl,
          photoType: p.photoType
        }));
        if (!photos.length) return;
        setLightbox({ qualityId: detail.id, photos, index: 0 });
      } catch {
        setErr(t("errorLoad"));
      }
    },
    [token, t]
  );

  const onDecision = useCallback(
    async (decision: "FE" | "ERROR" | "OK") => {
      if (!token || !lightbox) return;
      setBusy(true);
      try {
        await apiFetch(`/admin/quality/${lightbox.qualityId}/review`, {
          method: "PATCH",
          token,
          body: JSON.stringify({ decision })
        });
        setLightbox(null);
        await load();
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : t("errorLoad"));
      } finally {
        setBusy(false);
      }
    },
    [token, lightbox, load, t]
  );

  const sorted = useMemo(() => items, [items]);

  function fmt(iso: string) {
    try {
      return new Date(iso).toLocaleString(locale === "es" ? "es-DO" : "en-US", {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("qualityTitle")}</h1>
          <p className="mt-1 text-sm text-slate-400">{t("qualitySubtitle")}</p>
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
        {sorted.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-white/15 py-16 text-center text-slate-500">
            {t("noData")}
          </p>
        )}
        {sorted.map((q) => {
          const b = badgeForItem(q, t);
          return (
            <article
              key={q.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 shadow-lg shadow-black/25"
            >
              <button
                type="button"
                onClick={() => openGallery(q)}
                className="group relative aspect-[4/3] w-full overflow-hidden bg-slate-950 text-left"
              >
                {q.firstPhotoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(q.firstPhotoUrl)}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 transition group-hover:opacity-95" />
                    <span className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white/90 drop-shadow">
                      {q.photoCount} {t("photos")} · {t("openImage")}
                    </span>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                    <span className="text-sm font-medium text-slate-500 group-hover:text-emerald-300/90">
                      {q.photoCount} {t("photos").toLowerCase()} · {t("openImage")}
                    </span>
                  </div>
                )}
              </button>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${b.className}`}>
                    {b.label}
                  </span>
                  <span className="text-xs text-slate-500">{fmt(q.createdAt)}</span>
                </div>
                <p className="mt-2 font-mono text-sm text-emerald-200/90">
                  {t("order")}: {q.orderId}
                </p>
                <p className="text-xs text-slate-400">{q.workType}</p>
                <div className="mt-3 border-t border-white/5 pt-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{t("technician")}</p>
                  <p className="text-sm font-medium text-white">{q.technicianName}</p>
                  <p className="font-mono text-xs text-slate-400">{q.technicianCode}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {lightbox && (
        <QualityLightbox
          open
          photos={lightbox.photos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onIndexChange={(i) => setLightbox((s) => (s ? { ...s, index: i } : s))}
          onDecision={onDecision}
          busy={busy}
        />
      )}
    </div>
  );
}
