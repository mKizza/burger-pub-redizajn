import { ButtonLink } from "../ui/Button";
import Icon from "../ui/Icon";

function WallSection() {
  return (
    <section aria-labelledby="wall-title" className="relative isolate overflow-hidden">
      <img
        src="/second-page-background/WallBurgerPub.webp"
        alt=""
        width="1672"
        height="941"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover object-[80%_30%] md:object-[70%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/10 md:bg-gradient-to-r md:from-black/90 md:via-black/55 md:to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-ink to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-black to-transparent" aria-hidden="true" />

      <div className="mx-auto flex min-h-[640px] max-w-7xl flex-col justify-end px-5 pt-64 pb-20 sm:px-8 md:min-h-[720px] md:justify-center md:pt-24 lg:px-10">
        <div className="flex origin-left -rotate-[5deg] flex-col items-start gap-1">
          <p className="font-caveat text-5xl text-white sm:text-6xl">Mehr. als nur.</p>
          <h2
            id="wall-title"
            className="swoosh font-anton text-[clamp(4.5rem,15vw,9rem)] leading-[0.95] tracking-wide text-brand [--swoosh-width:55%]"
          >
            BURGER.
          </h2>
        </div>

        <p className="mt-14 max-w-md font-montserrat text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
          Ein Ort für guten Geschmack, gute Leute und unvergessliche Momente. Mit
          Leidenschaft für Qualität, regionale Zutaten und echte Burger-Liebe.
        </p>

        <div className="mt-10">
          <ButtonLink to="/menu" variant="outline" size="lg">
            Zum Menü <Icon name="arrowRight" className="size-5" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default WallSection;
