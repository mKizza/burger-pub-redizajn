import CtaBand from "../components/layout/CtaBand";
import Favorites from "../components/home/Favorites";
import Hero from "../components/home/Hero";
import WallSection from "../components/home/WallSection";
import PageMeta from "../components/ui/PageMeta";

function Home() {
  return (
    <>
      <PageMeta description="Burger Pub München – dein Burger, dein Pub, mitten in Milbertshofen. Menü ansehen und Tisch reservieren: Milbertshofener Str. 34, 80807 München." />
      <Hero />
      <Favorites />
      <WallSection />
      <CtaBand />
    </>
  );
}

export default Home;
