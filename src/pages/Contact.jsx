import ContactForm from "../components/contact/ContactForm";
import ContactInfo from "../components/contact/ContactInfo";
import ContactMap from "../components/contact/ContactMap";
import ReservationForm from "../components/contact/ReservationForm";
import SplitHeading from "../components/contact/SplitHeading";
import PageHero from "../components/layout/PageHero";
import WoodBackdrop from "../components/layout/WoodBackdrop";
import PageMeta from "../components/ui/PageMeta";
import { PUB } from "../lib/pub";
import { MAX_GUESTS } from "../lib/reservation";

const STEPS = [
  ["Anfrage senden", "Datum, Uhrzeit und Personen – fertig."],
  ["Bestätigung abwarten", "Wir melden uns per E-Mail oder Telefon."],
  ["Burger genießen", "Wir freuen uns auf dich."],
];

const PANEL = "border border-white/10 bg-coal/85 p-5 shadow-[0_30px_80px_rgb(0_0_0/0.5)] backdrop-blur-sm sm:p-8";

function Contact() {
  return (
    <div className="relative isolate">
      <PageMeta
        title="Kontakt & Reservierung"
        description="Tisch reservieren im Burger Pub München: Reservierungsanfrage online senden, anrufen unter +49 89 32795957 oder vorbeikommen in der Milbertshofener Str. 34."
      />
      <WoodBackdrop />

      <PageHero accent="KONTAKT" subtitle="Wir freuen uns auf dich." />

      <div className="mx-auto flex max-w-6xl flex-col gap-24 px-5 pb-24 sm:px-8">
        <ContactInfo />

        <section
          id="reservieren"
          aria-labelledby="reservieren-titel"
          className="grid scroll-mt-24 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"
        >
          <div className="flex flex-col gap-6">
            <SplitHeading id="reservieren-titel" white="Tisch" accent="reservieren." />
            <p className="font-montserrat text-[15px] leading-relaxed text-white/75">
              Schick uns deine Reservierungsanfrage – wir bestätigen sie dir per
              E-Mail oder Telefon. Für Gruppen über {MAX_GUESTS} Personen ruf uns
              bitte an:{" "}
              <a href={PUB.phoneHref} className="whitespace-nowrap text-brand underline underline-offset-4">
                {PUB.phone}
              </a>
              .
            </p>

            <ol className="flex flex-col gap-4">
              {STEPS.map(([title, text], index) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-brand font-anton text-lg text-brand">
                    {index + 1}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-oswald text-base font-semibold uppercase tracking-[0.1em] text-white">
                      {title}
                    </span>
                    <span className="font-montserrat text-sm text-white/60">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${PANEL} border-brand/40`}>
            <ReservationForm />
          </div>
        </section>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-14">
          <section aria-labelledby="anfahrt-titel" className="flex flex-col gap-6">
            <SplitHeading id="anfahrt-titel" white="So findest" accent="du uns." />
            <ContactMap />
          </section>

          <section aria-labelledby="schreib-titel" className="flex flex-col gap-6">
            <SplitHeading id="schreib-titel" white="Schreib" accent="uns." />
            <p className="font-montserrat text-[15px] leading-relaxed text-white/75">
              Du hast Fragen oder möchtest uns etwas mitteilen? Schreib uns einfach
              eine Nachricht.
            </p>
            <div className={PANEL}>
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Contact;
