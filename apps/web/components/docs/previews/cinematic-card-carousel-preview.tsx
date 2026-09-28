"use client";

import {
  CinematicCardCarousel,
} from "@workspace/ui/components/cinematic-card-carousel";
import { cinematicDemoCards } from "./cinematic-card-carousel-items";

export function CinematicCardCarouselPreview() {
  return (
    <div className="h-full w-full">
      <CinematicCardCarousel
        items={cinematicDemoCards}
        initialIndex={2}
        className="h-full min-h-0"
      />
    </div>
  );
}
