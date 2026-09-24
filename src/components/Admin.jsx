import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [food, setFood] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    category: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        const [foodRes, categoriesRes] = await Promise.all([
          fetch("http://localhost:5000/api/food"),
          fetch("http://localhost:5000/api/categories"),
        ]);

        const foodData = await foodRes.json();
        const categoriesData = await categoriesRes.json();

        setFood(foodData.data.food);
        setCategories(categoriesData.data.categories);
      } catch (err) {
        console.error("Greška:", err);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/admin-login");
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      image: null,
      category: "",
    });
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingFood(null);
    resetForm();
  }

  function handleAddClick() {
    setEditingFood(null);
    resetForm();
    setShowAddModal(true);
  }

  function handleEditClick(item) {
    setEditingFood(item);

    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      image: null,
      category: item.category?._id || "",
    });

    setShowAddModal(true);
  }

  async function handleSubmitFood(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);

      if (form.image) {
        formData.append("image", form.image);
      }

      const url = editingFood
        ? `http://localhost:5000/api/food/${editingFood._id}`
        : "http://localhost:5000/api/food";

      const res = await fetch(url, {
        method: editingFood ? "PATCH" : "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Došlo je do greške");
        return;
      }

      if (editingFood) {
        setFood((prev) =>
          prev.map((item) =>
            item._id === editingFood._id ? data.data.food : item,
          ),
        );
      } else {
        setFood((prev) => [...prev, data.data.food]);
      }

      closeModal();
    } catch (err) {
      console.error(err);
      alert("Greška pri povezivanju sa serverom");
    }
  }

  async function handleDeleteFood(item) {
    const confirmDelete = window.confirm(
      `Jesi siguran da želiš obrisati "${item.name}"?`,
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/food/${item._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Greška pri brisanju");
        return;
      }

      setFood((prev) => prev.filter((foodItem) => foodItem._id !== item._id));
    } catch (err) {
      console.error(err);
      alert("Greška pri povezivanju sa serverom");
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();

    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const slug = newCategory
        .trim()
        .toLowerCase()
        .replace(/&/g, "")
        .replace(/\s+/g, "-");

      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategory.trim(),
          slug,
          order: categories.length + 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Greška pri dodavanju kategorije");
        return;
      }

      setCategories((prev) => [...prev, data.data.category]);

      setNewCategory("");
    } catch (err) {
      console.error(err);
      alert("Greška pri povezivanju sa serverom");
    }
  }

  async function handleDeleteCategory(category) {
    const categoryFood = food.filter(
      (item) => item.category?._id === category._id,
    );

    if (categoryFood.length > 0) {
      alert(
        `Kategoriju "${category.name}" nije moguće obrisati jer sadrži ${categoryFood.length} proizvoda.`,
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Jesi siguran da želiš obrisati kategoriju "${category.name}"?`,
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/categories/${category._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();

        alert(data.message || "Greška pri brisanju kategorije");
        return;
      }

      setCategories((prev) => prev.filter((item) => item._id !== category._id));
    } catch (err) {
      console.error(err);
      alert("Greška pri povezivanju sa serverom");
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#111]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5">
          <div>
            <h1 className="font-oswald text-2xl font-bold uppercase">
              Burger Pub
            </h1>

            <p className="font-oswald text-sm text-[#ffaf01]">ADMIN PANEL</p>
          </div>

          <button
            onClick={handleLogout}
            className="border border-[#ffaf01] px-5 py-2 font-oswald text-sm font-bold uppercase text-[#ffaf01] transition hover:bg-[#ffaf01] hover:text-black"
          >
            ODJAVA
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-oswald text-3xl font-bold uppercase">Menu</h2>

            <p className="mt-1 font-oswald text-sm text-white/50">
              {food.length} proizvoda
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="border border-[#ffaf01] px-5 py-3 font-oswald font-bold uppercase text-[#ffaf01] transition hover:bg-[#ffaf01] hover:text-black"
            >
              KATEGORIJE
            </button>

            <button
              onClick={handleAddClick}
              className="bg-[#ffaf01] px-5 py-3 font-oswald font-bold uppercase text-black transition hover:bg-white"
            >
              + DODAJ NOVO
            </button>
          </div>
        </div>

        {loading ? (
          <p className="py-20 text-center font-oswald text-white/50">
            UČITAVANJE...
          </p>
        ) : (
          categories.map((category) => {
            const categoryFood = food.filter(
              (item) => item.category?._id === category._id,
            );

            return (
              <section key={category._id} className="mb-12">
                {/* CATEGORY */}
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="shrink-0 font-oswald text-xl font-bold uppercase text-[#ffaf01]">
                    {category.name}
                  </h2>

                  <div className="h-[1px] flex-1 bg-[#ffaf01]/50" />
                </div>

                {/* FOOD */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {categoryFood.map((item) => (
                    <div
                      key={item._id}
                      className="overflow-hidden border border-white/10 bg-[#151515]"
                    >
                      {/* IMAGE */}
                      {item.image ? (
                        <div className="h-[220px] overflow-hidden">
                          <img
                            src={
                              item.image?.startsWith("/uploads/")
                                ? `http://localhost:5000${item.image}`
                                : item.image
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[160px] items-center justify-center bg-[#1c1c1c]">
                          <span className="font-oswald text-sm uppercase tracking-[0.2em] text-white/20">
                            Burger Pub
                          </span>
                        </div>
                      )}

                      {/* INFO */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-oswald text-xl font-bold uppercase">
                            {item.name}
                          </h3>

                          <span className="shrink-0 font-oswald text-xl font-bold text-[#ffaf01]">
                            {Number(item.price).toFixed(2).replace(".", ",")} €
                          </span>
                        </div>

                        {item.description && (
                          <p className="mt-3 font-oswald text-sm leading-relaxed text-white/50">
                            {item.description}
                          </p>
                        )}

                        {/* BUTTONS */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="border border-[#ffaf01] py-3 font-oswald font-bold uppercase text-[#ffaf01] transition hover:bg-[#ffaf01] hover:text-black"
                          >
                            UREDI
                          </button>

                          <button
                            onClick={() => handleDeleteFood(item)}
                            className="border border-red-500/70 py-3 font-oswald font-bold uppercase text-red-400 transition hover:bg-red-500 hover:text-white"
                          >
                            OBRIŠI
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto border border-white/10 bg-[#151515] p-6 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="font-oswald text-sm font-bold uppercase text-[#ffaf01]">
                  Admin panel
                </p>

                <h2 className="font-oswald text-3xl font-bold uppercase text-white">
                  {editingFood ? "Uredi jelo" : "Dodaj novo jelo"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-3xl text-white/50 transition hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitFood} className="flex flex-col gap-5">
              {/* NAME */}
              <div>
                <label className="mb-2 block font-oswald text-sm font-bold uppercase text-white/60">
                  Naziv
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-white/15 bg-[#0d0d0d] px-4 py-3 font-oswald text-white outline-none focus:border-[#ffaf01]"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block font-oswald text-sm font-bold uppercase text-white/60">
                  Opis
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full resize-none border border-white/15 bg-[#0d0d0d] px-4 py-3 font-oswald text-white outline-none focus:border-[#ffaf01]"
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="mb-2 block font-oswald text-sm font-bold uppercase text-white/60">
                  Cijena €
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-white/15 bg-[#0d0d0d] px-4 py-3 font-oswald text-white outline-none focus:border-[#ffaf01]"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block font-oswald text-sm font-bold uppercase text-white/60">
                  Kategorija
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-white/15 bg-[#0d0d0d] px-4 py-3 font-oswald text-white outline-none focus:border-[#ffaf01]"
                >
                  <option value="">Odaberi kategoriju</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* IMAGE */}
              <div>
                <label className="mb-2 block font-oswald text-sm font-bold uppercase text-white/60">
                  Slika
                </label>

                {/* POSTOJEĆA SLIKA KOD EDITA */}
                {editingFood?.image && !form.image && (
                  <div className="mb-4">
                    <p className="mb-2 font-oswald text-xs uppercase text-white/40">
                      Trenutna slika
                    </p>

                    <div className="h-[180px] w-full overflow-hidden border border-white/10 bg-[#0d0d0d]">
                      <img
                        src={
                          editingFood.image.startsWith("/uploads/")
                            ? `http://localhost:5000${editingFood.image}`
                            : editingFood.image
                        }
                        alt={editingFood.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="shrink-0 cursor-pointer bg-[#ffaf01] px-5 py-3 font-oswald font-bold uppercase text-black transition hover:bg-white">
                    {editingFood ? "PROMIJENI SLIKU" : "ODABERI SLIKU"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];

                        if (file) {
                          setForm((prev) => ({
                            ...prev,
                            image: file,
                          }));
                        }
                      }}
                    />
                  </label>

                  <span className="min-w-0 truncate font-oswald text-sm text-white/50">
                    {form.image
                      ? form.image.name
                      : editingFood?.image
                        ? "Trenutna slika ostaje"
                        : "Nije odabrana slika"}
                  </span>
                </div>

                {/* PREVIEW NOVE SLIKE */}
                {form.image && (
                  <div className="mt-4">
                    <p className="mb-2 font-oswald text-xs uppercase text-[#ffaf01]">
                      Nova slika
                    </p>

                    <div className="h-[180px] w-full overflow-hidden border border-[#ffaf01]/30 bg-[#0d0d0d]">
                      <img
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-white/20 py-4 font-oswald font-bold uppercase text-white transition hover:bg-white hover:text-black"
                >
                  ODUSTANI
                </button>

                <button
                  type="submit"
                  className="bg-[#ffaf01] py-4 font-oswald font-bold uppercase text-black transition hover:bg-white"
                >
                  {editingFood ? "SPREMI PROMJENE" : "DODAJ JELO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoriesModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-[650px] overflow-y-auto border border-white/10 bg-[#151515] p-6 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="font-oswald text-sm font-bold uppercase text-[#ffaf01]">
                  Admin panel
                </p>

                <h2 className="font-oswald text-3xl font-bold uppercase">
                  Kategorije
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoriesModal(false)}
                className="text-3xl text-white/50 transition hover:text-white"
              >
                ×
              </button>
            </div>

            {/* DODAVANJE */}
            <form
              onSubmit={handleAddCategory}
              className="mb-8 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Naziv nove kategorije"
                className="min-w-0 flex-1 border border-white/15 bg-[#0d0d0d] px-4 py-3 font-oswald text-white outline-none focus:border-[#ffaf01]"
              />

              <button
                type="submit"
                className="shrink-0 bg-[#ffaf01] px-5 py-3 font-oswald font-bold uppercase text-black transition hover:bg-white"
              >
                + DODAJ
              </button>
            </form>

            {/* POPIS */}
            <div className="flex flex-col gap-3">
              {categories.map((category) => {
                const foodCount = food.filter(
                  (item) => item.category?._id === category._id,
                ).length;

                return (
                  <div
                    key={category._id}
                    className="flex items-center justify-between gap-4 border border-white/10 bg-[#0d0d0d] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-oswald font-bold uppercase">
                        {category.name}
                      </p>

                      <p className="mt-1 font-oswald text-xs text-white/40">
                        {foodCount} proizvoda
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={foodCount > 0}
                      className={`shrink-0 border px-4 py-2 font-oswald text-sm font-bold uppercase transition ${
                        foodCount > 0
                          ? "cursor-not-allowed border-white/10 text-white/20"
                          : "border-red-500/70 text-red-400 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      OBRIŠI
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
