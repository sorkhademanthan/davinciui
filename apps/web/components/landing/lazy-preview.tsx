"use client";

import * as React from "react";
import { useInViewport } from "@/hooks/use-in-viewport";

/**
 * Defers mounting a heavy preview until its card is near the viewport.
 * Latching (once mounted, stays mounted) avoids re-initializing canvases /
 * animation loops when the user scrolls back up. The layout box is always
 * rendered so the grid does not shift.
 */
export function LazyPreview({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, inView } = useInViewport({ rootMargin: "400px 0px" });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (inView) setMounted(true);
  }, [inView]);

  return (
    <div ref={ref} className={className}>
      {mounted ? children : null}
    </div>
  );
}
