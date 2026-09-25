"use client";

import * as React from "react";
import {
  KINETIC_VARIANT_META,
  KINETIC_VARIANTS,
  KineticSplitText,
  type KineticSplitTextHandle,
  type KineticVariant,
} from "@workspace/ui/components/kinetic-split-text";

const CARD_TEXT = "MOTION\nIS\nALIVE.";
const CARD_LINES = 3;
const HOLD_MS = 1500;
const EXIT_MS = 400;

/**
 * Gallery card — one strong composition cycling through all five motion
 * styles: play → hold → masked exit → next variant. Pauses offscreen.
 */
export function KineticSplitTextCardPreview() {
  const ref = React.useRef<KineticSplitTextHandle>(null);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const inViewRef = React.useRef(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [variantIndex, setVariantIndex] = React.useState(0);
  const variant: KineticVariant = KINETIC_VARIANTS[variantIndex] ?? "editorial-rise";

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    return () => io.disconnect();
  }, [reducedMotion]);

  React.useEffect(() => {
    if (reducedMotion) return;
    let disposed = false;
    let holdTimer = 0;
    let raf = 0;
    const meta = KINETIC_VARIANT_META[variant];
    const playMs = meta.duration * 1000 + (CARD_LINES - 1) * meta.stagger * 1000;
    if (inViewRef.current) ref.current?.play();
    // Hold the settled composition, then scrub back out (masked exit).
    holdTimer = window.setTimeout(() => {
      if (disposed || !inViewRef.current) {
        if (!disposed) setVariantIndex((i) => (i + 1) % KINETIC_VARIANTS.length);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        if (disposed) return;
        const t = Math.min(1, (now - t0) / EXIT_MS);
        if (inViewRef.current) ref.current?.setProgress(1 - t);
        if (t < 1) raf = requestAnimationFrame(tick);
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
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#09090b] px-6"
      style={{ containerType: "inline-size" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.08),transparent_64%)]" />
      <KineticSplitText
        ref={ref}
        text={CARD_TEXT}
        split="lines"
        variant={variant}
        direction="up"
        trigger="manual"
        fontFamily="inherit"
        fontSize="clamp(1.6rem, 8cqi, 2.6rem)"
        fontWeight={800}
        lineHeight={0.98}
        letterSpacing="-0.02em"
        textAlign="center"
        color="#fafafa"
      />
    </div>
  );
}
