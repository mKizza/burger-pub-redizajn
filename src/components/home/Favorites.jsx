import { Link } from "react-router-dom";
import fallbackBurgers from "../../../burgers.json";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import { useMenu } from "../../hooks/useMenu";
import { formatPrice, imageUrl } from "../../lib/format";
import { dishAnchor, pickFavorites } from "../../lib/menu";
import { ButtonLink } from "../ui/Button";
import Icon from "../ui/Icon";
import SectionDivider from "../ui/SectionDivider";

const MIN_TRACK_ITEMS = 10;

const FALLBACK = fallbackBurgers.map((burger) => ({
  key: `static-${burger.id}`,
  name: burger.name,
  image: burger.image,
  price: "",
  to: "/menu",
}));

function toCard(item) {
  return {
    key: item._id,
    name: item.name,
    image: imageUrl(item.image),
    price: formatPrice(item.price),
    to: `/menu#${dishAnchor(item)}`,
  };
}

function FavoriteCard({ card, hidden = false }) {
  return (
    <Link
      to={card.to}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden ? true : undefined}
      className="group flex w-44 shrink-0 snap-start flex-col gap-3 sm:w-56"
    >
      <div className="aspect-square overflow-hidden rounded-lg border-2 border-ember bg-char shadow-[0_12px_30px_rgb(0_0_0/0.5)] transition group-hover:border-brand group-hover:shadow-[0_0_30px_rgb(245_130_32/0.35)]">
        <img
          src={card.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-700 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="line-clamp-2 font-oswald text-[15px] font-semibold uppercase leading-snug tracking-wide text-white transition-colors group-hover:text-brand">
          {card.name}
        </span>{" "}
        {card.price && (
          <span className="font-oswald text-[15px] font-semibold text-brand">{card.price}</span>
        )}
      </div>
    </Link>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden px-5" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="flex w-44 shrink-0 flex-col gap-3 sm:w-56">
          <div className="aspect-square animate-pulse rounded-lg bg-white/5" />
          <div className="h-4 w-3/4 animate-pulse bg-white/5" />
        </div>
      ))}
    </div>
  );
}

function Favorites() {
  const { status, food, categories } = useMenu();
  const reducedMotion = usePrefersReducedMotion();

  const favorites = pickFavorites(categories, food).map(toCard);
  const cards = favorites.length > 0 ? favorites : FALLBACK;

  let track = cards;
  while (track.length > 0 && track.length < MIN_TRACK_ITEMS) {
    track = [...track, ...cards];
  }

  return (
    <section id="favoriten" aria-labelledby="favoriten-title" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionDivider id="favoriten-title" white="UNSERE" accent="FAVORITEN" />
      </div>

      <div className="mt-10 sm:mt-12">
        {status === "loading" ? (
          <FavoritesSkeleton />
        ) : reducedMotion ? (
          <div className="no-scrollbar flex snap-x gap-6 overflow-x-auto px-5 pb-2 sm:px-8">
            {cards.map((card) => (
              <FavoriteCard key={card.key} card={card} />
            ))}
          </div>
        ) : (
          <div className="group/marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div className="flex w-max animate-marquee gap-6 group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex gap-6"
                  aria-hidden={copy === 1 ? true : undefined}
                  inert={copy === 1 ? true : undefined}
                >
                  {track.map((card, index) => (
                    <FavoriteCard
                      key={`${card.key}-${index}`}
                      card={card}
                      hidden={copy === 1 || index >= cards.length}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-center px-5">
        <ButtonLink to="/menu" variant="outline">
          Ganzes Menü ansehen <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
      </div>
    </section>
  );
}

export default Favorites;
