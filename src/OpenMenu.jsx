import menu from "../menu.json";

function OpenMenu({ setMenuOpen }) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-[90vw] h-[90vh] bg-black border-2 border-orange-500 rounded-xl overflow-y-auto p-6 md:p-8">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-5 z-20 text-4xl text-orange-500 hover:text-white transition-colors duration-300 fixed"
        >
          ×
        </button>

        {/* TITLE */}
        <h2 className="text-4xl md:text-5xl font-bold text-orange-500 text-center mb-10">
          Our Menu
        </h2>

        {/* BURGERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((burger) => (
            <div
              key={burger.id}
              className="bg-zinc-900 border border-orange-500/40 rounded-xl overflow-hidden hover:border-orange-500 transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={burger.image}
                  alt={burger.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">
                    {burger.name}
                  </h3>

                  <span className="text-lg font-bold text-orange-500 whitespace-nowrap">
                    €{burger.price}
                  </span>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed">
                  {burger.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OpenMenu;
