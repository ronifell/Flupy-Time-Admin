"use client";

import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";
import { apiFetch, ApiError, mediaUrl } from "@/lib/api";
import { QualityLightbox, type LightboxPhoto } from "@/components/QualityLightbox";

type QItem = {
  id: string;
  userId: string;
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

type EmpOption = { id: string; employeeCode: string; fullName: string };

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

function buildQualityQuery(fromDate: string, toDate: string, userId: string): string {
  const qs = new URLSearchParams();
  if (fromDate) qs.set("fromDate", fromDate);
  if (toDate) qs.set("toDate", toDate);
  if (userId) qs.set("employeeId", userId);
  const q = qs.toString();
  return q ? `?${q}` : "";
}

function CalendarDateField({
  id,
  label,
  value,
  onChange,
  openLabel
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  openLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  /** `showPicker()` throws on `readOnly` date inputs (HTML spec). Icon must use a mutable input. */
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
          className="calendar-picker-input min-h-[44px] flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          onClick={(e) => openPicker(e)}
          aria-label={openLabel}
          title={openLabel}
          className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-emerald-400 transition hover:border-emerald-500/40 hover:bg-slate-800 hover:text-emerald-300"
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

export default function QualityPage() {
  const { t, locale } = useI18n();
  const { token } = useAuth();
  const [items, setItems] = useState<QItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmpOption[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [lightbox, setLightbox] = useState<{
    qualityId: string;
    photos: LightboxPhoto[];
    index: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  /** Always pass dates/user explicitly — avoids stale defaults from useCallback closures. */
  const fetchItems = useCallback(
    async (from: string, to: string, user: string) => {
      if (!token) return;
      setErr(null);
      try {
        const query = buildQualityQuery(from, to, user);
        const data = await apiFetch<{ items: QItem[] }>(`/admin/quality/items${query}`, { token });
        setItems(data.items || []);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : t("errorLoad"));
      }
    },
    [token, t]
  );

  const fetchItemsRef = useRef(fetchItems);
  fetchItemsRef.current = fetchItems;

  /** Only when `token` appears — not when `fetchItems` identity changes (e.g. locale), or Apply would be overwritten by an unfiltered reload. */
  useEffect(() => {
    if (!token) return;
    void fetchItemsRef.current("", "", "");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ items: EmpOption[] }>("/employees", { token })
      .then((d) => setEmployees(d.items || []))
      .catch(() => setEmployees([]));
  }, [token]);

  const applyFilters = useCallback(() => {
    void fetchItems(fromDate, toDate, filterUserId);
  }, [fetchItems, fromDate, toDate, filterUserId]);

  const clearFilters = useCallback(() => {
    setFromDate("");
    setToDate("");
    setFilterUserId("");
    void fetchItems("", "", "");
  }, [fetchItems]);

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
        await fetchItems(fromDate, toDate, filterUserId);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : t("errorLoad"));
      } finally {
        setBusy(false);
      }
    },
    [token, lightbox, fetchItems, t, fromDate, toDate, filterUserId]
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
          onClick={() => void fetchItems(fromDate, toDate, filterUserId)}
          className="self-start rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/40"
        >
          {t("retry")}
        </button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <CalendarDateField
            id="quality-filter-from"
            label={t("filterFromDate")}
            value={fromDate}
            onChange={setFromDate}
            openLabel={`${t("openCalendar")} — ${t("filterFromDate")}`}
          />
          <CalendarDateField
            id="quality-filter-to"
            label={t("filterToDate")}
            value={toDate}
            onChange={setToDate}
            openLabel={`${t("openCalendar")} — ${t("filterToDate")}`}
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-slate-400">{t("filterEmployee")}</label>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
            >
              <option value="">{t("filterAllEmployees")}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullName} ({e.employeeCode})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1 lg:justify-end">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              {t("filterApply")}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-emerald-500/40"
            >
              {t("filterClear")}
            </button>
          </div>
        </div>
      </section>

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
