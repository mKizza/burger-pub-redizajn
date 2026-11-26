import { Link } from "react-router-dom";
import { PUB } from "../../lib/pub";
import Icon from "../ui/Icon";

const HEADING = "font-oswald text-sm font-semibold uppercase tracking-[0.2em] text-brand";
const LINK = "inline-flex items-center gap-3 text-white/75 transition-colors hover:text-brand";

function Footer() {
  return (
    <footer className="relative border-t-2 border-brand bg-black">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 font-montserrat text-sm sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.1fr_1fr_1.35fr_0.7fr] lg:px-10">
        <div className="flex flex-col gap-5">
          <img src="/Logo/burger-pub-logo.webp" alt="Burger Pub München" width="256" height="256" loading="lazy" className="w-24" />
          <p className="font-caveat text-3xl leading-tight text-white">
            Dein Burger. <span className="text-brand">Dein Pub.</span>
            <br />
            Mitten in Milbertshofen.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className={HEADING}>Besuch uns</h2>
          <a href={PUB.directionsUrl} target="_blank" rel="noopener noreferrer" className={`${LINK} items-start`}>
            <Icon name="pin" className="mt-0.5 size-5 shrink-0 text-brand" />
            <span>
              {PUB.street}
              <br />
              {PUB.city}
            </span>
          </a>
          <a href={PUB.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-oswald text-xs font-semibold uppercase tracking-[0.16em] text-brand hover:text-white">
            Route planen <Icon name="arrowRight" className="size-4" />
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className={HEADING}>Kontakt</h2>
          <a href={PUB.phoneHref} className={LINK}>
            <Icon name="phone" className="size-5 shrink-0 text-brand" />
            {PUB.phone}
          </a>
          <a href={`mailto:${PUB.email}`} className={`${LINK} break-words`}>
            <Icon name="mail" className="size-5 shrink-0 text-brand" />
            {PUB.email}
          </a>
          <a href={PUB.instagramUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
            <Icon name="instagram" className="size-5 shrink-0 text-brand" />
            {PUB.instagramHandle}
          </a>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-4">
          <h2 className={HEADING}>Seiten</h2>
          <Link to="/" className={LINK}>Home</Link>
          <Link to="/menu" className={LINK}>Menu</Link>
          <Link to="/contact" className={LINK}>Kontakt</Link>
          <Link to="/contact#reservieren" className={LINK}>Tisch reservieren</Link>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-6 font-montserrat text-xs text-white/60 sm:px-8 lg:px-10">
          © {new Date().getFullYear()} {PUB.name} · {PUB.street} · {PUB.city}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
