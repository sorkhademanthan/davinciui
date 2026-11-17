"use client";

import { useTheme } from "next-themes";
import { AshReveal } from "@workspace/ui/components/burn-plus";
import { cn } from "@/lib/utils";

/** Gallery card miniature — continuously cycles while the card is visible. */
export function BurnPlusCardPreview() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden transition-colors duration-500",
        isDark ? "bg-black" : "bg-[#f5f5f4]",
      )}
    >
      <AshReveal
        media="/images/spiral-3d-slider/orange-haze.webp"
        fit="fill"
        trigger="load"
        start={0.08}
        end={0.72}
        completeAt={0.72}
        density={0.18}
        distortion={0.12}
        edgeSoftness={0.22}
        edgeComplexity={0.05}
        duration={3200}
        direction="reveal"
        loop
        loopDelay={1400}
        quality={1}
        mobileQuality={0.8}
        background={isDark ? "#000000" : "#f5f5f4"}
        ariaLabel="Burn reveal card preview"
      />
    </div>
  );
}
