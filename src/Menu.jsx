import MenuTrack from "./MenuTrack";
import UnsereMenuNaslov from "./UnserMenuNaslov";
import BeefBurger from "./BeefBurger";
import ChickenVeggieBurger from "./ChickenVeggieBurger";
import Hauptgerichte from "./Hauptgerichte";
import BurgerPlatte from "./BurgerPlatte";
import Salate from "./Salate";
import Beilagen from "./Beilagen";
import Dips from "./Dips";

function Menu() {
  return (
    <div
      className="relative min-h-screen w-full bg-[url('/menu-background-image/menu-background-image.png')]
        bg-cover
        bg-center
        bg-fixed"
    >
      <div className="relative w-full">
        <div className="relative h-[80px]">
          <MenuTrack centered />
        </div>

        <UnsereMenuNaslov />

        <main className="w-full px-5 pb-10">
          <BeefBurger />
          <ChickenVeggieBurger />
          <Hauptgerichte />
          <BurgerPlatte />
          <Salate />
          <Beilagen />
          <Dips />
        </main>
      </div>
    </div>
  );
}

export default Menu;
