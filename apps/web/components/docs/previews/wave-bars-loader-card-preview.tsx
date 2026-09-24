"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { WaveBarsLoader } from "@workspace/ui/components/wave-bars-loader";
import { cn } from "@/lib/utils";

/**
 * Gallery card for the wave bars loader: mint bars on the reference
 * very-dark-purple stage in dark mode, deep teal bars on a light stage in
 * light mode, centered with generous breathing room. The loader animates
 * automatically via CSS keyframes — no interaction needed.
 */
export function WaveBarsLoaderCardPreview() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Site default theme is dark — render the dark tile until hydrated.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        isDark ? "bg-[#120B1D]" : "bg-[#fafafa]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_45%,rgba(66,230,198,0.10),transparent_68%)]"
            : "bg-[radial-gradient(ellipse_at_50%_45%,rgba(13,148,136,0.10),transparent_68%)]",
        )}
      />
      <WaveBarsLoader
        size={54}
        color={isDark ? "#42E6C6" : "#0D9488"}
        speed={1}
      />
    </div>
  );
}
