import Backgroundtext from "./Backgroundtext";
import IconsPage from "./IconsPage";

function Backgroundpicture() {
  return (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <img
          src="/Background-image/burger-u-ruci.png"
          className="background-image h-[42vh] w-full object-cover object-center sm:h-[45vh] lg:h-[70vh]"
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
