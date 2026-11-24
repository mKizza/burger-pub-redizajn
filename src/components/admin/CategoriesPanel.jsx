import { useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi";
import { adminErrorMessage, moveCategory, nextOrder, slugify } from "../../lib/admin";
import { pluralizeHr } from "../../lib/format";
import { Button } from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { controlClass } from "../ui/fieldStyles";
import Icon from "../ui/Icon";
import { useToast } from "../ui/toastContext";

const ICON_BUTTON =
  "grid size-9 place-items-center border border-white/10 text-white/70 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white/70";

function CategoriesPanel({ categories, food, onCategoriesChange }) {
  const api = useAdminApi();
  const toast = useToast();
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const countFor = (category) =>
    food.filter((item) => item.category?._id === category._id).length;

  function fail(err, fallback) {
    if (!err.sessionExpired) toast.error(adminErrorMessage(err, fallback));
  }

  async function handleAdd(event) {
    event.preventDefault();
    const name = newName.trim();

    if (!name) return;

    setAdding(true);

    try {
      const data = await api("/api/categories", {
        method: "POST",
        body: {
          name,
          slug: slugify(name, categories.map((category) => category.slug)),
          order: nextOrder(categories),
        },
      });

      onCategoriesChange([...categories, data.data.category]);
      setNewName("");
      toast.success(`Kategorija „${name}“ je dodana`);
    } catch (err) {
      fail(err, "Greška pri dodavanju kategorije");
    } finally {
      setAdding(false);
    }
  }

  async function handleRename(category) {
    const name = editName.trim();

    if (!name || name === category.name) {
      setEditingId(null);
      return;
    }

    setBusyId(category._id);

    try {
      const data = await api(`/api/categories/${category._id}`, {
        method: "PATCH",
        body: { name },
      });

      const updated = data.data.category ?? { ...category, name };
      onCategoriesChange(categories.map((item) => (item._id === category._id ? updated : item)));
      setEditingId(null);
      toast.success("Kategorija je preimenovana");
    } catch (err) {
      fail(err, "Greška pri spremanju kategorije");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(category, direction) {
    const changes = moveCategory(categories, category._id, direction);

    if (changes.length === 0) return;

    setBusyId(category._id);

    try {
      await Promise.all(
        changes.map(({ category: item, order }) =>
          api(`/api/categories/${item._id}`, { method: "PATCH", body: { order } }),
        ),
      );

      const orders = new Map(changes.map(({ category: item, order }) => [item._id, order]));
      onCategoriesChange(
        categories.map((item) =>
          orders.has(item._id) ? { ...item, order: orders.get(item._id) } : item,
        ),
      );
    } catch (err) {
      fail(err, "Redoslijed nije spremljen");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    const category = deleteTarget;
    setDeleting(true);

    try {
      await api(`/api/categories/${category._id}`, { method: "DELETE" });
      onCategoriesChange(categories.filter((item) => item._id !== category._id));
      toast.success(`Kategorija „${category.name}“ je obrisana`);
      setDeleteTarget(null);
    } catch (err) {
      fail(err, "Greška pri brisanju kategorije");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="new-category" className="sr-only">
          Naziv nove kategorije
        </label>
        <input
          id="new-category"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Naziv nove kategorije"
          maxLength={80}
          className={controlClass(false, "h-12 min-w-0 flex-1 px-4")}
        />
        <Button type="submit" disabled={adding || !newName.trim()} className="shrink-0">
          {adding ? <Icon name="spinner" className="size-4" /> : <Icon name="plus" className="size-4" />}
          Dodaj
        </Button>
      </form>

      <ul className="flex flex-col gap-2" aria-label="Kategorije">
        {sorted.map((category, index) => {
          const count = countFor(category);
          const busy = busyId === category._id;
          const isEditing = editingId === category._id;

          return (
            <li key={category._id} className="flex items-center gap-3 border border-white/10 bg-black/40 p-3">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className={ICON_BUTTON}
                  onClick={() => handleMove(category, -1)}
                  disabled={busy || index === 0}
                  aria-label={`Pomakni gore: ${category.name}`}
                >
                  <Icon name="arrowUp" className="size-4" />
                </button>
                <button
                  type="button"
                  className={ICON_BUTTON}
                  onClick={() => handleMove(category, 1)}
                  disabled={busy || index === sorted.length - 1}
                  aria-label={`Pomakni dolje: ${category.name}`}
                >
                  <Icon name="arrowDown" className="size-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleRename(category);
                    }}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <label htmlFor={`rename-${category._id}`} className="sr-only">
                      Novi naziv za {category.name}
                    </label>
                    <input
                      id={`rename-${category._id}`}
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.stopPropagation();
                          event.preventDefault();
                          setEditingId(null);
                        }
                      }}
                      maxLength={80}
                      autoFocus
                      className={controlClass(false, "h-10 min-w-0 flex-1 px-3")}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={busy || !editName.trim()}>
                        Spremi
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        Odustani
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="truncate font-oswald text-base font-bold uppercase tracking-wide text-white">
                      {category.name}
                    </p>
                    <p className="font-montserrat text-xs text-white/45">
                      {pluralizeHr(count, "proizvod", "proizvoda", "proizvoda")}
                    </p>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className={ICON_BUTTON}
                    onClick={() => {
                      setEditingId(category._id);
                      setEditName(category.name);
                    }}
                    disabled={busy}
                    aria-label={`Preimenuj: ${category.name}`}
                  >
                    <Icon name="pencil" className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={`${ICON_BUTTON} hover:border-red-400! hover:text-red-300!`}
                    onClick={() => setDeleteTarget(category)}
                    disabled={busy || count > 0}
                    aria-label={`Obriši: ${category.name}`}
                    title={count > 0 ? "Kategorija sadrži jela i ne može se obrisati" : undefined}
                  >
                    <Icon name="trash" className="size-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="font-montserrat text-xs text-white/45">
        Kategoriju s jelima nije moguće obrisati – prvo premjestite ili obrišite njena jela.
      </p>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Obrisati kategoriju?"
        message={deleteTarget ? `Kategorija „${deleteTarget.name}“ bit će trajno obrisana.` : ""}
        confirmLabel="Obriši"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default CategoriesPanel;
