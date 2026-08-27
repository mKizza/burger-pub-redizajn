import burgers from "../burgers.json";

function BurgerMarquee() {
  return (
    <div className="absolute top-0 left-0 z-20 w-full overflow-hidden background">
      <div className="flex w-max animate-marquee gap-6">
        {[...burgers, ...burgers].map((burger, index) => (
          <div
            key={`${burger.id}-${index}`}
            className="mx-3 flex flex-col items-center"
          >
            <img
              src={burger.image}
              alt={burger.name}
              className="h-28 w-28 lg:h-36 lg:w-36 object-contain text-white border-2 border-[#f58220] rounded-[8px]"
            />
            <span className="mt-2 text-white font-bold">{burger.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BurgerMarquee;
