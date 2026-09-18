function SecondBackgroundtext() {
  return (
    <div className="flex flex-col gap-3">
      <div className="background-text rotate-[-5deg] flex flex-col gap-3 -translate-y-7  translate-x-2">
        <h1 className="font-caveat text-4xl text-white">Mehr. als nur.</h1>

        <h1 className="font-anton font-normal relative inline-block ml-5 text-[3rem] font-bold leading-[1.1] text-[#ffaf01] sm:text-[4rem] lg:ml-[10rem] lg:text-[6rem] after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-1/2 after:h-[8px] sm:after:h-[12px] after:bg-[#ffaf01] after:[clip-path:polygon(0_0,_100%_40%,_96%_75%,_0_100%)] after:rounded-tl-full after:rounded-bl-full after:rounded-tr-full after:-rotate-2">
          BURGER.
        </h1>
      </div>
      <p className="text-sm leading-6 text-white translate-x-2 font-montserrat">
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
