"use client";

import { useTheme } from "next-themes";
import { GlitchLiquidText } from "@workspace/ui/components/glitch-liquid-text";

export function GlitchLiquidTextPreview() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <GlitchLiquidText
      text={"DAVINCIUI\nCOMPONENTS"}
      fontFamily="Anton"
      fontSize={180}
      lineHeight={0.95}
      distortionStrength={0.42}
      liquidStrength={1.1}
      backgroundColor={isDark ? "#141414" : "#f8fafc"}
      textColor={isDark ? "#f5f5f5" : "#18181b"}
      className="h-full w-full"
    />
  );
}
