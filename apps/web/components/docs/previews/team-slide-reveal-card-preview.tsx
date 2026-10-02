"use client";

import * as React from "react";
import { TeamSlideReveal } from "@workspace/ui/components/team-slide-reveal";

/**
 * Display-only catalog preview. Auto-plays the profile ↔ story swap on a
 * timer while staying inert + pointer-events-none, so the wrapping
 * route-linked gallery card stays fully navigable.
 */
export function TeamSlideRevealCardPreview() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = hostRef.current;
    if (!host) return;

    let timer = 0;
    let visible = false;
    const DWELL_MS = 2600;

    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const start = () => {
      stop();
      if (!visible || document.hidden) return;
      timer = window.setInterval(() => {
        setOpen((prev) => !prev);
      }, DWELL_MS);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        start();
      },
      { threshold: 0.05 },
    );
    observer.observe(host);
    document.addEventListener("visibilitychange", start);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      inert
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-zinc-100 p-3 transition-colors dark:bg-zinc-950"
      style={{ containerType: "inline-size" }}
    >
      <div className="aspect-[.73] h-full max-w-[70cqi] shadow-xl">
        <TeamSlideReveal
          radius={9}
          duration={420}
          compact
          open={open}
          testimonial="I’m driven, curious, and committed to turning ideas into something bigger."
        />
      </div>
    </div>
  );
}
