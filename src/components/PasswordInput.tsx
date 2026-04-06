"use client";

import { useId, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
  /** Extra classes on the wrapper (default includes mt-1.5) */
  wrapperClassName?: string;
};

export function PasswordInput({
  id: propId,
  value,
  onChange,
  autoComplete,
  required,
  disabled,
  className = "",
  "aria-describedby": ariaDescribedBy,
  wrapperClassName = "mt-1.5"
}: Props) {
  const { t } = useI18n();
  const genId = useId();
  const id = propId ?? genId;
  const [visible, setVisible] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-3 pr-11 text-sm text-white outline-none focus:border-emerald-500/50 disabled:opacity-50";

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        className={`${inputClass} ${className}`.trim()}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-emerald-400 disabled:pointer-events-none disabled:opacity-40"
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M9.88 9.88a2.5 2.5 0 0 0 3.62 3.62M6.34 6.34C4.18 7.8 2.5 10 2 12c1.73 4.39 6 7 10 7 1.54 0 3.04-.32 4.38-.9M10.73 5.08A10.27 10.27 0 0 1 12 5c4 0 8.27 2.61 10 7-.57 1.45-1.38 2.8-2.35 3.95"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
