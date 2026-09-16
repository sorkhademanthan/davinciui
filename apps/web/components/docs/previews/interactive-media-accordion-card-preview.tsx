"use client";

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
 * Live mini accordion for the gallery card. The card itself is narrow, so
 * the component's own container-aware geometry kicks in (tablet pills);
 * auto-play advances the expanded state so the card demonstrates the
 * width-redistribution interaction without any pointer input.
 */
export function InteractiveMediaAccordionCardPreview() {
  return (
    <div className="absolute inset-0 bg-black p-2">
      <InteractiveMediaAccordion
        items={ITEMS}
        trigger="hover"
        height={176}
        gap={6}
        collapsedWidth={44}
        tabletCollapsedWidth={36}
        mobileCollapsedWidth={30}
        radius={14}
        titleSize={15}
        descriptionSize={9}
        textGap={2}
        contentPadding={[12, 12]}
        duration={650}
        autoPlay
        autoPlayInterval={2200}
        pauseAutoPlayOnHover={false}
      />
    </div>
  );
}
