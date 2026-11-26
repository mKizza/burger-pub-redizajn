import { PUB } from "../../lib/pub";
import Icon from "../ui/Icon";

const [EMAIL_USER, EMAIL_DOMAIN] = PUB.email.split("@");

const ITEMS = [
  {
    icon: "pin",
    label: "Adresse",
    lines: [PUB.street, PUB.city],
    action: "Route planen",
    href: PUB.directionsUrl,
    external: true,
  },
  {
    icon: "phone",
    label: "Telefon",
    lines: [PUB.phone],
    action: "Jetzt anrufen",
    href: PUB.phoneHref,
  },
  {
    icon: "mail",
    label: "E-Mail",
    lines: [
      <>
        {EMAIL_USER}@<wbr />
        {EMAIL_DOMAIN}
      </>,
    ],
    action: "E-Mail schreiben",
    href: `mailto:${PUB.email}`,
  },
  {
    icon: "instagram",
    label: "Instagram",
    lines: [PUB.instagramHandle],
    action: "Folgen",
    href: PUB.instagramUrl,
    external: true,
  },
];

function ContactInfo() {
  return (
    <section aria-label="Kontaktdaten">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex h-full items-start gap-4 border border-white/10 bg-coal/80 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-brand/60 hover:bg-coal lg:flex-col"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-brand text-brand transition group-hover:bg-brand group-hover:text-black">
                <Icon name={item.icon} />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-oswald text-[15px] font-bold uppercase tracking-[0.12em] text-brand">
                  {item.label}
                </span>
                {item.lines.map((line, index) => (
                  <span key={index} className="font-montserrat text-[15px] leading-snug text-white [overflow-wrap:anywhere] lg:text-sm">
                    {line}
                  </span>
                ))}
                <span className="mt-1 inline-flex items-center gap-1.5 font-oswald text-xs font-semibold uppercase tracking-[0.16em] text-white/50 transition group-hover:text-brand">
                  {item.action} <Icon name="arrowRight" className="size-3.5" />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ContactInfo;
