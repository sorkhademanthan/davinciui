"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { FocusCarousel } from "@workspace/ui/components/focus-carousel";
import { focusCarouselDemoItems } from "./focus-carousel-items";

const CARD_ITEMS = focusCarouselDemoItems.slice(0, 5);

export function FocusCarouselCardPreview() {
  const reduceMotion = useReducedMotion() ?? false;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setIndex((current) => current + 1);
    }, 2400);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#fafaf8] transition-colors duration-300 dark:bg-[#0a0a0b]"
    >
      <FocusCarousel
        items={CARD_ITEMS}
        index={index}
        onIndexChange={setIndex}
        showToggle={false}
        showCaption={false}
        activeWidth={136}
        sideWidth={70}
        gap={8}
        maxBlur={7}
        duration={0.6}
        draggable={false}
        responsive={false}
        className="h-full [min-height:0!important]"
      />
    </div>
  );
}
