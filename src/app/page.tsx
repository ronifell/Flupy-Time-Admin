"use client";

import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { LangSwitch } from "@/components/LangSwitch";
import { useI18n } from "@/lib/i18n";

export default function PortalPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">{t("brand")}</div>
              <div className="truncate text-xs text-slate-400">{t("portalSubtitle")}</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <span className="cursor-default hover:text-white">{t("navHome")}</span>
            <span className="cursor-default hover:text-white">{t("navApps")}</span>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangSwitch />
            <Link
              href="#apps"
              className="hidden rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 sm:inline-block"
            >
              {t("enterPortal")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12 lg:py-16">
        <section>
          <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-300/90 sm:text-xs">
            {t("simBadge")}
          </p>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
            {t("portalHero")}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("portalDesc")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#apps"
              className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              {t("viewApps")}
            </a>
            <button
              type="button"
              onClick={() => alert(t("comingSoon"))}
              className="rounded-2xl border border-white/15 bg-slate-900/80 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-slate-800"
            >
              {t("tryFlupyAppLogin")}
            </button>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              { title: t("cardAppsTitle"), body: t("cardAppsBody") },
              { title: t("cardPortalTitle"), body: t("cardPortalBody") },
              { title: t("cardAdminTitle"), body: t("cardAdminBody") }
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-inner shadow-black/20 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="apps"
          className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6"
        >
          <h2 className="text-lg font-bold text-white sm:text-xl">{t("choosePanel")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{t("choosePanelHint")}</p>

          <div className="mt-6 flex flex-col gap-4">
            <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5">
              <h3 className="text-base font-semibold text-white">{t("flupyAppTitle")}</h3>
              <p className="mt-2 text-sm text-slate-400">{t("flupyAppDesc")}</p>
              <button
                type="button"
                disabled
                className="mt-4 w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-800/50 py-3 text-sm font-semibold text-slate-500"
              >
                {t("enterAsAdmin")}
              </button>
            </article>

            <article className="rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/10 to-slate-950/40 p-4 ring-1 ring-emerald-500/20 sm:p-5">
              <h3 className="text-base font-semibold text-emerald-200">{t("flupyTimeTitle")}</h3>
              <p className="mt-2 text-sm text-slate-300">{t("flupyTimeDesc")}</p>
              <Link
                href="/time/login"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                {t("enterAsAdmin")}
              </Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-600">
        Flupy Time · Ponches
      </footer>
    </div>
  );
}
