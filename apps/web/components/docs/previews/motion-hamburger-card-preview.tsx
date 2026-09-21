"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MotionHamburger } from "@workspace/ui/components/motion/motion-hamburger";
import { cn } from "@/lib/utils";

export function MotionHamburgerCardPreview() {
  const [open, setOpen] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setOpen((value) => !value), 1600);
    return () => window.clearInterval(id);
  }, []);

  // Site default theme is dark — render the dark tile until hydrated.
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        isDark ? "bg-[#0c0c0e]" : "bg-[#fafafa]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.1),transparent_68%)]"
            : "bg-[radial-gradient(ellipse_at_50%_45%,rgba(24,24,27,0.08),transparent_68%)]",
        )}
      />
      <MotionHamburger
        open={open}
        onToggle={setOpen}
        size={64}
        color={isDark ? "#FFFFFF" : "#18181B"}
        thickness={2.5}
        hoverGrowth={1}
      />
    </div>
  );
}
