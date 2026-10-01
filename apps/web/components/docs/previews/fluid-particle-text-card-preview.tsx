"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { FluidParticleText } from "@workspace/ui/components/fluid-particle-text";
import { useAmbientInnerDrive } from "./use-ambient-inner-drive";

/**
 * Self-playing card thumbnail for Particle Flow.
 * Same tuning as the docs-side preview (showcase preset, roomy padding,
 * bold stroke) with a slow, narrow ambient sweep so the type mostly rests
 * solid and only breathes liquid around the drifting pointer — calm, not
 * churned. Real user input takes over momentarily.
 */
export function FluidParticleTextCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useAmbientInnerDrive(hostRef, {
    phase: 1.4,
    speed: 0.45,
    radiusX: 0.3,
    radiusY: 0.12,
  });

  useEffect(() => {
    const host = hostRef.current;
    const dot = dotRef.current;
    if (!host || !dot) return;
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width < 2) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dot.style.opacity = "1";
      dot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
    };
    const onLeave = () => {
      dot.style.opacity = "0";
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      <FluidParticleText
        preset="showcase"
        text="INK"
        padding={0.16}
        color={isDark ? "#f4f4f5" : "#18181b"}
        background={isDark ? "#09090b" : "#fafafa"}
        maxParticles={40000}
        maxDpr={1}
        outline
        strokeWidth={2.25}
        fillOpacity={1}
        className="h-full w-full"
      />
      {/* Virtual-cursor ring — follows the ambient driver + real hover */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 size-2.5 rounded-full opacity-0 mix-blend-difference transition-opacity duration-300"
        style={{
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 0 0 3px rgba(255,255,255,0.25), 0 0 14px rgba(255,255,255,0.6)",
        }}
      />
    </div>
  );
}
