"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  KINETIC_VARIANT_META,
  KINETIC_VARIANTS,
  KineticSplitText,
  type KineticSplitTextHandle,
  type KineticVariant,
} from "@workspace/ui/components/kinetic-split-text";
import { cn } from "@/lib/utils";

/** Distinct gallery copy per motion style — never the docs hero text. */
const CARD_COPY: Record<KineticVariant, string> = {
  "editorial-rise": "DESIGN\nIN\nMOTION.",
  "depth-cascade": "DEPTH\nWITH\nFEELING.",
  "split-shutter": "CUT\nUP\nTHE TYPE.",
  "elastic-slam": "BOLD\nWITH\nIMPACT.",
  "blur-rush": "SPEED\nINTO\nFOCUS.",
};

const HOLD_MS = 1700;
const EXIT_MS = 450;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Gallery card — cycles all five motion styles with a distinct line per
 * style: play → hold → eased masked exit → next variant. Theme-aware
 * background, ink, glow. Pauses offscreen / hidden tab.
 */
export function KineticSplitTextCardPreview() {
  const ref = React.useRef<KineticSplitTextHandle>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const inViewRef = React.useRef(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [variantIndex, setVariantIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const variant: KineticVariant = KINETIC_VARIANTS[variantIndex] ?? "editorial-rise";

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme === "dark" : true;

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pause the loop offscreen; replay on return.
  React.useEffect(() => {
    if (reducedMotion) return;
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        const wasHidden = !inViewRef.current && visible;
        inViewRef.current = visible;
        if (visible && wasHidden) ref.current?.play();
      },
      { threshold: 0 },
    );
    io.observe(el);
    const onVis = () => {
      if (document.hidden) inViewRef.current = false;
      else {
        inViewRef.current = true;
        ref.current?.play();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reducedMotion]);

  // Entrance → hold → eased exit → advance. Remount per variant via key
  // so each entrance starts from a clean WAAPI timeline.
  React.useEffect(() => {
    if (reducedMotion) return;
    let disposed = false;
    let holdTimer = 0;
    let raf = 0;
    const meta = KINETIC_VARIANT_META[variant];
    const lines = CARD_COPY[variant].split("\n").length;
    const playMs = meta.duration * 1000 + (lines - 1) * meta.stagger * 1000;
    setExiting(false);
    if (inViewRef.current) ref.current?.play();
    holdTimer = window.setTimeout(() => {
      if (disposed || !inViewRef.current) {
        if (!disposed) setVariantIndex((i) => (i + 1) % KINETIC_VARIANTS.length);
        return;
      }
      setExiting(true);
      const t0 = performance.now();
      const tick = (now: number) => {
        if (disposed) return;
        const raw = Math.min(1, (now - t0) / EXIT_MS);
        if (inViewRef.current) ref.current?.setProgress(1 - easeInOutCubic(raw));
        if (raw < 1) raf = requestAnimationFrame(tick);
        else setVariantIndex((i) => (i + 1) % KINETIC_VARIANTS.length);
      };
      raf = requestAnimationFrame(tick);
    }, playMs + HOLD_MS);
    return () => {
      disposed = true;
      window.clearTimeout(holdTimer);
      cancelAnimationFrame(raf);
    };
  }, [variantIndex, variant, reducedMotion]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden px-6 transition-colors duration-500",
        isDark ? "bg-[#0a0a0a]" : "bg-[#ffffff]",
      )}
      style={{ containerType: "inline-size" }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.06),transparent_64%)]"
            : "bg-[radial-gradient(ellipse_at_50%_42%,rgba(15,15,17,0.06),transparent_64%)]",
        )}
      />
      <div
        className={cn(
          "relative z-10 transition-all duration-500 ease-out",
          exiting ? "translate-y-2 opacity-0 blur-[8px] scale-[0.96]" : "translate-y-0 opacity-100 blur-0 scale-100",
        )}
      >
        <KineticSplitText
          key={variant}
          ref={ref}
          text={CARD_COPY[variant]}
          split="lines"
          variant={variant}
          direction="up"
          trigger="manual"
          fontFamily="inherit"
          fontSize="clamp(1.8rem, 9cqi, 3rem)"
          fontWeight={900}
          lineHeight={0.9}
          letterSpacing="-0.04em"
          textAlign="center"
          color={isDark ? "#ffffff" : "#000000"}
        />
      </div>
    </div>
  );
}
