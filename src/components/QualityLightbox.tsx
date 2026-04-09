"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBase } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export type LightboxPhoto = {
  id: string;
  photoUrl: string;
  photoType?: string;
  inspectorDecision?: string;
  /** Employee marked this photo as out of standard at upload (FE). */
  fe?: boolean;
  /** Mandatory technician comment when out of standard; visible to administrators. */
  feComment?: string | null;
};

type Props = {
  open: boolean;
  qualityId: string;
  token: string | null;
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  /** Persists the decision for this photo only. Returns true if saved; lightbox advances to the next photo on success. */
  onPhotoDecision: (photoId: string, decision: "FE" | "ERROR" | "OK") => Promise<boolean>;
  busy?: boolean;
};

function decisionBadge(t: (k: string) => string, d: string | undefined) {
  const u = String(d || "NONE").toUpperCase();
  if (u === "OK") return { label: t("uiStatusOk"), className: "text-teal-300" };
  if (u === "FE") return { label: t("uiStatusFe"), className: "text-amber-200" };
  if (u === "ERROR") return { label: t("uiStatusError"), className: "text-rose-300" };
  return { label: t("qualityPhotoNotReviewed"), className: "text-slate-500" };
}

export function QualityLightbox({
  open,
  qualityId,
  token,
  photos,
  index,
  onClose,
  onIndexChange,
  onPhotoDecision,
  busy
}: Props) {
  const { t } = useI18n();
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [imgErr, setImgErr] = useState(false);

  const photo = photos[index];
  const photoId = photo?.id;
  const badge = photo ? decisionBadge(t, photo.inspectorDecision) : { label: "", className: "" };
  const employeeComment = photo?.feComment?.trim() ?? "";
  const showTechnicianNonCompliance = Boolean(photo?.fe) || employeeComment.length > 0;

  useEffect(() => {
    if (!open) return;
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [open, index]);

  useEffect(() => {
    if (!open || !photoId || !qualityId || !token) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setImgErr(false);
      return;
    }

    let cancelled = false;
    let created: string | null = null;

    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImgErr(false);

    const url = `${getApiBase()}/admin/quality/${qualityId}/photos/${photoId}/image`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("bad status");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setBlobUrl(created);
      })
      .catch(() => {
        if (!cancelled) setImgErr(true);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [open, photoId, qualityId, token, index]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale((s) => Math.min(4, Math.max(0.5, s + delta)));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && index < photos.length - 1) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, photos.length, onClose, onIndexChange]);

  const applyDecision = useCallback(
    async (decision: "FE" | "ERROR" | "OK") => {
      if (!photo) return;
      const ok = await onPhotoDecision(photo.id, decision);
      if (ok && index < photos.length - 1) onIndexChange(index + 1);
    },
    [photo, onPhotoDecision, index, photos.length, onIndexChange]
  );

  if (!open || !photo) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-label={t("openImage")}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] bg-black/20 px-3 py-2 sm:px-4">
        <div className="min-w-0 text-xs text-slate-400 sm:text-sm">
          {photo.photoType && <span className="text-teal-300/90">{photo.photoType}</span>}
          <span className="ml-2 text-slate-500">
            {index + 1} / {photos.length}
          </span>
          <span className={`ml-2 font-medium ${badge.className}`}>· {badge.label}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => setScale((s) => Math.min(4, s + 0.25))}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 text-xs text-white transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            {t("zoomIn")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 text-xs text-white transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            {t("zoomOut")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setScale(1);
              setPos({ x: 0, y: 0 });
            }}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 text-xs text-white transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            {t("resetZoom")}
          </button>
          <button
            type="button"
            disabled={busy || index <= 0}
            onClick={() => onIndexChange(index - 1)}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 text-xs text-white transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            {t("prev")}
          </button>
          <button
            type="button"
            disabled={busy || index >= photos.length - 1}
            onClick={() => onIndexChange(index + 1)}
            className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-2 py-1.5 text-xs text-white transition hover:bg-white/[0.08] disabled:opacity-40"
          >
            {t("next")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/[0.12]"
          >
            {t("close")}
          </button>
        </div>
      </div>

      {showTechnicianNonCompliance && (
        <div className="border-b border-amber-500/20 bg-amber-950/35 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/90">
            {t("qualityTechnicianNonCompliance")}
          </p>
          {employeeComment ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-amber-50/95">{employeeComment}</p>
          ) : (
            <p className="mt-2 text-xs text-rose-300/90">{t("qualityTechnicianCommentMissing")}</p>
          )}
        </div>
      )}

      <div
        className="relative flex flex-1 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
        onWheel={onWheel}
        onMouseDown={(e) => {
          drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
        }}
        onMouseMove={(e) => {
          if (!drag.current) return;
          setPos({
            x: drag.current.px + (e.clientX - drag.current.sx),
            y: drag.current.py + (e.clientY - drag.current.sy)
          });
        }}
        onMouseUp={() => {
          drag.current = null;
        }}
        onMouseLeave={() => {
          drag.current = null;
        }}
      >
        {imgErr && (
          <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm text-rose-300">
            {t("qualityImageLoadError")}
          </p>
        )}
        {!imgErr && !blobUrl && (
          <p className="text-sm text-slate-500">{t("loading")}</p>
        )}
        {blobUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL from authenticated fetch */}
            <img
              src={blobUrl}
              alt=""
              className="max-h-[calc(100vh-180px)] max-w-full select-none object-contain shadow-2xl"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                transition: drag.current ? "none" : "transform 0.08s ease-out"
              }}
              draggable={false}
            />
          </>
        ) : null}
      </div>

      <p className="border-t border-white/[0.06] px-4 py-2 text-center text-[11px] text-slate-500">
        {t("fullscreenHint")}
      </p>

      <p className="border-t border-white/5 px-4 py-1.5 text-center text-[11px] text-slate-500">
        {t("qualityPerPhotoHint")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.08] bg-black/35 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          disabled={busy}
          onClick={() => void applyDecision("FE")}
          className="rounded-xl bg-amber-500/90 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg hover:bg-amber-400 disabled:opacity-50"
        >
          {t("actionFe")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void applyDecision("ERROR")}
          className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-rose-500 disabled:opacity-50"
        >
          {t("actionError")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void applyDecision("OK")}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50"
        >
          {t("actionOk")}
        </button>
      </div>
    </div>
  );
}
