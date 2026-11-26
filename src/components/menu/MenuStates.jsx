import { PUB } from "../../lib/pub";
import { Button } from "../ui/Button";
import Icon from "../ui/Icon";

export function MenuSkeleton() {
  return (
    <div className="flex flex-col gap-16" aria-hidden="true">
      {[0, 1].map((section) => (
        <div key={section} className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-56 animate-pulse bg-white/10" />
            <div className="h-0.5 flex-1 bg-white/10" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div key={card} className="border border-white/5 bg-coal/80">
                <div className="aspect-[4/3] animate-pulse bg-white/5" />
                <div className="flex flex-col gap-3 p-6">
                  <div className="h-5 w-2/3 animate-pulse bg-white/10" />
                  <div className="h-3 w-full animate-pulse bg-white/5" />
                  <div className="h-3 w-4/5 animate-pulse bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MenuError({ onRetry }) {
  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-5 border border-red-400/30 bg-coal/90 px-6 py-10 text-center sm:px-10">
      <span className="grid size-14 place-items-center rounded-full border-2 border-red-300/70 text-red-300">
        <Icon name="alert" className="size-7" />
      </span>
      <h2 className="font-oswald text-2xl font-bold uppercase tracking-wide text-white">
        Das Menü konnte nicht geladen werden.
      </h2>
      <p className="font-montserrat text-sm leading-relaxed text-white/65">
        Bitte versuch es gleich noch einmal – oder ruf uns an:{" "}
        <a href={PUB.phoneHref} className="whitespace-nowrap text-brand underline underline-offset-4">
          {PUB.phone}
        </a>
      </p>
      <Button onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}

export function MenuEmptySearch({ query, onClear }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Icon name="search" className="size-10 text-white/30" />
      <p className="font-oswald text-xl uppercase tracking-wide text-white">
        Nichts gefunden für „{query}“
      </p>
      <Button variant="outline" size="sm" onClick={onClear}>
        Suche zurücksetzen
      </Button>
    </div>
  );
}
