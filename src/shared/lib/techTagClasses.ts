/** Стабильный набор классов по строке тега (полная строка для Tailwind JIT). */
const PALETTE = [
  "border-sky-400/45 text-sky-900 bg-sky-500/[0.14] shadow-[0_0_16px_-4px_rgba(14,165,233,0.4)] dark:border-sky-400/40 dark:text-sky-100 dark:bg-sky-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(56,189,248,0.32)]",
  "border-indigo-400/45 text-indigo-900 bg-indigo-500/[0.14] shadow-[0_0_16px_-4px_rgba(99,102,241,0.4)] dark:border-indigo-400/40 dark:text-indigo-100 dark:bg-indigo-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(129,140,248,0.32)]",
  "border-violet-400/45 text-violet-900 bg-violet-500/[0.14] shadow-[0_0_16px_-4px_rgba(139,92,246,0.38)] dark:border-violet-400/40 dark:text-violet-100 dark:bg-violet-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(167,139,250,0.3)]",
  "border-emerald-400/45 text-emerald-900 bg-emerald-500/[0.14] shadow-[0_0_16px_-4px_rgba(16,185,129,0.38)] dark:border-emerald-400/40 dark:text-emerald-100 dark:bg-emerald-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(52,211,153,0.3)]",
  "border-amber-400/45 text-amber-950 bg-amber-400/[0.16] shadow-[0_0_16px_-4px_rgba(245,158,11,0.35)] dark:border-amber-400/40 dark:text-amber-100 dark:bg-amber-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(251,191,36,0.28)]",
  "border-rose-400/45 text-rose-900 bg-rose-500/[0.14] shadow-[0_0_16px_-4px_rgba(244,63,94,0.35)] dark:border-rose-400/40 dark:text-rose-100 dark:bg-rose-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(251,113,133,0.28)]",
  "border-cyan-400/45 text-cyan-950 bg-cyan-500/[0.14] shadow-[0_0_16px_-4px_rgba(6,182,212,0.4)] dark:border-cyan-400/40 dark:text-cyan-100 dark:bg-cyan-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(34,211,238,0.3)]",
  "border-fuchsia-400/45 text-fuchsia-900 bg-fuchsia-500/[0.14] shadow-[0_0_16px_-4px_rgba(217,70,239,0.35)] dark:border-fuchsia-400/40 dark:text-fuchsia-100 dark:bg-fuchsia-400/[0.12] dark:shadow-[0_0_18px_-4px_rgba(232,121,249,0.28)]"
] as const;

export function classesForTechTag(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) {
    h = (Math.imul(31, h) + tag.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}
