import menuData from "../menu.json";

function Dips() {
  const dips = menuData.dips;

  return (
    <section className="mt-10 w-full">
      <div className="flex items-center gap-3">
        <h2 className="shrink-0 font-oswald text-[18px] font-bold uppercase text-[#ffaf01]">
          {dips.title}
        </h2>

        <div className="h-[1px] flex-1 bg-[#ffaf01]" />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {dips.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3"
          >
            <h3 className="font-oswald text-[16px] font-bold uppercase text-white">
              {item.name}
            </h3>

            <span className="shrink-0 font-oswald text-[16px] font-bold text-white">
              {item.price}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Dips;
