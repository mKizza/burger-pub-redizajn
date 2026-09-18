function Backgroundtext() {
  return (
    <div className="background-text flex translate-x-2 rotate-[-5deg] flex-col justify-center gap-1 -translate-y-5 sm:translate-y-0">
      <h1 className="ml-5 font-anton font-normal text-[2rem]  leading-[1.1] text-white sm:text-[4rem] lg:ml-[10rem] lg:text-[4rem]">
        DEIN BURGER.
      </h1>

      <h1 className="font-anton font-normal relative inline-block ml-5 text-[3rem] font-bold leading-[1.1] text-[#ffaf01] sm:text-[4rem] lg:ml-[10rem] lg:text-[4rem]">
        DEIN PUB.
      </h1>
      <span className="font-caveat text-4xl text-white  after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[8px] sm:after:h-[12px] after:bg-[#ffaf01] after:[clip-path:polygon(0_0,_100%_40%,_96%_75%,_0_100%)] after:rounded-tl-full after:rounded-bl-full after:rounded-tr-full after:-rotate-2">
        Mitten in Milbertshofen.
      </span>
    </div>
  );
}

export default Backgroundtext;
