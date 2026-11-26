import { useEffect, useState } from "react";

export function useScrollSpy(ids, offset = 160) {
  const [active, setActive] = useState(null);
  const key = ids.join("|");

  useEffect(() => {
    if (!key) return;

    const elements = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const visible = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.target);
          else visible.delete(entry.target.id);
        }

        const top = elements.find((element) => visible.has(element.id));
        if (top) setActive(top.id);
      },
      { rootMargin: `-${offset}px 0px -45% 0px` },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [key, offset]);

  return active;
}
