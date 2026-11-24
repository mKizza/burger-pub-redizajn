function PageHero({ white, accent, subtitle, children }) {
  return (
    <header className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 pt-32 pb-10 text-center sm:px-8 lg:pt-40 lg:pb-14">
      <div className="flex w-full items-center gap-4 sm:gap-6">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-brand" aria-hidden="true" />
        <h1 className="animate-fade-up font-anton text-[clamp(3.25rem,10vw,6rem)] leading-none tracking-wide">
          {white && <span className="text-white">{white} </span>}
          <span className="text-brand">{accent}</span>
        </h1>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-brand" aria-hidden="true" />
      </div>

      {subtitle && (
        <p className="animate-fade-up font-oswald text-sm uppercase tracking-[0.35em] text-white/85 [animation-delay:80ms]">
          {subtitle}
        </p>
      )}

      {children}
    </header>
  );
}

export default PageHero;
