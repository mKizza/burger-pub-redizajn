import SecondBackgroundtext from "./SecondBackgroundtext";

function BurgerWallFooter() {
  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <img
          src="/second-page-background/WallBurgerPub.png"
          alt="Wall"
          className="w-full h-full object-cover object-[70%_100%] border-filter"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-start -translate-y-10">
        <SecondBackgroundtext />
      </div>
    </div>
  );
}

export default BurgerWallFooter;
