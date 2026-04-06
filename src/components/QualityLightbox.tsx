"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export type LightboxPhoto = {
  id: string;
  photoUrl: string;
  photoType?: string;
  inspectorDecision?: string;
};

type Props = {
  open: boolean;
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
  if (u === "OK") return { label: t("uiStatusOk"), className: "text-emerald-300" };
  if (u === "FE") return { label: t("uiStatusFe"), className: "text-amber-200" };
  if (u === "ERROR") return { label: t("uiStatusError"), className: "text-rose-300" };
  return { label: t("qualityPhotoNotReviewed"), className: "text-slate-500" };
}

export function QualityLightbox({
  open,
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

  const photo = photos[index];
  const url = photo ? mediaUrl(photo.photoUrl) : "";
  const badge = photo ? decisionBadge(t, photo.inspectorDecision) : { label: "", className: "" };

  useEffect(() => {
    if (!open) return;
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [open, index]);

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
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-label={t("openImage")}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <div className="min-w-0 text-xs text-slate-400 sm:text-sm">
          {photo.photoType && <span className="text-emerald-300/90">{photo.photoType}</span>}
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
            className="rounded-lg border border-white/15 px-2 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          >
            {t("zoomIn")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            className="rounded-lg border border-white/15 px-2 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
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
            className="rounded-lg border border-white/15 px-2 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          >
            {t("resetZoom")}
          </button>
          <button
            type="button"
            disabled={busy || index <= 0}
            onClick={() => onIndexChange(index - 1)}
            className="rounded-lg border border-white/15 px-2 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          >
            {t("prev")}
          </button>
          <button
            type="button"
            disabled={busy || index >= photos.length - 1}
            onClick={() => onIndexChange(index + 1)}
            className="rounded-lg border border-white/15 px-2 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-40"
          >
            {t("next")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            {t("close")}
          </button>
        </div>
      </div>

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="max-h-[calc(100vh-180px)] max-w-full select-none object-contain shadow-2xl"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: drag.current ? "none" : "transform 0.08s ease-out"
          }}
          draggable={false}
        />
      </div>

      <p className="border-t border-white/10 px-4 py-2 text-center text-[11px] text-slate-500">
        {t("fullscreenHint")}
      </p>

      <p className="border-t border-white/5 px-4 py-1.5 text-center text-[11px] text-slate-500">
        {t("qualityPerPhotoHint")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-slate-950/90 px-4 py-3">
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
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-50"
        >
          {t("actionOk")}
        </button>
      </div>
    </div>
  );
}
