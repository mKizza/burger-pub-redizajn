function MenuSection({ section, first = false }) {
  return (
    <section className={`${first ? "" : "mt-14"} w-full`}>
      {/* CATEGORY TITLE */}
      <div className="mb-7 flex items-center gap-4">
        <h2 className="shrink-0 font-oswald text-[24px] font-bold uppercase text-[#ffaf01] md:text-[28px]">
          {section.title}
        </h2>

        <div className="h-[2px] flex-1 bg-[#ffaf01]" />
      </div>

      {/* ITEMS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {section.items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden border border-white/10 bg-[#111]/95 shadow-xl"
          >
            {/* IMAGE */}
            {item.image ? (
              <div className="h-[230px] w-full overflow-hidden sm:h-[280px] lg:h-[250px]">
                <img
                  src={
                    item.image?.startsWith("/uploads/")
                      ? `http://localhost:5000${item.image}`
                      : item.image
                  }
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-[150px] w-full items-center justify-center bg-[#181818]">
                <span className="font-oswald text-sm tracking-[0.2em] text-white/20 uppercase">
                  Burger Pub
                </span>
              </div>
            )}

            {/* CONTENT */}
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-5">
                <h3 className="font-oswald text-[21px] leading-tight font-bold uppercase text-white sm:text-[23px]">
                  {item.name}
                </h3>

                <span className="shrink-0 font-oswald text-[21px] font-bold text-[#ffaf01] sm:text-[23px]">
                  {item.price}
                </span>
              </div>

              {item.description && (
                <p className="mt-4 max-w-[90%] font-oswald text-[15px] leading-[1.6] text-white/60 sm:text-[16px]">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MenuSection;
