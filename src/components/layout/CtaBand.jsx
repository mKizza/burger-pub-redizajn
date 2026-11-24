import { PUB } from "../../lib/pub";
import { ButtonLink } from "../ui/Button";
import Icon from "../ui/Icon";

function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="grain relative overflow-hidden bg-brand text-black">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10 lg:py-16">
        <div className="flex -rotate-2 flex-col">
          <p className="font-caveat text-3xl sm:text-4xl">Hunger bekommen?</p>
          <h2 id="cta-title" className="font-anton text-5xl leading-none sm:text-6xl">
            TISCH RESERVIEREN.
          </h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ButtonLink
            to="/contact#reservieren"
            size="lg"
            className="border-black! bg-black! text-brand! hover:bg-transparent! hover:text-black! hover:shadow-none!"
          >
            Jetzt anfragen <Icon name="arrowRight" className="size-5" />
          </ButtonLink>
          <a href={PUB.phoneHref} className="inline-flex items-center gap-2 font-oswald text-base font-semibold tracking-wide hover:underline">
            <Icon name="phone" className="size-5" />
            {PUB.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

export default CtaBand;
