import IconsPage from "./IconsPage";
import WelcomePage from "./WelcomePage";

function SecondPageBackgroundImage() {
  return (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <img
          src="/second-page-background/second-page-background.jpg"
          className="background-image w-full h-[75vh] object-cover object-center sm:h-[80vh] lg:h-[75vh] lg:scale-[1.4] lg:object-contain"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      <div className="absolute inset-0 z-10 flex flex-col justify-center text-white left-3">
        <WelcomePage />
        <div className="absolute bottom-20">
          <IconsPage />
        </div>
      </div>
    </div>
  );
}

export default SecondPageBackgroundImage;
