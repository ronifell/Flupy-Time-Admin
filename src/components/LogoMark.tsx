export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-base font-bold text-slate-950 shadow-lg shadow-teal-500/20 ring-1 ring-white/20 ${className}`}
      aria-hidden
    >
      <span className="relative z-10">F</span>
    </div>
  );
}
