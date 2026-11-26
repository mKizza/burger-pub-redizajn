import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CtaBand from "../components/layout/CtaBand";
import PageHero from "../components/layout/PageHero";
import WoodBackdrop from "../components/layout/WoodBackdrop";
import MenuNav from "../components/menu/MenuNav";
import MenuSection from "../components/menu/MenuSection";
import { MenuEmptySearch, MenuError, MenuSkeleton } from "../components/menu/MenuStates";
import Icon from "../components/ui/Icon";
import PageMeta from "../components/ui/PageMeta";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { useMenu } from "../hooks/useMenu";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { pluralize } from "../lib/format";
import { buildMenu, countItems, filterMenu } from "../lib/menu";

function highlight(element) {
  element.classList.remove("animate-flash");
  void element.offsetWidth;
  element.classList.add("animate-flash");
}

function Menu() {
  const { status, food, categories, retry } = useMenu();
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);
  const deferredQuery = useDeferredValue(query);
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();

  const sections = buildMenu(categories, food);
  const visibleSections = filterMenu(sections, deferredQuery);
  const matches = countItems(visibleSections);
  const activeSlug = useScrollSpy(visibleSections.map((section) => section.slug));

  useEffect(() => {
    if (status !== "ready" || !location.hash) return;

    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));

    if (!target) return;

    target.scrollIntoView({ block: target.tagName === "SECTION" ? "start" : "center" });

    if (target.tagName !== "SECTION") highlight(target);
  }, [status, location.hash]);

  function scrollToSection(slug) {
    const target = document.getElementById(slug);

    if (!target) return;

    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `#${slug}`);
  }

  return (
    <div className="relative isolate">
      <PageMeta
        title="Menü"
        description="Das Menü vom Burger Pub München: Beef Burger, Chicken & Veggie Burger, Fingerfood, Salate, Beilagen und Dips mit Preisen."
      />
      <WoodBackdrop />

      <PageHero white="UNSER" accent="MENU">
        <div role="search" className="relative mt-6 w-full max-w-md animate-fade-up [animation-delay:120ms]">
          <label htmlFor="menu-search" className="sr-only">
            Gericht suchen
          </label>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/45" />
          <input
            ref={searchRef}
            id="menu-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Gericht suchen …"
            autoComplete="off"
            enterKeyHint="search"
            className="h-12 w-full border border-white/15 bg-black/55 pr-12 pl-12 font-oswald text-[15px] tracking-wide text-white backdrop-blur-sm placeholder:text-white/40 focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center text-white/50 transition hover:text-white"
            >
              <Icon name="close" className="size-5" />
              <span className="sr-only">Suche löschen</span>
            </button>
          )}
        </div>
        <p className="min-h-5 font-montserrat text-sm text-white/60" aria-live="polite">
          {status === "ready" && deferredQuery.trim()
            ? pluralize(matches, "Treffer", "Treffer")
            : ""}
        </p>
      </PageHero>

      {status === "ready" && visibleSections.length > 0 && (
        <MenuNav sections={visibleSections} activeSlug={activeSlug} onSelect={scrollToSection} />
      )}

      <div className="mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8 lg:pt-16">
        {status === "loading" && (
          <>
            <p className="sr-only" role="status">
              Menü wird geladen …
            </p>
            <MenuSkeleton />
          </>
        )}

        {status === "error" && <MenuError onRetry={retry} />}

        {status === "ready" && visibleSections.length === 0 && deferredQuery.trim() && (
          <MenuEmptySearch query={deferredQuery.trim()} onClear={() => setQuery("")} />
        )}

        {status === "ready" && sections.length === 0 && !deferredQuery.trim() && (
          <p className="py-16 text-center font-oswald text-xl uppercase tracking-wide text-white/70">
            Unser Menü wird gerade aktualisiert.
          </p>
        )}

        {status === "ready" && visibleSections.length > 0 && (
          <div className="flex flex-col gap-20">
            {visibleSections.map((section) => (
              <MenuSection key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>

      <CtaBand />
    </div>
  );
}

export default Menu;
