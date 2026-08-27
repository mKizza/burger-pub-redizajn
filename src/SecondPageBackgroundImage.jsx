import { useState } from "react";
import IconsPage from "./IconsPage";
import OpenMenu from "./OpenMenu";
import WelcomePage from "./WelcomePage";

function SecondPageBackgroundImage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <img
          src="/second-page-background/second-page-background.jpg"
          className="background-image w-full h-screen object-contain object-center scale-[1.40]"
        />

        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-center text-white left-3">
        <WelcomePage />

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:w-[30vw] lg:self-center px-6 py-3 text-lg font-bold text-orange-500 border-2 border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white hover:cursor-pointer transition-all duration-300"
        >
          Open Menu
        </button>

        <div className="absolute bottom-10">
          <IconsPage />
        </div>
      </div>

      {/* Popup mora biti IZVAN z-10 diva */}
      {menuOpen && <OpenMenu setMenuOpen={setMenuOpen} />}
    </div>
  );
}

export default SecondPageBackgroundImage;
