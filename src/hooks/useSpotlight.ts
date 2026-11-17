import { useCallback, useRef, type PointerEvent } from "react";

/** Feeds pointer coordinates to the `spotlight` utility through CSS variables — no re-renders. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }, []);
  return { ref, onPointerMove };
}
