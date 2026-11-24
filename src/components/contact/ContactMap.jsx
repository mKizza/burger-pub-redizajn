import { useState } from "react";
import { PUB } from "../../lib/pub";
import { Button, ButtonAnchor } from "../ui/Button";
import Icon from "../ui/Icon";

function ContactMap() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] overflow-hidden border border-brand/50 bg-coal sm:aspect-[16/10]">
        {loaded ? (
          <iframe
            title="Karte: Burger Pub München, Milbertshofener Str. 34"
            src={PUB.mapEmbedUrl}
            className="size-full border-0 [filter:grayscale(30%)_invert(90%)_hue-rotate(180deg)_brightness(85%)_contrast(90%)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,rgb(255_175_1/0.12),transparent_65%)] p-6 text-center">
            <span className="grid size-14 place-items-center rounded-full border-2 border-brand text-brand">
              <Icon name="map" className="size-6" />
            </span>
            <p className="font-oswald text-lg uppercase tracking-wide text-white">
              {PUB.street}, {PUB.city}
            </p>
            <Button variant="outline" size="sm" onClick={() => setLoaded(true)}>
              Karte laden
            </Button>
            <p className="max-w-xs font-montserrat text-xs leading-relaxed text-white/50">
              Beim Laden der Karte werden Daten an Google übertragen.
            </p>
          </div>
        )}
      </div>

      <ButtonAnchor
        href={PUB.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        className="self-stretch sm:self-start"
      >
        In Google Maps öffnen <Icon name="arrowRight" className="size-4" />
      </ButtonAnchor>
    </div>
  );
}

export default ContactMap;
