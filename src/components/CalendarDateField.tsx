"use client";

import type { MouseEvent } from "react";
import { useRef } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  openLabel: string;
};

export function CalendarDateField({ id, label, value, onChange, openLabel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    const el = inputRef.current;
    if (!el) return;
    const anyEl = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof anyEl.showPicker === "function") {
      try {
        anyEl.showPicker();
        return;
      } catch {
        /* older browsers / non-secure context */
      }
    }
    el.focus({ preventScroll: true });
    el.click();
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <div className="relative mt-1.5 flex items-stretch gap-2">
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          className="calendar-picker-input min-h-[44px] flex-1 rounded-xl border border-white/[0.1] bg-[rgba(3,6,14,0.65)] px-3 py-2.5 text-sm text-white outline-none focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/20"
        />
        <button
          type="button"
          onClick={(e) => openPicker(e)}
          aria-label={openLabel}
          title={openLabel}
          className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-teal-400 transition hover:border-teal-400/35 hover:bg-white/[0.08] hover:text-teal-300"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M7 3v2M17 3v2M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
