export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-lg font-bold text-slate-950 shadow-lg shadow-emerald-500/25 ${className}`}
      aria-hidden
    >
      F
    </div>
  );
}
