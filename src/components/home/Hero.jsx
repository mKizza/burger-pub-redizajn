import { PUB } from "../../lib/pub";
import { ButtonLink } from "../ui/Button";
import Icon from "../ui/Icon";

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <img
        src="/Background-image/burger-u-ruci.webp"
        alt=""
        width="1122"
        height="1402"
        fetchPriority="high"
        className="absolute inset-0 -z-20 size-full object-cover object-[60%_75%] brightness-[0.7] md:object-center md:brightness-[0.55]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/35 to-black/60 md:bg-gradient-to-r md:from-black/85 md:via-black/45 md:to-black/10" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-32 pb-24 sm:px-8 lg:px-10">
        <div className="flex origin-left -rotate-[5deg] animate-fade-up flex-col items-start">
          <h1 id="hero-title" className="flex flex-col font-anton leading-[0.98] tracking-wide">
            <span className="text-[clamp(3.1rem,11vw,7.25rem)] text-white">DEIN BURGER.</span>
            <span className="text-[clamp(3.6rem,13vw,8.5rem)] text-brand">DEIN PUB.</span>
          </h1>
          <p className="swoosh mt-1 font-caveat text-[clamp(2.1rem,6.5vw,3.75rem)] leading-tight text-white">
            Mitten in Milbertshofen.
          </p>
        </div>

        <div className="mt-16 flex animate-fade-up flex-col gap-3 [animation-delay:120ms] sm:flex-row">
          <ButtonLink to="/menu" size="lg">
            Menü ansehen <Icon name="arrowRight" className="size-5" />
          </ButtonLink>
          <ButtonLink to="/contact#reservieren" variant="ghost" size="lg" className="backdrop-blur-sm">
            Tisch reservieren
          </ButtonLink>
        </div>

        <a
          href={PUB.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-12 inline-flex animate-fade-up items-center gap-4 self-start [animation-delay:240ms]"
        >
          <span className="grid size-12 place-items-center rounded-full border-2 border-brand text-brand transition group-hover:bg-brand group-hover:text-black">
            <Icon name="pin" />
          </span>
          <span className="flex flex-col font-montserrat text-[15px] leading-snug text-white">
            <span>{PUB.street}</span>
            <span>{PUB.city}</span>
            <span className="mt-1 font-oswald text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Route planen →
            </span>
          </span>
        </a>
      </div>

      <a
        href="#favoriten"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/60 transition hover:text-brand sm:block"
      >
        <Icon name="chevronDown" className="size-8 motion-safe:animate-bounce" />
        <span className="sr-only">Weiter zu unseren Favoriten</span>
      </a>
    </section>
  );
}

export default Hero;
