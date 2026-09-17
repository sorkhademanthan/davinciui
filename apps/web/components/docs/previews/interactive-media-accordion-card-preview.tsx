"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { InteractiveMediaAccordion } from "@workspace/ui/components/interactive-media-accordion";

const ITEMS = [
  {
    id: "mist",
    media:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
    title: "Mountains of Mist",
    description: "Wander into nature's hands.",
  },
  {
    id: "dunes",
    media:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=600&auto=format&fit=crop",
    title: "Golden Dunes",
    description: "Where the desert breathes.",
  },
  {
    id: "tide",
    media:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    title: "Emerald Tide",
    description: "Chase the endless horizon.",
  },
  {
    id: "aurora",
    media:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=600&auto=format&fit=crop",
    title: "Northern Aurora",
    description: "Light dancing on winter skies.",
  },
];

/**
 * Card preview that renders the production fullscreen component.
 * The card itself is the scroll container — scrolling over the card drives
 * the real `InteractiveMediaAccordion` in scroll mode via its sticky stage,
 * exactly like the fullscreen demo at `/demo/interactive-media-accordion`.
 * Wheel input is dampened so each card lingers, and progress ticks show
 * the active item, mirroring the other scroll-gallery card previews.
 */
export function InteractiveMediaAccordionCardPreview() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = React.useState(0);

  // Capture wheel intent over the card so scrolling scrubs the preview
  // instead of the page — native 1:1, exactly like the fullscreen demo.
  // Works even where overscroll-behavior is unsupported.
  // Pinch-zoom (ctrlKey) is never intercepted.
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const delta =
        e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (delta === 0) return;
      const max = el.scrollHeight - el.clientHeight;
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop >= max - 1;
      if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += delta;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleActiveChange = React.useCallback((index: number) => {
    setActive(index);
  }, []);

  if (reduceMotion) {
    const item = ITEMS[0]!;
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img
          src={item.media}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          overscrollBehaviorY: "contain",
        }}
      >
      <InteractiveMediaAccordion
        items={ITEMS}
        trigger="scroll"
        scrollStep={300}
        stickyTop={8}
        height={168}
        gap={6}
        collapsedWidth={44}
        tabletCollapsedWidth={36}
        mobileCollapsedWidth={30}
        radius={14}
        outerPadding={8}
        titleSize={16}
        descriptionSize={10}
        textGap={2}
        contentPadding={[12, 12]}
        duration={650}
        onActiveChange={handleActiveChange}
      />
      </div>
      {/* Scroll progress ticks — also signal the card is scrubbable */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {ITEMS.map((item, i) => (
          <span
            key={item.id}
            className={
              i === active
                ? "h-1 w-4 rounded-full bg-white/90"
                : "h-1 w-1 rounded-full bg-white/50"
            }
          />
        ))}
      </div>
    </div>
  );
}
