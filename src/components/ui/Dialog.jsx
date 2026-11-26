import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

function Dialog({ open, onClose, title, eyebrow, size = "md", children, role }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`m-auto max-h-[92dvh] w-[calc(100%-2rem)] ${WIDTHS[size]} overflow-y-auto overscroll-contain border border-white/10 bg-char p-0 text-white shadow-[0_30px_80px_rgb(0_0_0/0.7)] backdrop:bg-black/80 backdrop:backdrop-blur-sm open:animate-fade-up`}
    >
      {open && (
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              {eyebrow && (
                <p className="font-oswald text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  {eyebrow}
                </p>
              )}
              <h2
                id={titleId}
                className="font-oswald text-2xl font-bold uppercase leading-tight text-white sm:text-3xl"
              >
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center text-white/50 transition hover:text-white"
              aria-label="Zatvori"
            >
              <Icon name="close" className="size-6" />
            </button>
          </div>

          {children}
        </div>
      )}
    </dialog>
  );
}

export default Dialog;
