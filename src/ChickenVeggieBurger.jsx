import menuData from "../menu.json";

function ChickenVeggieBurger() {
  const chickenVeggie = menuData.chickenVeggieBurger;

  return (
    <section className="mt-10 w-full">
      {/* NASLOV KATEGORIJE */}
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 font-oswald text-[18px] font-bold uppercase text-[#ffaf01]">
          {chickenVeggie.title}
        </h2>

        <div className="h-[1px] flex-1 bg-[#ffaf01]" />
      </div>

      {/* BURGERI */}
      <div className="mt-5 flex flex-col gap-6">
        {chickenVeggie.items.map((burger) => (
          <div key={burger.id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-oswald text-[16px] font-bold uppercase text-white">
                {burger.name}
              </h3>

              <span className="shrink-0 font-oswald text-[16px] font-bold text-white">
                {burger.price}
              </span>
            </div>

            <p className="mt-1 pr-8 font-oswald text-[12px] leading-[1.5] text-white/70">
              {burger.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ChickenVeggieBurger;
