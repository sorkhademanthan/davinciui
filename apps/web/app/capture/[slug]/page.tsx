"use client";

import * as React from "react";
import { notFound, useParams } from "next/navigation";
import { CinematicCardCarouselCardPreview } from "@/components/docs/previews/cinematic-card-carousel-card-preview";
import { HoverCardsCardPreview } from "@/components/docs/previews/hover-cards-card-preview";
import { SunlightEffectCardPreview } from "@/components/docs/previews/sunlight-effect-card-preview";
import { GeometricTrailCursorCardPreview } from "@/components/docs/previews/geometric-trail-cursor-card-preview";
import { PixelFlowCardPreview } from "@/components/docs/previews/pixel-flow-card-preview";
import { TextVideoMaskPlayground } from "@/components/docs/previews/text-video-mask-preview";
import { PixelWipeCarouselCardPreview } from "@/components/docs/previews/pixel-wipe-carousel-card-preview";
import { ScrollRevealImageAutoCardPreview } from "@/components/docs/previews/scroll-reveal-image-auto-card-preview";
import { GSAPTextCardPreview } from "@/components/docs/previews/gsap-text-card-preview";
import { LensDriftGridCardPreview } from "@/components/docs/previews/lens-drift-grid-card-preview";

/** Desktop media box of each homepage bento card (measured at 1440px). */
const SIZES: Record<string, { width: number; height: number }> = {
  "cinematic-card-carousel": { width: 656, height: 380 },
  "pixel-wipe-carousel": { width: 312, height: 380 },
  "sunlight-effect": { width: 312, height: 380 },
  "hover-cards": { width: 885, height: 340 },
  "pixel-flow": { width: 427, height: 340 },
  "gsap-text": { width: 427, height: 260 },
  "text-video-mask": { width: 427, height: 260 },
  "scroll-reveal-image": { width: 427, height: 260 },
  "lens-drift-grid": { width: 885, height: 300 },
  "geometric-trail-cursor": { width: 427, height: 300 },
};

/** Render above 1× (capped to 800px) so posters/videos stay sharp on retina. */
const SCALES: Record<string, number> = {
  "cinematic-card-carousel": 1.2,
  "pixel-wipe-carousel": 2,
  "sunlight-effect": 2,
  "hover-cards": 0.9,
  "pixel-flow": 1.8,
  "gsap-text": 1.8,
  "text-video-mask": 1.8,
  "scroll-reveal-image": 1.8,
  "lens-drift-grid": 1,
  "geometric-trail-cursor": 1.8,
};

type CaptureEntry = {
  node: React.ReactNode;
  mediaClass: string;
};

function getEntry(slug: string): CaptureEntry | null {
  switch (slug) {
    case "cinematic-card-carousel":
      return {
        node: <CinematicCardCarouselCardPreview />,
        mediaClass: "pointer-events-none absolute inset-0 scale-[1.6]",
      };
    case "pixel-wipe-carousel":
      return {
        node: <PixelWipeCarouselCardPreview />,
        mediaClass: "pointer-events-none absolute inset-0",
      };
    case "sunlight-effect":
      return {
        node: <SunlightEffectCardPreview />,
        mediaClass: "pointer-events-none absolute inset-0",
      };
    case "hover-cards":
      return {
        node: <HoverCardsCardPreview />,
        mediaClass: "absolute inset-0",
      };
    case "pixel-flow":
      return {
        node: <PixelFlowCardPreview />,
        mediaClass: "pointer-events-none absolute inset-0",
      };
    case "gsap-text":
      return {
        node: <GSAPTextCardPreview fontSize={40} />,
        mediaClass: "absolute inset-0",
      };
    case "text-video-mask":
      return {
        node: <TextVideoMaskPlayground />,
        mediaClass: "pointer-events-none absolute inset-0",
      };
    case "scroll-reveal-image":
      return {
        node: <ScrollRevealImageAutoCardPreview />,
        mediaClass: "absolute inset-0",
      };
    case "lens-drift-grid":
      return {
        node: <LensDriftGridCardPreview />,
        mediaClass: "absolute inset-0",
      };
    case "geometric-trail-cursor":
      return {
        node: <GeometricTrailCursorCardPreview />,
        mediaClass: "absolute inset-0",
      };
    default:
      return null;
  }
}

export default function CapturePage() {
  // Dev-only capture helper for scripts/capture-home-previews.mjs.
  if (process.env.NODE_ENV === "production") notFound();

  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const entry = getEntry(slug);
  const native = SIZES[slug] ?? { width: 760, height: 480 };
  const scale = SCALES[slug] ?? 1;
  const stageWidth = Math.round(native.width * scale);
  const stageHeight = Math.round(native.height * scale);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      data-capture-ready={ready ? "true" : "false"}
      data-capture-slug={slug}
      data-capture-width={stageWidth}
      data-capture-height={stageHeight}
      className="relative overflow-hidden bg-zinc-50 dark:bg-background"
      style={{ width: stageWidth, height: stageHeight }}
    >
      <style>{`nextjs-portal{display:none!important}`}</style>
      <div
        className="relative"
        style={{
          width: native.width,
          height: native.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {entry ? <div className={entry.mediaClass}>{entry.node}</div> : null}
      </div>
    </div>
  );
}
