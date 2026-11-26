import { useEffect, useState } from "react";
import { API_URL } from "./config";

function BurgerMarquee() {
  const [burgers, setBurgers] = useState([]);

  useEffect(() => {
    async function getBurgers() {
      try {
        const res = await fetch(`${API_URL}/api/food`);

        if (!res.ok) {
          throw new Error("Could not fetch burgers");
        }

        const data = await res.json();
        const food = data.data.food;

        const beefBurgers = food
          .filter((item) => item.category?._id === "6ab385bcbca0aa6961595844")
          .slice(0, 5);

        const cevapi = food.find((item) =>
          item.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes("cevap"),
        );

        setBurgers(cevapi ? [...beefBurgers.slice(0, 4), cevapi] : beefBurgers);
      } catch (err) {
        console.error("BURGER ERROR:", err);
      }
    }

    getBurgers();
  }, []);

  return (
    <div className="flex w-max animate-marquee gap-6">
      {[...burgers, ...burgers].map((burger, index) => (
        <div
          key={`${burger._id}-${index}`}
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
