"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { useI18n } from "@/lib/i18n";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      const next = encodeURIComponent(pathname || "/time/dashboard");
      router.replace(`/time/login?next=${next}`);
    }
  }, [ready, token, router, pathname]);

  if (!ready || !token) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        {t("loading")}
      </div>
    );
  }

  return <>{children}</>;
}
