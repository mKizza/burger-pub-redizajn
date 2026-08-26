import Backgroundtext from "./Backgroundtext";

function Backgroundpicture() {
  return (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <img
          src="/Background-image/burger-1-copy.jpg"
          className="background-image w-full h-[75vh] object-cover object-center sm:h-[80vh]"
        />
      </div>
      <div className="absolute inset-0 z-10 flex items-center justify-start text-white">
        <Backgroundtext />
      </div>
    </div>
  );
}

export default Backgroundpicture;
