"use client";

import { useTheme } from "next-themes";
import { GlitchLiquidText } from "@workspace/ui/components/glitch-liquid-text";

export function GlitchLiquidTextPreview() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <GlitchLiquidText
      text="DAVINCIUI"
      fontFamily="Anton"
      fontSize={250}
      lineHeight={1.2}
      distortionStrength={0.42}
      liquidStrength={1}
      starburstStrength={0.28}
      backgroundColor={isDark ? "#080808" : "#f8fafc"}
      textColor={isDark ? "#ffffff" : "#18181b"}
      className="h-full w-full"
    />
  );
}
