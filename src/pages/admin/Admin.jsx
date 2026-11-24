import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CategoriesPanel from "../../components/admin/CategoriesPanel";
import DishForm from "../../components/admin/DishForm";
import { Button } from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Dialog from "../../components/ui/Dialog";
import { controlClass } from "../../components/ui/fieldStyles";
import Icon from "../../components/ui/Icon";
import { useToast } from "../../components/ui/toastContext";
import { useAdminApi } from "../../hooks/useAdminApi";
import { adminErrorMessage } from "../../lib/admin";
import { apiFetch, clearMenuCache } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import { formatPrice, imageUrl, pluralizeHr } from "../../lib/format";
import { normalizeText } from "../../lib/menu";

const ICON_BUTTON =
  "inline-flex h-9 items-center gap-1.5 border px-3 font-oswald text-xs font-semibold uppercase tracking-[0.12em] transition";

function DishRow({ item, onEdit, onDelete }) {
  return (
    <li className="flex items-center gap-4 border border-white/10 bg-coal p-3 transition hover:border-white/20 sm:p-4">
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden bg-black/50 text-white/20 sm:size-20">
        {item.image ? (
          <img src={imageUrl(item.image)} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <Icon name="image" className="size-6" />
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-oswald text-base font-bold uppercase tracking-wide text-white sm:text-lg">
            {item.name}
          </h3>
          <span className="font-oswald text-base font-bold text-brand sm:text-lg">
            {formatPrice(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="line-clamp-2 font-montserrat text-xs leading-relaxed text-white/50 sm:text-sm">
            {item.description}
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className={`${ICON_BUTTON} border-brand/60 text-brand hover:bg-brand hover:text-black`}
            aria-label={`Uredi: ${item.name}`}
          >
            <Icon name="pencil" className="size-3.5" /> Uredi
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className={`${ICON_BUTTON} border-red-500/50 text-red-300 hover:bg-red-500 hover:text-white`}
            aria-label={`Obriši: ${item.name}`}
          >
            <Icon name="trash" className="size-3.5" /> Obriši
          </button>
        </div>
      </div>
    </li>
  );
}

function Admin() {
  const api = useAdminApi();
  const toast = useToast();
  const navigate = useNavigate();
  const [food, setFood] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dishDialog, setDishDialog] = useState(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([apiFetch("/api/food"), apiFetch("/api/categories")])
      .then(([foodData, categoriesData]) => {
        if (!active) return;
        setFood(foodData.data.food);
        setCategories(categoriesData.data.categories);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Greška:", err);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  function handleLogout() {
    clearToken();
    navigate("/admin-login", { replace: true });
  }

  function handleSaved(saved) {
    const isEdit = dishDialog?.dish;

    setFood((prev) =>
      isEdit ? prev.map((item) => (item._id === saved._id ? saved : item)) : [...prev, saved],
    );
    setDishDialog(null);
    clearMenuCache();
    toast.success(isEdit ? `„${saved.name}“ je spremljeno` : `„${saved.name}“ je dodano`);
  }

  async function handleDelete() {
    const item = deleteTarget;
    setDeleting(true);

    try {
      await api(`/api/food/${item._id}`, { method: "DELETE" });
      setFood((prev) => prev.filter((dish) => dish._id !== item._id));
      clearMenuCache();
      toast.success(`„${item.name}“ je obrisano`);
      setDeleteTarget(null);
    } catch (err) {
      if (!err.sessionExpired) toast.error(adminErrorMessage(err, "Greška pri brisanju"));
    } finally {
      setDeleting(false);
    }
  }

  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const needle = normalizeText(query);
  const matchesQuery = (item) =>
    !needle || normalizeText(`${item.name} ${item.description ?? ""}`).includes(needle);

  const categoryIds = new Set(categories.map((category) => category._id));
  const orphans = food.filter((item) => !categoryIds.has(item.category?._id));

  const groups = [
    ...sortedCategories.map((category) => ({
      id: category._id,
      title: category.name,
      category,
      items: food.filter((item) => item.category?._id === category._id),
    })),
    ...(orphans.length > 0
      ? [{ id: "none", title: "Bez kategorije", category: null, items: orphans }]
      : []),
  ]
    .filter((group) => categoryFilter === "all" || group.id === categoryFilter)
    .map((group) => ({ ...group, visible: group.items.filter(matchesQuery) }))
    .filter((group) => !needle || group.visible.length > 0);

  const withoutImage = food.filter((item) => !item.image).length;

  return (
    <div className="min-h-dvh bg-ink text-white">
      <title>Admin | Burger Pub München</title>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-coal/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/Logo/burger-pub-logo.webp" alt="" className="w-10" />
            <span className="flex flex-col leading-none">
              <span className="font-oswald text-lg font-bold uppercase tracking-wide">Burger Pub</span>
              <span className="font-oswald text-xs tracking-[0.2em] text-brand">ADMIN PANEL</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="/menu"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 px-3 font-oswald text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:text-brand sm:inline-flex"
            >
              Pogledaj stranicu <Icon name="external" className="size-4" />
            </a>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <Icon name="logout" className="size-4" /> Odjava
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-anton text-4xl tracking-wide sm:text-5xl">MENU</h1>
            {status === "ready" && (
              <p className="font-montserrat text-sm text-white/55">
                {pluralizeHr(food.length, "proizvod", "proizvoda", "proizvoda")} ·{" "}
                {pluralizeHr(categories.length, "kategorija", "kategorije", "kategorija")}
                {withoutImage > 0 && <> · {withoutImage} bez slike</>}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCategoriesOpen(true)} disabled={status !== "ready"}>
              Kategorije
            </Button>
            <Button onClick={() => setDishDialog({ dish: null })} disabled={status !== "ready"}>
              <Icon name="plus" className="size-4" /> Dodaj novo
            </Button>
          </div>
        </div>

        {status === "ready" && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="admin-search" className="sr-only">
                Pretraži jela
              </label>
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
              <input
                id="admin-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pretraži jela …"
                className={controlClass(false, "h-12 pr-4 pl-11")}
              />
            </div>
            <label htmlFor="admin-filter" className="sr-only">
              Filtriraj po kategoriji
            </label>
            <select
              id="admin-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={controlClass(false, "h-12 px-3 sm:w-64")}
            >
              <option value="all">Sve kategorije</option>
              {sortedCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-28 animate-pulse border border-white/5 bg-coal" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="flex flex-col items-center gap-4 border border-red-500/30 bg-red-500/5 p-10 text-center">
            <Icon name="alert" className="size-8 text-red-300" />
            <p className="font-oswald text-lg uppercase tracking-wide">Podaci se nisu mogli učitati.</p>
            <Button
              variant="outline"
              onClick={() => {
                setStatus("loading");
                setAttempt((value) => value + 1);
              }}
            >
              Pokušaj ponovno
            </Button>
          </div>
        )}

        {status === "ready" && groups.length === 0 && (
          <p className="py-16 text-center font-oswald text-lg uppercase tracking-wide text-white/50">
            Nema rezultata za „{query.trim()}“
          </p>
        )}

        {status === "ready" &&
          groups.map((group) => (
            <section key={group.id} aria-labelledby={`admin-cat-${group.id}`} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <h2 id={`admin-cat-${group.id}`} className="shrink-0 font-oswald text-xl font-bold uppercase tracking-wide text-brand">
                  {group.title}
                </h2>
                <span className="font-montserrat text-xs text-white/60">{group.items.length}</span>
                <span className="h-px flex-1 bg-brand/40" aria-hidden="true" />
                {group.category && (
                  <button
                    type="button"
                    onClick={() => setDishDialog({ dish: null, categoryId: group.id })}
                    className="inline-flex items-center gap-1 font-oswald text-xs font-semibold uppercase tracking-[0.12em] text-white/60 transition hover:text-brand"
                    aria-label={`Dodaj jelo u kategoriju ${group.title}`}
                  >
                    <Icon name="plus" className="size-3.5" /> Dodaj
                  </button>
                )}
              </div>

              {group.visible.length > 0 ? (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {group.visible.map((item) => (
                    <DishRow
                      key={item._id}
                      item={item}
                      onEdit={(dish) => setDishDialog({ dish })}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </ul>
              ) : (
                <p className="border border-dashed border-white/10 p-5 text-center font-montserrat text-sm text-white/40">
                  Nema jela u ovoj kategoriji.
                </p>
              )}
            </section>
          ))}
      </main>

      <Dialog
        open={Boolean(dishDialog)}
        onClose={() => setDishDialog(null)}
        eyebrow="Admin panel"
        title={dishDialog?.dish ? "Uredi jelo" : "Dodaj novo jelo"}
      >
        <DishForm
          key={dishDialog?.dish?._id ?? `new-${dishDialog?.categoryId ?? ""}`}
          dish={dishDialog?.dish ?? null}
          defaultCategoryId={dishDialog?.categoryId}
          categories={sortedCategories}
          food={food}
          onCancel={() => setDishDialog(null)}
          onSaved={handleSaved}
        />
      </Dialog>

      <Dialog
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        eyebrow="Admin panel"
        title="Kategorije"
        size="lg"
      >
        <CategoriesPanel
          categories={categories}
          food={food}
          onCategoriesChange={(next) => {
            setCategories(next);
            clearMenuCache();
          }}
        />
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Obrisati jelo?"
        message={
          deleteTarget
            ? `„${deleteTarget.name}“ bit će trajno uklonjeno s jelovnika${deleteTarget.image ? ", zajedno sa slikom" : ""}.`
            : ""
        }
        confirmLabel="Obriši"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Admin;
