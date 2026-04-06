"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";
import { PasswordInput } from "@/components/PasswordInput";
import { Snackbar } from "@/components/Snackbar";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdminEmployee } from "@/lib/auth";

type EmpDetail = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  role: string;
};

export default function ProfilePage() {
  const { t } = useI18n();
  const { token, employee, setAuth } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const closeSnackbar = useCallback(() => setSnackbarOpen(false), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const id = employee?.id;
    if (!token || !id) return;
    setLoadErr(null);
    setLoading(true);
    try {
      const data = await apiFetch<EmpDetail>(`/employees/${id}`, { token });
      setFullName(data.fullName || "");
      setEmail(data.email || "");
    } catch (e) {
      setLoadErr(e instanceof ApiError ? e.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [token, employee?.id, t]);

  useEffect(() => {
    if (employee?.id && token) void load();
  }, [employee?.id, token, load]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || !employee?.id || !fullName.trim()) return;
      const pw = password.trim();
      const pc = passwordConfirm.trim();
      if (pw || pc) {
        if (pw && !pc) {
          setSaveErr(t("fillPasswordConfirm"));
          return;
        }
        if (!pw && pc) {
          setSaveErr(t("fillNewPassword"));
          return;
        }
        if (pw !== pc) {
          setSaveErr(t("passwordMismatch"));
          return;
        }
        if (pw.length < 6) {
          setSaveErr(t("passwordMin6"));
          return;
        }
      }
      setSaving(true);
      setSaveErr(null);
      setSnackbarOpen(false);
      try {
        const body: Record<string, unknown> = {
          fullName: fullName.trim(),
          email: email.trim() ? email.trim() : null
        };
        if (pw) body.password = pw;

        await apiFetch(`/employees/${employee.id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(body)
        });

        const next: AdminEmployee = {
          ...employee,
          fullName: fullName.trim(),
          email: email.trim() ? email.trim() : null
        };
        setAuth(token, next);
        setPassword("");
        setPasswordConfirm("");
        setSnackbarOpen(true);
      } catch (err) {
        setSaveErr(err instanceof ApiError ? err.message : t("errorLoad"));
      } finally {
        setSaving(false);
      }
    },
    [token, employee, fullName, email, password, passwordConfirm, setAuth, t]
  );

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50";

  if (!employee) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("profileTitle")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("profileSubtitle")}</p>
      </div>

      {loadErr && <p className="text-sm text-rose-400">{loadErr}</p>}
      {loading && <p className="text-sm text-slate-500">{t("loading")}</p>}

      {!loading && !loadErr && (
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 sm:p-6">
          <div>
            <label className="text-xs font-medium text-slate-400">{t("company")}</label>
            <p className="mt-1.5 rounded-xl border border-white/5 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-300">
              {employee.companyName || "—"}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400">{t("employeeCode")}</label>
            <input
              type="text"
              readOnly
              value={employee.employeeCode}
              className={`${inputClass} cursor-not-allowed text-slate-500`}
              aria-describedby="profile-code-hint"
            />
            <p id="profile-code-hint" className="mt-1 text-[11px] text-slate-500">
              {t("profileEmployeeCodeReadOnly")}
            </p>
          </div>

          <div>
            <label htmlFor="profile-name" className="text-xs font-medium text-slate-400">
              {t("name")}
            </label>
            <input
              id="profile-name"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="text-xs font-medium text-slate-400">
              {t("email")}
            </label>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profile-password" className="text-xs font-medium text-slate-400">
              {t("passwordNewOptional")}
            </label>
            <PasswordInput
              id="profile-password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              disabled={saving}
              aria-describedby="profile-password-hint"
            />
            <p id="profile-password-hint" className="mt-1 text-[11px] text-slate-500">
              {t("passwordLeaveBlank")}
            </p>
          </div>

          <div>
            <label htmlFor="profile-password-confirm" className="text-xs font-medium text-slate-400">
              {t("passwordConfirm")}
            </label>
            <PasswordInput
              id="profile-password-confirm"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              autoComplete="new-password"
              disabled={saving}
            />
          </div>

          {saveErr && <p className="text-sm text-rose-400">{saveErr}</p>}

          <button
            type="submit"
            disabled={saving || !fullName.trim()}
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </form>
      )}

      <Snackbar
        open={snackbarOpen}
        message={t("profileSaved")}
        onClose={closeSnackbar}
        placement="top-end"
      />
    </div>
  );
}
