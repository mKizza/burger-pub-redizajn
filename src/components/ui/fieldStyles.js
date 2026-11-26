const CONTROL =
  "w-full border bg-black/45 font-oswald text-[15px] tracking-wide text-white transition-colors placeholder:text-white/35 focus:outline-none focus-visible:outline-none focus:ring-2 disabled:opacity-60";

export function controlClass(error, extra = "") {
  const state = error
    ? "border-red-400/80 focus:border-red-400 focus:ring-red-400/25"
    : "border-brand/35 hover:border-brand/60 focus:border-brand focus:ring-brand/25";

  return `${CONTROL} ${state} ${extra}`;
}

export function fieldDescribedBy(id, { error, hint } = {}) {
  return [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
}
