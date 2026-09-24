import MenuTrack from "./MenuTrack";
import UnsereMenuNaslov from "./UnserMenuNaslov";
import MenuSection from "./components/MenuSection";
import menuData from "../menu.json";

function Menu() {
  return (
    <div
      className="relative min-h-screen w-full
        bg-[url('/menu-background-image/menu-background-image.png')]
        bg-cover
        bg-center
        bg-fixed"
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/65" />

      {/* CONTENT */}
      <div className="relative z-10 w-full">
        <div className="relative h-[80px]">
          <MenuTrack />
        </div>

        <UnsereMenuNaslov />

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
          {Object.entries(menuData).map(([key, section], index) => (
            <MenuSection key={key} section={section} first={index === 0} />
          ))}
        </main>
      </div>
    </div>
  );
}

export default Menu;
