import * as React from "react";

/**
 * Shared visibility primitive: reports whether the attached element is
 * inside (or near) the viewport. Used to defer mounting heavy previews until
 * scrolled near — same 300px-margin pattern as the gallery cards.
 *
 * SSR-safe: reports `false` until the client observer runs.
 */
export function useInViewport(options?: {
  rootMargin?: string;
  threshold?: number | number[];
}): { ref: React.RefObject<HTMLDivElement | null>; inView: boolean } {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);
  const rootMargin = options?.rootMargin ?? "300px 0px";
  const threshold = options?.threshold ?? 0.01;

  React.useEffect(() => {
    const host = ref.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
      },
      { rootMargin, threshold },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}
