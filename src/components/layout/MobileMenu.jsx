import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { PUB } from "../../lib/pub";
import { ButtonLink } from "../ui/Button";
import Icon from "../ui/Icon";

const LINKS = [
  { to: "/", label: "HOME", end: true },
  { to: "/menu", label: "MENU" },
  { to: "/contact", label: "KONTAKT" },
];

function MobileMenu({ open, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      id="mobile-menu"
      aria-label="Menü"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="grain m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-white backdrop:bg-transparent open:animate-fade-up md:hidden"
    >
      <div className="relative flex h-full flex-col px-5 pb-8">
        <div className="flex h-20 items-center justify-between">
          <img src="/Logo/burger-pub-logo.webp" alt="" className="w-16" />
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center text-white transition hover:text-brand"
            autoFocus
          >
            <Icon name="close" className="size-7" />
            <span className="sr-only">Menü schließen</span>
          </button>
        </div>

        <nav aria-label="Mobile Navigation" className="mt-8 flex flex-col">
          {LINKS.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-baseline gap-4 border-b border-white/10 py-4 font-anton text-5xl tracking-wide transition-colors ${
                  isActive ? "text-brand" : "text-white hover:text-brand"
                }`
              }
            >
              <span className="font-oswald text-sm text-brand/70" aria-hidden="true">
                0{index + 1}
              </span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <ButtonLink to="/contact#reservieren" onClick={onClose} size="lg" className="mt-10 w-full">
          Tisch reservieren
        </ButtonLink>

        <div className="mt-auto flex flex-col gap-4 pt-10 font-montserrat text-sm text-white/75">
          <a href={PUB.directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand">
            <Icon name="pin" className="size-5 text-brand" />
            {PUB.street}, {PUB.city}
          </a>
          <a href={PUB.phoneHref} className="flex items-center gap-3 hover:text-brand">
            <Icon name="phone" className="size-5 text-brand" />
            {PUB.phone}
          </a>
          <a href={PUB.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand">
            <Icon name="instagram" className="size-5 text-brand" />
            {PUB.instagramHandle}
          </a>
        </div>
      </div>
    </dialog>
  );
}

export default MobileMenu;
