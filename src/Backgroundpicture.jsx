import Backgroundtext from "./Backgroundtext";
import IconsPage from "./IconsPage";

function Backgroundpicture() {
  return (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <img
          src="/Background-image/burger-u-ruci.png"
          className="background-image w-full h-[35vh] lg:h-[70vh] object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-start text-white">
        <Backgroundtext />
      </div>
      <IconsPage />
    </div>
  );
}

export default Backgroundpicture;
