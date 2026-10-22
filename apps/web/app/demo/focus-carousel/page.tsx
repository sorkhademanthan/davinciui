"use client";

import * as React from "react";
import { FocusCarousel } from "@workspace/ui/components/focus-carousel";
import {
  focusCarouselDemoItems,
  focusCarouselThreeItems,
} from "@/components/docs/previews/focus-carousel-items";

type Variant =
  | "default"
  | "controlled"
  | "video"
  | "three"
  | "custom"
  | "reduced";

const VARIANTS: Variant[] = [
  "default",
  "controlled",
  "video",
  "three",
  "custom",
  "reduced",
];

function readVariant(): Variant {
  if (typeof window === "undefined") return "default";
  const requested = new URLSearchParams(window.location.search).get("variant");
  return VARIANTS.includes(requested as Variant)
    ? (requested as Variant)
    : "default";
}

export default function FocusCarouselDemoPage() {
  const [variant, setVariant] = React.useState<Variant>("default");
  const [controlledIndex, setControlledIndex] = React.useState(0);
  const [controlledMode, setControlledMode] = React.useState<"image" | "video">(
    "image",
  );

  React.useEffect(() => {
    setVariant(readVariant());
  }, []);

  const items =
    variant === "three" ? focusCarouselThreeItems : focusCarouselDemoItems;

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      {variant === "controlled" ? (
        <div className="fixed left-1/2 top-4 z-[60] flex -translate-x-1/2 gap-3">
          <button
            type="button"
            data-testid="controlled-prev"
            onClick={() =>
              setControlledIndex(
                (value) => (value - 1 + items.length) % items.length,
              )
            }
            className="rounded-full bg-[#111] px-3 py-1 text-[12px] text-white"
          >
            Prev
          </button>
          <span className="rounded-full bg-[#eee] px-3 py-1 text-[12px] text-[#111]">
            {controlledIndex + 1} / {items.length}
          </span>
          <button
            type="button"
            data-testid="controlled-next"
            onClick={() =>
              setControlledIndex((value) => (value + 1) % items.length)
            }
            className="rounded-full bg-[#111] px-3 py-1 text-[12px] text-white"
          >
            Next
          </button>
        </div>
      ) : null}

      {variant === "controlled" ? (
        <FocusCarousel
          key="controlled"
          items={items}
          index={controlledIndex}
          onIndexChange={setControlledIndex}
          mediaMode={controlledMode}
          onMediaModeChange={setControlledMode}
        />
      ) : variant === "video" ? (
        <FocusCarousel
          key="video"
          items={items}
          defaultMediaMode="video"
          defaultIndex={2}
        />
      ) : variant === "three" ? (
        <FocusCarousel key="three" items={items} defaultIndex={1} />
      ) : variant === "custom" ? (
        <FocusCarousel
          key="custom"
          items={items}
          activeWidth={300}
          sideWidth={156}
          gap={18}
          maxBlur={7}
          defaultIndex={3}
        />
      ) : variant === "reduced" ? (
        <FocusCarousel key="reduced" items={items} defaultIndex={0} />
      ) : (
        <FocusCarousel key="default" items={items} defaultIndex={0} />
      )}
    </main>
  );
}
