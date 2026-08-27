import { createPortal } from "react-dom";

function TimeOpened({ setTimeOpen }) {
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4">
      <div className="flex flex-col gap-30 relative w-[90vw] h-[90vh] bg-black/50 border-2 border-orange-500 rounded-xl overflow-y-auto p-6 md:p-8">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setTimeOpen(false)}
          className="absolute top-4 right-5 z-50 text-4xl text-orange-500 hover:text-white transition-colors duration-300"
        >
          ×
        </button>

        <h2 className="text-4xl md:text-5xl font-bold text-orange-500 text-center mb-16">
          Opening Hours
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-orange-500/40 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-orange-500 mb-4">
              Monday – Friday
            </h3>

            <p className="text-3xl font-bold text-white">10:00 – 23:00</p>
          </div>

          <div className="bg-zinc-900 border border-orange-500/40 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-orange-500 mb-4">
              Saturday
            </h3>

            <p className="text-3xl font-bold text-white">13:00 – 23:00</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-zinc-900 border border-orange-500/40 rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold text-orange-500 mb-6">
              Kitchen Hours
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg text-gray-400 mb-2">Monday – Friday</p>
                <p className="text-2xl font-bold text-white">14:00 – 22:00</p>
              </div>

              <div>
                <p className="text-lg text-gray-400 mb-2">Saturday</p>
                <p className="text-2xl font-bold text-white">16:00 – 23:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default TimeOpened;
