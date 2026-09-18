import Backgroundpicture from "./Backgroundpicture";
import BurgerMarquee from "./BurgersMarquee";
import BurgerWallFooter from "./BurgerWallFooter";
import FooterText from "./FooterText";
import MenuTrack from "./MenuTrack";

function Home() {
  return (
    <div className="w-full h-screen">
      <div className="flex h-full lg:h-auto flex-col overflow-hidden bg-[rgba(0,0,0,0.904)]">
        <MenuTrack />
        <Backgroundpicture />

        <div className="flex flex-col overflow-hidden gap-7 -translate-y-10 lg:translate-y-5">
          <FooterText />

          <div className="w-full overflow-hidden">
            <BurgerMarquee />
          </div>
        </div>

        <div className="flex-1 overflow-hidden lg:max-h-[85vh]">
          <BurgerWallFooter />
        </div>
      </div>
    </div>
  );
}

export default Home;
