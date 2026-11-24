import { useRef, useState } from "react";
import { useAdminApi } from "../../hooks/useAdminApi";
import { adminErrorMessage, nextOrder, parsePrice, validateDish, validateImage } from "../../lib/admin";
import { imageUrl } from "../../lib/format";
import { Button } from "../ui/Button";
import { FieldError, FieldLabel, TextField } from "../ui/Field";
import { controlClass, fieldDescribedBy } from "../ui/fieldStyles";
import Icon from "../ui/Icon";

const FIELD_ORDER = ["name", "price", "category"];

function initialValues(dish, defaultCategoryId) {
  if (dish) {
    return {
      name: dish.name ?? "",
      description: dish.description ?? "",
      price: Number.isFinite(Number(dish.price)) ? Number(dish.price).toFixed(2).replace(".", ",") : "",
      category: dish.category?._id ?? "",
    };
  }

  return { name: "", description: "", price: "", category: defaultCategoryId ?? "" };
}

function DishForm({ dish, defaultCategoryId, categories, food, onCancel, onSaved }) {
  const api = useAdminApi();
  const isEdit = Boolean(dish);
  const [values, setValues] = useState(() => initialValues(dish, defaultCategoryId));
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [dragging, setDragging] = useState(false);
  const formRef = useRef(null);

  const errors = submitted ? validateDish(values) : {};

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function selectFile(file) {
    if (!file) return;

    const problem = validateImage(file);

    if (problem) {
      setImageError(problem);
      return;
    }

    setImageError("");

    const reader = new FileReader();
    reader.onload = () => setImage({ file, preview: reader.result });
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setSaveError("");

    const problems = validateDish(values);
    const firstInvalid = FIELD_ORDER.find((name) => problems[name]);

    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("description", values.description.trim());
    formData.append("price", String(parsePrice(values.price)));
    formData.append("category", values.category);

    if (!isEdit) {
      const siblings = food.filter((item) => item.category?._id === values.category);
      formData.append("order", String(nextOrder(siblings)));
    }

    if (image) formData.append("image", image.file);

    setSaving(true);

    try {
      const data = await api(isEdit ? `/api/food/${dish._id}` : "/api/food", {
        method: isEdit ? "PATCH" : "POST",
        body: formData,
      });

      onSaved(data.data.food);
    } catch (err) {
      if (err.sessionExpired) return;
      setSaveError(adminErrorMessage(err, "Spremanje nije uspjelo"));
      setSaving(false);
    }
  }

  const currentImage = isEdit && dish.image ? imageUrl(dish.image) : "";
  const shownImage = image?.preview || currentImage;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        id="dish-name"
        name="name"
        label="Naziv"
        required
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        autoFocus={!isEdit}
      />

      <TextField
        id="dish-description"
        name="description"
        label="Opis"
        optional
        multiline
        rows={3}
        value={values.description}
        onChange={handleChange}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="dish-price"
          name="price"
          label="Cijena €"
          required
          inputMode="decimal"
          placeholder="14,50"
          value={values.price}
          onChange={handleChange}
          error={errors.price}
        />

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="dish-category">Kategorija</FieldLabel>
          <select
            id="dish-category"
            name="category"
            required
            value={values.category}
            onChange={handleChange}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={fieldDescribedBy("dish-category", { error: errors.category })}
            className={controlClass(errors.category, "h-12 px-3")}
          >
            <option value="">Odaberi kategoriju</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id} className="bg-char">
                {category.name}
              </option>
            ))}
          </select>
          <FieldError id="dish-category-error">{errors.category}</FieldError>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-oswald text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
          Slika
        </p>

        <label
          htmlFor="dish-image"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          className={`group relative flex cursor-pointer items-center gap-4 border-2 border-dashed p-3 transition ${
            dragging ? "border-brand bg-brand/10" : "border-white/15 hover:border-brand/60"
          }`}
        >
          <span className="grid size-24 shrink-0 place-items-center overflow-hidden bg-black/50 text-white/30">
            {shownImage ? (
              <img src={shownImage} alt="" className="size-full object-cover" />
            ) : (
              <Icon name="image" className="size-8" />
            )}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="inline-flex items-center gap-2 font-oswald text-sm font-semibold uppercase tracking-[0.12em] text-brand">
              <Icon name="upload" className="size-4" />
              {shownImage ? "Promijeni sliku" : "Odaberi sliku"}
            </span>
            <span className="truncate font-montserrat text-xs text-white/50">
              {image
                ? image.file.name
                : currentImage
                  ? "Trenutna slika ostaje"
                  : "JPEG, PNG ili WebP, najviše 10 MB – ili povucite ovdje"}
            </span>
          </span>
          <input
            id="dish-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-describedby={imageError ? "dish-image-error" : undefined}
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>

        {image && (
          <button
            type="button"
            onClick={() => setImage(null)}
            className="self-start font-oswald text-xs uppercase tracking-[0.12em] text-white/50 underline-offset-4 hover:text-white hover:underline"
          >
            Poništi novu sliku
          </button>
        )}
        <FieldError id="dish-image-error">{imageError}</FieldError>
      </div>

      {saveError && (
        <p role="alert" className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 p-3 font-montserrat text-sm text-red-200">
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          {saveError}
        </p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Odustani
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Icon name="spinner" className="size-4" />}
          {isEdit ? "Spremi promjene" : "Dodaj jelo"}
        </Button>
      </div>
    </form>
  );
}

export default DishForm;
