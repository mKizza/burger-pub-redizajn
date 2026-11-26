import { useCallback, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { ToastContext } from "./toastContext";

const DURATION = 4500;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      nextId.current += 1;
      const id = nextId.current;

      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext value={api}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 border bg-char/95 px-4 py-3 shadow-2xl backdrop-blur ${
              toast.type === "error" ? "border-red-400/60" : "border-brand/60"
            }`}
          >
            <Icon
              name={toast.type === "error" ? "alert" : "check"}
              className={`mt-0.5 size-5 shrink-0 ${toast.type === "error" ? "text-red-300" : "text-brand"}`}
            />
            <p className="flex-1 font-montserrat text-sm text-white">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-mr-1 text-white/40 transition hover:text-white"
              aria-label="Zatvori obavijest"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export default ToastProvider;
