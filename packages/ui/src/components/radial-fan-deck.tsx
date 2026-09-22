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
  /**
   * Controlled scroll position from 0 (stacked) to 1 (fully fanned).
   * When omitted, the deck derives the value from its position in the viewport.
   */
  scrollProgress?: number;
  /** Start angle of the first cover in degrees. */
  startAngle?: number;
  /** Total angular sweep of the expanded fan in degrees. */
  fanAngle?: number;
  /** Accessible name for the decorative deck. */
  ariaLabel?: string;
}

const defaultItems: RadialFanDeckItem[] = [
  { id: "cover", title: "BORN OF NATURE", tone: "ink" },
  { id: "silver", title: "LIMINAL FORM", tone: "paper" },
  { id: "night", title: "NOCTURNE", tone: "ink" },
  { id: "prism", title: "PRISM STUDY", tone: "paper" },
  { id: "teal", title: "SHAPESHIFT", tone: "ink" },
  { id: "red", title: "RED ECHO", tone: "paper" },
  { id: "blue", title: "BLUE HOUR", tone: "ink" },
  { id: "figure", title: "SIGNAL BODY", tone: "paper" },
  { id: "white", title: "AFTER IMAGE", tone: "ink" },
  { id: "crimson", title: "CRIMSON FIELD", tone: "paper" },
  { id: "camera", title: "CONTACT SHEET", tone: "ink" },
  { id: "orange", title: "HEAT MAP", tone: "paper" },
  { id: "green", title: "GREEN ROOM", tone: "ink" },
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

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function RadialFanDeck({
  items = defaultItems,
  cardWidth = 332,
  cardAspectRatio = 0.585,
  scrollProgress,
  startAngle = -24,
  fanAngle = 332,
  ariaLabel = "Animated radial fan deck",
  className,
  style,
  ...props
}: RadialFanDeckProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const cards = items.length > 0 ? items : defaultItems;
  const [measuredWidth, setMeasuredWidth] = React.useState(cardWidth);
  const [viewportProgress, setViewportProgress] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const progress = prefersReducedMotion
    ? 1
    : clamp(scrollProgress ?? viewportProgress);
  const measuredHeight = measuredWidth * cardAspectRatio;

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(motionQuery.matches);
    updatePreference();
    motionQuery.addEventListener("change", updatePreference);
    return () => motionQuery.removeEventListener("change", updatePreference);
  }, []);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const updateSize = () => {
      setMeasuredWidth(Math.min(cardWidth, host.clientWidth * 0.36));
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(host);
    return () => observer.disconnect();
  }, [cardWidth]);

  React.useEffect(() => {
    if (scrollProgress !== undefined) return;

    const updateProgress = () => {
      const host = hostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const start = window.innerHeight * 0.78;
      const end = window.innerHeight * 0.2;
      setViewportProgress(clamp((start - rect.top) / Math.max(1, start - end)));
    };

    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateProgress);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true, capture: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [scrollProgress]);

  const sharedStyle = {
    "--radial-fan-card-width": `min(${cardWidth}px, 36cqw)`,
    ...style,
  } as React.CSSProperties;

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative isolate flex h-full min-h-[360px] w-full items-center justify-center overflow-hidden bg-[#f7f5e8] transition-colors duration-300 dark:bg-[#11120f]",
        className,
      )}
      style={{ containerType: "size", ...sharedStyle }}
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
          const closedX = -measuredWidth / 2 + stackX;
          const closedY = -measuredHeight / 2 + stackY;
          const openRotation = angle;
          const translateX = closedX * (1 - progress);
          const translateY =
            closedY + (-measuredHeight - closedY) * progress;
          const rotation =
            stackRotation + (openRotation - stackRotation) * progress;

          return (
            <article
              key={item.id}
              className="radial-fan-deck-card absolute left-1/2 top-1/2 w-[var(--radial-fan-card-width)] origin-bottom-left shadow-[0_16px_28px_rgba(20,20,16,0.16)] will-change-transform"
              style={
                {
                  aspectRatio: `${1 / cardAspectRatio}`,
                  zIndex: cards.length - index,
                  transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotation}deg)`,
                } as React.CSSProperties
              }
            >
              <DeckFace item={item} index={index} />
            </article>
          );
        })}
      </div>
    </div>
  );
}
