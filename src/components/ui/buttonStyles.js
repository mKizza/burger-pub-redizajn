const BASE =
  "inline-flex items-center justify-center gap-2 font-oswald font-semibold uppercase tracking-[0.12em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary:
    "border-2 border-brand bg-brand text-black hover:bg-brand-soft hover:border-brand-soft hover:shadow-[0_0_32px_rgb(255_175_1/0.35)]",
  outline:
    "border-2 border-brand text-brand hover:bg-brand hover:text-black",
  ghost:
    "border-2 border-white/25 text-white hover:border-white hover:bg-white hover:text-black",
  danger:
    "border-2 border-red-500 bg-red-500 text-white hover:bg-red-400 hover:border-red-400",
};

const SIZES = {
  sm: "h-10 px-4 text-xs",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export function buttonClass({ variant = "primary", size = "md", className = "" } = {}) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}
