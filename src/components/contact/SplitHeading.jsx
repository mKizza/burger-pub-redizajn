function SplitHeading({ id, white, accent }) {
  return (
    <div className="flex items-center gap-4">
      <h2 id={id} className="shrink-0 font-anton text-[clamp(2.25rem,6vw,3rem)] uppercase leading-none tracking-wide">
        <span className="text-white">{white}</span> <span className="text-brand">{accent}</span>
      </h2>
      <span className="h-px flex-1 bg-brand" aria-hidden="true" />
    </div>
  );
}

export default SplitHeading;
