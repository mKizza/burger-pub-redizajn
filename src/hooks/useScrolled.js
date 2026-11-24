import { useCallback, useSyncExternalStore } from "react";

export function useScrolled(threshold = 12) {
  const subscribe = useCallback((onChange) => {
    window.addEventListener("scroll", onChange, { passive: true });
    return () => window.removeEventListener("scroll", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}
