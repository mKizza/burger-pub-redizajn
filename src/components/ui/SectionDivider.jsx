function SectionDivider({ white, accent, as: Tag = "h2", id }) {
  return (
    <div className="flex w-full items-center gap-4 sm:gap-6">
      <span className="h-0.5 flex-1 bg-brand" aria-hidden="true" />
      <Tag
        id={id}
        className="shrink-0 text-center font-oswald text-xl font-medium tracking-[0.06em] text-white sm:text-2xl"
      >
        {white} <span className="text-brand">{accent}</span>
      </Tag>
      <span className="h-0.5 flex-1 bg-brand" aria-hidden="true" />
    </div>
  );
}

export default SectionDivider;
