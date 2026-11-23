import Backgroundtext from "./Backgroundtext";
import IconsPage from "./IconsPage";

function Backgroundpicture() {
  return (
    <div className="relative">
      <div className="relative flex min-h-[42vh] flex-col sm:min-h-[45vh] lg:min-h-[70vh]">
        <img
          src="/Background-image/burger-u-ruci.png"
          className="background-image absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="h-20 shrink-0 sm:h-24 lg:h-30" />

        <div className="relative z-10 flex flex-1 items-center justify-start text-white">
          <Backgroundtext />
        </div>

        <div className="h-8 shrink-0" />

        <IconsPage />
      </div>

      <div className="h-12" />
    </div>
  );
}

export default Backgroundpicture;
