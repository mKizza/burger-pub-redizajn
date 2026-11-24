import { formatPrice, imageUrl } from "../../lib/format";
import { dishAnchor } from "../../lib/menu";

function DishCard({ item }) {
  return (
    <article
      id={dishAnchor(item)}
      className="group flex scroll-mt-40 flex-col overflow-hidden border border-white/10 bg-coal/90 shadow-[0_20px_50px_rgb(0_0_0/0.45)] transition-colors hover:border-brand/50"
    >
      <div className="aspect-[4/3] overflow-hidden bg-char">
        <img
          src={imageUrl(item.image)}
          alt={item.name}
          width="640"
          height="480"
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-oswald text-xl font-bold uppercase leading-tight tracking-wide text-white">
            {item.name}
          </h3>
          <span className="shrink-0 font-oswald text-xl font-bold text-brand">
            {formatPrice(item.price)}
          </span>
        </div>

        {item.description && (
          <p className="font-montserrat text-sm leading-relaxed text-white/60">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

function DishRow({ item }) {
  return (
    <li id={dishAnchor(item)} className="scroll-mt-40 px-3 py-3 -mx-3">
      <div className="flex items-baseline gap-3">
        <h3 className="font-oswald text-lg font-semibold uppercase leading-snug tracking-wide text-white">
          {item.name}
        </h3>
        <span className="min-w-6 flex-1 -translate-y-1 border-b-2 border-dotted border-white/20" aria-hidden="true" />
        <span className="shrink-0 font-oswald text-lg font-bold text-brand">
          {formatPrice(item.price)}
        </span>
      </div>

      {item.description && (
        <p className="mt-1 max-w-[46ch] font-montserrat text-sm leading-relaxed text-white/55">
          {item.description}
        </p>
      )}
    </li>
  );
}

function MenuSection({ section }) {
  const withPhoto = section.items.filter((item) => item.image);
  const withoutPhoto = section.items.filter((item) => !item.image);
  const titleId = `${section.slug}-titel`;

  return (
    <section id={section.slug} aria-labelledby={titleId} className="scroll-mt-36 lg:scroll-mt-40">
      <div className="flex items-center gap-4">
        <h2 id={titleId} className="shrink-0 font-oswald text-2xl font-bold uppercase tracking-wide text-brand md:text-3xl">
          {section.title}
        </h2>
        <span className="h-0.5 flex-1 bg-brand/80" aria-hidden="true" />
      </div>

      {withPhoto.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {withPhoto.map((item) => (
            <DishCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {withoutPhoto.length > 0 && (
        <ul
          className={`grid gap-x-12 gap-y-1 border border-white/10 bg-coal/85 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-6 lg:grid-cols-2 ${
            withPhoto.length > 0 ? "mt-6" : "mt-8"
          }`}
        >
          {withoutPhoto.map((item) => (
            <DishRow key={item._id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default MenuSection;
