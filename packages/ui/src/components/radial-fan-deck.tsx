"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface RadialFanDeckItem {
  id: string;
  title: string;
  image?: string;
  tone?: "ink" | "paper";
}

export interface RadialFanDeckProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Covers arranged around the shared pivot. */
  items?: RadialFanDeckItem[];
  /** Width of a cover in CSS pixels. */
  cardWidth?: number;
  /** Height divided by width for each cover. */
  cardAspectRatio?: number;
  /** Time for one closed → open → closed loop, in milliseconds. */
  cycleDuration?: number;
  /** Start angle of the first cover in degrees. */
  startAngle?: number;
  /** Total angular sweep of the expanded fan in degrees. */
  fanAngle?: number;
  /** Accessible name for the decorative deck. */
  ariaLabel?: string;
}

const defaultItems: RadialFanDeckItem[] = [
  { id: "cover", title: "BORN OF NATURE", tone: "ink" },
  {
    id: "silver",
    title: "LIMINAL FORM",
    image: "/images/spiral-3d-slider/silver-motion.jpg",
    tone: "paper",
  },
  {
    id: "night",
    title: "NOCTURNE",
    image: "/images/spiral-3d-slider/dark-glitch.jpg",
    tone: "ink",
  },
  {
    id: "prism",
    title: "PRISM STUDY",
    image: "/images/spiral-3d-slider/prism-portrait.jpg",
    tone: "paper",
  },
  {
    id: "teal",
    title: "SHAPESHIFT",
    image: "/images/spiral-3d-slider/teal-echo.jpg",
    tone: "ink",
  },
  {
    id: "red",
    title: "RED ECHO",
    image: "/images/spiral-3d-slider/red-echo.jpg",
    tone: "paper",
  },
  {
    id: "blue",
    title: "BLUE HOUR",
    image: "/images/spiral-3d-slider/blue-profile.jpg",
    tone: "ink",
  },
  {
    id: "figure",
    title: "SIGNAL BODY",
    image: "/images/spiral-3d-slider/red-blue-figure.jpg",
    tone: "paper",
  },
  {
    id: "white",
    title: "AFTER IMAGE",
    image: "/images/spiral-3d-slider/white-motion.jpg",
    tone: "ink",
  },
  {
    id: "crimson",
    title: "CRIMSON FIELD",
    image: "/images/spiral-3d-slider/crimson-profile.jpg",
    tone: "paper",
  },
  {
    id: "camera",
    title: "CONTACT SHEET",
    image: "/images/spiral-3d-slider/camera-reflection.jpg",
    tone: "ink",
  },
  {
    id: "orange",
    title: "HEAT MAP",
    image: "/images/spiral-3d-slider/orange-haze.jpg",
    tone: "paper",
  },
  {
    id: "green",
    title: "GREEN ROOM",
    image: "/images/spiral-3d-slider/green-portrait.jpg",
    tone: "ink",
  },
];

function DeckFace({ item, index }: { item: RadialFanDeckItem; index: number }) {
  const ink = item.tone !== "paper";

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden border border-white/15",
        ink ? "bg-[#090a0c] text-[#f4f0e6]" : "bg-[#f1f0e9] text-[#111217]",
      )}
    >
      {item.image && (
        <img
          src={item.image}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            ink ? "opacity-55 mix-blend-screen" : "opacity-70 grayscale",
          )}
        />
      )}
      <div
        className={cn(
          "absolute inset-0",
          ink
            ? "bg-[linear-gradient(135deg,rgba(0,0,0,0.06),rgba(0,0,0,0.72))]"
            : "bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(241,240,233,0.78))]",
        )}
      />
      <span className="absolute left-[6%] top-[7%] text-[clamp(4px,0.62cqw,8px)] font-medium tracking-[0.18em] opacity-70">
        {String(index + 1).padStart(2, "0")} / ARCHIVE
      </span>
      <span className="absolute bottom-[10%] left-[6%] right-[6%] font-serif text-[clamp(10px,2.05cqw,31px)] leading-[0.85] tracking-[-0.07em]">
        {item.title.split(" ").map((word, wordIndex) => (
          <React.Fragment key={`${word}-${wordIndex}`}>
            {word}
            {wordIndex < item.title.split(" ").length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
      <span
        className={cn(
          "absolute bottom-[6%] right-[6%] size-[clamp(8px,1.2cqw,16px)] rounded-full",
          ink ? "bg-[#f4f0e6]" : "bg-[#111217]",
        )}
      />
    </div>
  );
}

export function RadialFanDeck({
  items = defaultItems,
  cardWidth = 332,
  cardAspectRatio = 0.585,
  cycleDuration = 15400,
  startAngle = -24,
  fanAngle = 332,
  ariaLabel = "Animated radial fan deck",
  className,
  style,
  ...props
}: RadialFanDeckProps) {
  const cards = items.length > 0 ? items : defaultItems;
  const cardHeight = Math.round(cardWidth * cardAspectRatio);
  const sharedStyle = {
    "--radial-fan-card-width": `${cardWidth}px`,
    "--radial-fan-card-height": `${cardHeight}px`,
    "--radial-fan-cycle": `${Math.max(1200, cycleDuration)}ms`,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative isolate flex h-full min-h-[360px] w-full items-center justify-center overflow-hidden bg-[#f7f5e8] transition-colors duration-300 dark:bg-[#11120f]",
        className,
      )}
      style={sharedStyle}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.65),transparent_48%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.055),transparent_48%)]" />
      <div className="radial-fan-deck-stage relative h-full w-full" aria-hidden="true">
        {cards.map((item, index) => {
          const ratio = cards.length <= 1 ? 0 : index / (cards.length - 1);
          const angle = startAngle + ratio * fanAngle;
          const stackX = index * 1.45;
          const stackY = -index * 0.72;
          const stackRotation = index * 0.32;

          return (
            <article
              key={item.id}
              className="radial-fan-deck-card absolute left-1/2 top-1/2 w-[var(--radial-fan-card-width)] origin-bottom-left shadow-[0_16px_28px_rgba(20,20,16,0.16)]"
              style={
                {
                  height: "var(--radial-fan-card-height)",
                  zIndex: cards.length - index,
                  "--fan-angle": `${angle}deg`,
                  "--fan-stack-x": `${stackX}px`,
                  "--fan-stack-y": `${stackY}px`,
                  "--fan-stack-rotation": `${stackRotation}deg`,
                } as React.CSSProperties
              }
            >
              <DeckFace item={item} index={index} />
            </article>
          );
        })}
      </div>
      <style>{`
        @keyframes radial-fan-deck-motion {
          0%, 15% {
            transform: translate(calc(-50% + var(--fan-stack-x)), calc(-50% + var(--fan-stack-y))) rotate(var(--fan-stack-rotation));
          }
          55%, 69% {
            transform: translate(0, -100%) rotate(var(--fan-angle));
          }
          100% {
            transform: translate(calc(-50% + var(--fan-stack-x)), calc(-50% + var(--fan-stack-y))) rotate(var(--fan-stack-rotation));
          }
        }
        .radial-fan-deck-card {
          animation: radial-fan-deck-motion var(--radial-fan-cycle) cubic-bezier(0.16, 1, 0.3, 1) infinite both;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .radial-fan-deck-card { animation: none; }
        }
      `}</style>
    </div>
  );
}
