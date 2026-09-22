import burgers from "../burgers.json";

function BurgerMarquee() {
  return (
    <div className="flex w-max animate-marquee gap-6">
      {[...burgers, ...burgers].map((burger, index) => (
        <div
          key={`${burger.id}-${index}`}
          className="mx-3 flex shrink-0 flex-col items-center"
        >
          <img
            src={burger.image}
            alt={burger.name}
            className="h-28 w-28 rounded-[8px] border-2 border-[#f58220] object-contain lg:h-36 lg:w-36"
          />

          <span className="mt-2 whitespace-nowrap font-bold text-white">
            {burger.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default BurgerMarquee;
