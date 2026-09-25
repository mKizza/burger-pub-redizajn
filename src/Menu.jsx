import { useEffect, useState } from "react";
import MenuTrack from "./MenuTrack";
import UnsereMenuNaslov from "./UnserMenuNaslov";
import MenuSection from "./components/MenuSection";
import { API_URL } from "./config";

function Menu() {
  const [food, setFood] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMenu() {
      try {
        const [foodRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/food`),
          fetch(`${API_URL}/api/categories`),
        ]);

        const foodData = await foodRes.json();
        const categoriesData = await categoriesRes.json();

        setFood(foodData.data.food);
        setCategories(categoriesData.data.categories);
      } catch (err) {
        console.error("MENU ERROR:", err);
      } finally {
        setLoading(false);
      }
    }

    getMenu();
  }, []);

  const menuData = categories.map((category) => ({
    title: category.name,

    items: food
      .filter((item) => item.category?._id === category._id)
      .map((item) => ({
        ...item,
        id: item._id,
        price: `${Number(item.price).toFixed(2).replace(".", ",")} €`,
      })),
  }));

  return (
    <div
      className="relative min-h-screen w-full
        bg-[url('/menu-background-image/menu-background-image.png')]
        bg-cover
        bg-center
        bg-fixed"
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/65" />

      {/* CONTENT */}
      <div className="relative z-10 w-full">
        <div className="relative h-[80px]">
          <MenuTrack />
        </div>

        <UnsereMenuNaslov />

        <main className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
          {loading ? (
            <p className="py-20 text-center font-oswald text-white">
              MENÜ WIRD GELADEN...
            </p>
          ) : (
            menuData.map((section, index) => (
              <MenuSection
                key={section.title}
                section={section}
                first={index === 0}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}

export default Menu;
