"use client";

import * as React from "react";

export const TEXT_REVEAL_PREVIEW_SCROLLER =
  "[data-text-reveal-preview-scroll]";
export const TEXT_REVEAL_PREVIEW_TRIGGER =
  "[data-text-reveal-preview-trigger]";

/** Adds component-specific scroll distance without changing the demo page layout. */
export function TextRevealScrollStage({
  children,
}: {
  children: React.ReactNode;
}) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({
    stageHeight: 0,
    viewportHeight: 0,
  });

  React.useEffect(() => {
    const stage = stageRef.current;
    const scroller = stage?.closest<HTMLElement>(TEXT_REVEAL_PREVIEW_SCROLLER);
    if (!stage || !scroller) return;

    const updateStageSize = () => {
      const viewportHeight = Math.ceil(scroller.clientHeight);
      const stageHeight = viewportHeight + 480;
      setDimensions((current) =>
        current.stageHeight === stageHeight &&
        current.viewportHeight === viewportHeight
          ? current
          : { stageHeight, viewportHeight },
      );
    };

    updateStageSize();
    const observer = new ResizeObserver(updateStageSize);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      data-text-reveal-preview-trigger
      className="relative w-full"
      style={dimensions.stageHeight ? { height: dimensions.stageHeight } : undefined}
    >
      <div
        className={
          dimensions.viewportHeight
            ? "sticky top-0 flex w-full items-center justify-center px-6 sm:px-10"
            : "w-full"
        }
        style={dimensions.viewportHeight
          ? { height: dimensions.viewportHeight }
          : undefined}
      >
        {children}
      </div>
    </div>
  );
}
