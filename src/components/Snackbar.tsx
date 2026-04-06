"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  message: string;
  onClose: () => void;
  /** Auto-hide delay in ms */
  durationMs?: number;
  /** `bottom` = centered above bottom; `top-end` = top-right */
  placement?: "bottom" | "top-end";
};

/**
 * Fixed snackbar: minimal surface, blur, short slide + fade.
 */
export function Snackbar({ open, message, onClose, durationMs = 4000, placement = "bottom" }: Props) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(id);
  }, [open, onClose, durationMs]);

  const position =
    placement === "top-end"
      ? `top-6 right-4 justify-end sm:right-6 ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0 motion-reduce:opacity-0"
        }`
      : `bottom-6 left-1/2 -translate-x-1/2 justify-center ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0 motion-reduce:opacity-0"
        }`;

  return (
    <div
      className={`fixed z-[200] flex max-w-[min(calc(100vw-2rem),18rem)] transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${position}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <CheckIcon />
        </span>
        <span className="leading-snug">{message}</span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
