function SecondBackgroundtext() {
  return (
    <div className="flex flex-col gap-8 px-2 sm:gap-10 lg:gap-12">
      <div className="background-text flex translate-y-0 translate-x-2 rotate-[-5deg] flex-col gap-1 sm:gap-3 lg:-translate-y-7">
        <h1 className="font-caveat text-4xl text-white">Mehr. als nur.</h1>

        <h1 className="relative ml-5 inline-block font-anton text-[3rem] font-bold leading-[1.1] text-[#ffaf01] sm:text-[4rem] lg:ml-[10rem] lg:text-[6rem] after:absolute after:-bottom-2 after:left-0 after:h-[8px] after:w-1/2 after:-rotate-2 after:rounded-bl-full after:rounded-tl-full after:rounded-tr-full after:bg-[#ffaf01] after:content-[''] after:[clip-path:polygon(0_0,_100%_40%,_96%_75%,_0_100%)] sm:after:h-[12px]">
          BURGER.
        </h1>
      </div>

      <p className="translate-x-2 font-montserrat text-sm leading-6 text-white">
        Ein Ort für guten Geschmack, gute Leute
        <br />
        und unvergessliche Momente. Mit Leidenschaft
        <br />
        für Qualität, regionale Zutaten und echte
        <br />
        Burger-Liebe.
      </p>
    </div>
  );
}

export default SecondBackgroundtext;
