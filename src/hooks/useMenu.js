import { useCallback, useEffect, useState } from "react";
import { clearMenuCache, getMenu, peekMenu } from "../lib/api";

export function useMenu() {
  const [state, setState] = useState(() => {
    const cached = peekMenu();

    return cached
      ? { status: "ready", ...cached }
      : { status: "loading", food: [], categories: [] };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    getMenu()
      .then(({ food, categories }) => {
        if (active) setState({ status: "ready", food, categories });
      })
      .catch((err) => {
        console.error("MENU ERROR:", err);
        if (active) setState((prev) => ({ ...prev, status: "error" }));
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    clearMenuCache();
    setState((prev) => ({ ...prev, status: "loading" }));
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
