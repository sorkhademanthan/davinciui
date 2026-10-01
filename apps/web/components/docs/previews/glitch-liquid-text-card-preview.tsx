"use client";

import { useRef } from "react";
import { useTheme } from "next-themes";
import { GlitchLiquidText } from "@workspace/ui/components/glitch-liquid-text";
import { useAmbientInnerDrive } from "./use-ambient-inner-drive";

/**
 * Self-playing card thumbnail for Chromatic Melt.
 * The inner driver dispatches pointerenter + pointermove directly on the
 * component root and sweeps the text band — the same chromatic melt you
 * get from dragging the cursor across the DAVINCIUI text, with no hover
 * required. The component's own magnetic cursor is enabled so the cursor
 * motion reads clearly; real user input takes over momentarily.
 */
export function GlitchLiquidTextCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useAmbientInnerDrive(hostRef, { phase: 2.6, speed: 0.7 });

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      <GlitchLiquidText
        text={"DAVINCIUI\nCOMPONENTS"}
        fontSize={48}
        fontWeight={800}
        lineHeight={0.95}
        backgroundColor={isDark ? "#09090b" : "#fafafa"}
        textColor={isDark ? "#f4f4f5" : "#18181b"}
        cursorEnabled
        distortionStrength={0.42}
        liquidStrength={1.1}
        glitchStrength={0.3}
        grainStrength={0.012}
        interactive
        autoAnimate
        className="h-full w-full"
      />
    </div>
  );
}
