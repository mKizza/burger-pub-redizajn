import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useScrolled } from "../../hooks/useScrolled";
import Icon from "../ui/Icon";
import MobileMenu from "./MobileMenu";

const NAV_LINK =
  "relative font-oswald text-[15px] font-medium tracking-[0.14em] text-white transition-colors hover:text-brand after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-brand after:transition-transform after:duration-300";

function navLinkClass({ isActive }) {
  return `${NAV_LINK} ${isActive ? "text-brand after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`;
}

function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 48rem)");
  const mobileMenuOpen = menuOpen && !isDesktop;

  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-[70] bg-brand px-4 py-2 font-oswald font-semibold uppercase text-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Zum Inhalt springen
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
          scrolled
            ? "border-white/10 bg-ink/85 backdrop-blur-md"
            : "border-transparent bg-gradient-to-b from-black/75 to-transparent"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:px-10 ${
            scrolled ? "h-16 lg:h-20" : "h-20 lg:h-24"
          }`}
        >
          <Link to="/" className="shrink-0">
            <img
              src="/Logo/burger-pub-logo.webp"
              alt="Burger Pub München – zur Startseite"
              width="256"
              height="256"
              className={`h-auto transition-[width] duration-300 ${
                scrolled ? "w-12 lg:w-16" : "w-16 lg:w-20"
              }`}
            />
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden items-center gap-9 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              HOME
            </NavLink>
            <NavLink to="/menu" className={navLinkClass}>
              MENU
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `inline-flex h-11 items-center bg-brand px-5 font-oswald text-[15px] font-semibold tracking-[0.1em] text-black transition hover:bg-brand-soft hover:shadow-[0_0_28px_rgb(255_175_1/0.4)] ${
                  isActive ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
                }`
              }
            >
              KONTAKT | RESERVIEREN
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/contact#reservieren"
              className="inline-flex h-10 items-center bg-brand px-3.5 font-oswald text-[13px] font-semibold tracking-[0.1em] text-black"
            >
              RESERVIEREN
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="grid size-11 place-items-center text-white transition hover:text-brand"
            >
              <Icon name="menu" className="size-7" />
              <span className="sr-only">Menü öffnen</span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Header;
