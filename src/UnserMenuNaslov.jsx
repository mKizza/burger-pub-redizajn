function UnsereMenuNaslov() {
  return (
    <div className="relative flex w-full items-center justify-center">
      <div className="absolute left-0 top-1/2 z-0 h-[2px] w-full bg-[#ffaf01]" />

      <span className="relative z-10 inline-block w-60 bg-black text-center">
        <span className="text-xl font-oswald font-normal text-white">
          UNSER{" "}
        </span>
        <span className="text-xl font-oswald font-normal text-[#ffaf01]">
          MENU
        </span>
      </span>
    </div>
  );
}

export default UnsereMenuNaslov;
