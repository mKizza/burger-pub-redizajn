import { ButtonLink } from "../components/ui/Button";
import PageMeta from "../components/ui/PageMeta";
import WoodBackdrop from "../components/layout/WoodBackdrop";

function NotFound() {
  return (
    <div className="relative isolate">
      <PageMeta title="Seite nicht gefunden" />
      <meta name="robots" content="noindex" />
      <WoodBackdrop />

      <section className="mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center gap-8 px-5 pt-32 pb-20 text-center">
        <p className="font-anton text-[clamp(7rem,30vw,14rem)] leading-none text-brand/90 [text-shadow:0_0_60px_rgb(255_175_1/0.35)]">
          404
        </p>
        <div className="flex -rotate-3 flex-col items-center">
          <p className="font-caveat text-4xl text-white">Ups.</p>
          <h1 className="font-anton text-4xl tracking-wide text-white sm:text-5xl">
            HIER GIBT&apos;S KEINE BURGER.
          </h1>
        </div>
        <p className="max-w-md font-montserrat text-white/65">
          Die Seite, die du suchst, existiert nicht (mehr). Aber unser Menü ist nur
          einen Klick entfernt.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/menu">Zum Menü</ButtonLink>
          <ButtonLink to="/" variant="ghost">
            Zur Startseite
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

export default NotFound;
