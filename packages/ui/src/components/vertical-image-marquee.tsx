"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface VerticalImageMarqueeItem {
  src: string;
  alt: string;
}

export interface VerticalImageMarqueeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Portraits repeated in a seamless vertical loop. */
  items: readonly VerticalImageMarqueeItem[];
  /** Seconds for one complete set of images to travel through the stage. */
  duration?: number;
  /** Space between consecutive portraits in CSS pixels. */
  gap?: number;
  /** The portrait width relative to the available stage width. */
  imageWidth?: string;
  /** CSS aspect ratio for every image panel. */
  aspectRatio?: string;
  /** Pause the decorative loop while a pointer is over it. */
  pauseOnHover?: boolean;
}

/**
 * A restrained, editorial vertical image loop. A duplicated image sequence
 * travels exactly one sequence-height, so the reset is visually seamless.
 */
export function VerticalImageMarquee({
  items,
  duration = 15.2,
  gap = 72,
  imageWidth = "min(88%, 31rem)",
  aspectRatio = "0.61",
  pauseOnHover = false,
  className,
  style,
  ...props
}: VerticalImageMarqueeProps) {
  const safeItems = items.length ? items : [];
  const sequence = [...safeItems, ...safeItems];

  if (!safeItems.length) return null;

  return (
    <div
      role="img"
      aria-label="Continuously moving vertical image gallery"
      className={cn(
        "vertical-image-marquee relative isolate h-full min-h-[28rem] w-full overflow-hidden bg-white text-black transition-colors dark:bg-black dark:text-white",
        pauseOnHover && "group",
        className,
      )}
      style={
        {
          "--vertical-image-marquee-duration": `${Math.max(0.1, duration)}s`,
          "--vertical-image-marquee-gap": `${Math.max(0, gap)}px`,
          "--vertical-image-marquee-width": imageWidth,
          "--vertical-image-marquee-aspect": aspectRatio,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <style>{`
        @keyframes vertical-image-marquee-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, calc(-50% - var(--vertical-image-marquee-gap) / 2), 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vertical-image-marquee-track { animation-play-state: paused !important; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className={cn(
          "vertical-image-marquee-track flex w-full flex-col items-center will-change-transform",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{
          gap: "var(--vertical-image-marquee-gap)",
          animation:
            "vertical-image-marquee-scroll var(--vertical-image-marquee-duration) linear infinite",
        }}
      >
        {sequence.map((item, index) => (
          <figure
            key={`${item.src}-${index}`}
            className="m-0 w-[var(--vertical-image-marquee-width)] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900"
            style={{ aspectRatio: "var(--vertical-image-marquee-aspect)" }}
          >
            <img
              src={item.src}
              alt=""
              draggable={false}
              className="block h-full w-full select-none object-cover"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export default VerticalImageMarquee;
