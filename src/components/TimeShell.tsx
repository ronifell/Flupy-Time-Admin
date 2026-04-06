"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./LogoMark";
import { LangSwitch } from "./LangSwitch";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthProvider";

const nav = [
  { href: "/time/dashboard", key: "navDashboard" },
  { href: "/time/employees", key: "navEmployees" },
  { href: "/time/attendance", key: "navAttendance" },
  { href: "/time/quality", key: "navQuality" },
  { href: "/time/geofences", key: "navGeofences" },
  { href: "/time/reports", key: "navReports" }
];

export function TimeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
                {t("brand")}
              </div>
              <div className="truncate text-[11px] text-sky-300/90 sm:text-xs">{t("portalSubtitle")}</div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LangSwitch className="hidden sm:inline-flex" />
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 md:inline">
              {t("flupyTimeChip")}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-white sm:text-sm"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-0 lg:flex-row">
        <aside
          className="sticky top-16 z-30 self-start border-b border-white/10 bg-slate-950/95 backdrop-blur-md lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto"
          aria-label={t("sidebarTitle")}
        >
          <div className="scrollbar-thin overflow-x-auto lg:overflow-x-visible">
            <div className="flex gap-2 p-3 lg:flex-col lg:gap-1">
              <div className="mb-2 flex items-start justify-between gap-2 px-2 lg:block">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{t("sidebarTitle")}</p>
                  <p className="mt-1 hidden text-xs leading-relaxed text-slate-400 lg:block">{t("sidebarHint")}</p>
                </div>
                <LangSwitch className="shrink-0 lg:hidden" />
              </div>
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition lg:w-full ${
                      active
                        ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
                        : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
