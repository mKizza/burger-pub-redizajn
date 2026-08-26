import "./App.css";
import Backgroundpicture from "./Backgroundpicture";
import BurgerMarquee from "./BurgersMarquee";
import FooterText from "./FooterText";

import MenuTrack from "./MenuTrack";
import SecondPageBackgroundImage from "./SecondPageBackgroundImage";

function App() {
  return (
    <div>
      <div className="flex w-full flex-col gap-10">
        <div className="relative min-h-screen bg-[rgba(0,0,0,0.904)]">
          <MenuTrack />
          <Backgroundpicture />
          <FooterText />
        </div>
        <div className="h-screen flex flex-col">
          <BurgerMarquee />
          <SecondPageBackgroundImage />
        </div>
      </div>
    </div>
  );
}

export default App;
