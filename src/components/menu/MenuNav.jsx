import { useEffect, useRef } from "react";

function MenuNav({ sections, activeSlug, onSelect }) {
  const listRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector(`[data-slug="${CSS.escape(activeSlug ?? "")}"]`);

    if (!list || !chip) return;

    list.scrollTo({
      left: chip.offsetLeft - list.clientWidth / 2 + chip.clientWidth / 2,
      behavior: "smooth",
    });
  }, [activeSlug]);

  return (
    <nav
      aria-label="Kategorien"
      className="sticky top-16 z-30 border-y border-white/10 bg-ink/90 backdrop-blur-md lg:top-20"
    >
      <ul
        ref={listRef}
        className="no-scrollbar mx-auto flex max-w-6xl snap-x gap-2 overflow-x-auto px-5 py-3 sm:px-8"
      >
        {sections.map((section) => {
          const isActive = section.slug === activeSlug;

          return (
            <li key={section.id} className="snap-start">
              <a
                href={`#${section.slug}`}
                data-slug={section.slug}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(section.slug);
                }}
                className={`inline-flex h-9 items-center whitespace-nowrap border px-4 font-oswald text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-brand bg-brand text-black"
                    : "border-white/15 text-white/80 hover:border-brand hover:text-brand"
                }`}
              >
                {section.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MenuNav;
