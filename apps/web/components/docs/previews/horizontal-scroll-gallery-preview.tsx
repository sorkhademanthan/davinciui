"use client";

import { useEffect, useRef, useState } from "react";
import { HorizontalScrollGallery } from "@workspace/ui/components/horizontal-scroll-gallery";

/**
 * Direct-render docs embed (no iframe). The component is scroll-driven by
 * design, and an iframe isolates it from page scroll — which left the docs
 * preview dead. This keeps the real component inline, but gives it a bounded
 * internal scroll root so its vertical runway does not create a large empty
 * gap in the docs page.
 */
export function HorizontalScrollGalleryPreview() {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const [stageHeight, setStageHeight] = useState(420);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;
    const measure = () => setStageHeight(root.clientHeight || 420);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const cardHeight = Math.max(
    220,
    Math.min(540, Math.round(stageHeight * 0.78)),
  );

  return (
    <div
      ref={scrollRootRef}
      className="h-[420px] w-full overflow-y-auto overflow-x-hidden overscroll-y-contain bg-white [scrollbar-width:thin] sm:h-[436px] [[data-preview-expanded=true]_&]:h-[calc(100dvh-44px)] dark:bg-black"
      aria-label="Interactive horizontal gallery preview"
      tabIndex={0}
    >
      <HorizontalScrollGallery
        items={[
          {
            id: "green-fern",
            src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80",
            alt: "Green Fern",
            label: "Green Fern",
            widthRatio: 0.5,
          },
          {
            id: "yellow-flower",
            src: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80",
            alt: "Yellow Flower",
            label: "Yellow Flower",
            widthRatio: 0.55,
          },
          {
            id: "orange-bloom",
            src: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1600&q=80",
            alt: "Orange Flower",
            label: "Orange Flower",
            widthRatio: 0.48,
          },
          {
            id: "purple-field",
            src: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1600&q=80",
            alt: "Purple Flower",
            label: "Purple Flower",
            widthRatio: 0.52,
          },
        ]}
        height={`${cardHeight}px`}
        viewportHeight={`${stageHeight}px`}
        scrollDistance={0.55}
        scrollRoot={scrollRootRef}
      />
    </div>
  );
}
