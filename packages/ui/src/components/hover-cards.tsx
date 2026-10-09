"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface HoverCardsItem {
  id: string;
  src: string;
  alt: string;
  label: string;
  description: string;
  /** Optional crop position passed to the foreground and backdrop images. */
  objectPosition?: string;
  /** Choose the text contrast used while this card supplies the backdrop. */
  textTone?: "light" | "dark";
}

export interface HoverCardsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "onChange"
> {
  items: readonly HoverCardsItem[];
  title?: React.ReactNode;
  /** Active card for controlled usage. `null` restores the idle stage. */
  activeIndex?: number | null;
  /** Active card used when the component is uncontrolled. */
  initialActiveIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  /** Return to the idle layout when a mouse leaves the whole composition. */
  clearOnLeave?: boolean;
  /** Blur radius for the full-bleed active image, in px. */
  backdropBlur?: number;
  /** Auto-advance through cards on a timer. @default false */
  autoPlay?: boolean;
  /** Auto-play interval in ms. @default 3000 */
  autoPlayInterval?: number;
  /** Pause auto-play while the pointer hovers or focus is inside. @default true */
  pauseAutoPlayOnHover?: boolean;
}

const clampIndex = (index: number | null | undefined, count: number) => {
  if (index == null || count === 0) return null;
  return Math.min(Math.max(Math.round(index), 0), count - 1);
};

export function HoverCards({
  items,
  title = "Hover Cards",
  activeIndex,
  initialActiveIndex = null,
  onActiveIndexChange,
  clearOnLeave = true,
  backdropBlur = 44,
  autoPlay = false,
  autoPlayInterval = 3000,
  pauseAutoPlayOnHover = true,
  className,
  style,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: HoverCardsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const holdUntilRef = React.useRef(0);
  const [autoPaused, setAutoPaused] = React.useState(false);
  const paused = pauseAutoPlayOnHover && autoPaused;
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState<
    number | null
  >(() => clampIndex(initialActiveIndex, items.length));
  const controlled = activeIndex !== undefined;
  const resolvedIndex = clampIndex(
    controlled ? activeIndex : uncontrolledIndex,
    items.length,
  );
  const activeItem = resolvedIndex == null ? null : items[resolvedIndex];
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncHeight = (height: number) => {
      root.style.setProperty("--hover-cards-height", `${height}px`);
    };

    syncHeight(root.clientHeight);
    const observer = new ResizeObserver(([entry]) => {
      syncHeight(entry?.contentRect.height ?? root.clientHeight);
    });
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  const setActive = React.useCallback(
    (nextIndex: number | null) => {
      const next = clampIndex(nextIndex, items.length);
      if (!controlled) setUncontrolledIndex(next);
      onActiveIndexChange?.(next);
    },
    [controlled, items.length, onActiveIndexChange],
  );

  React.useEffect(() => {
    if (!controlled) {
      setUncontrolledIndex((current) => clampIndex(current, items.length));
    }
  }, [controlled, items.length]);

  /* Auto-play: advance on a timer while visible. Real hover, focus, or tap
     takes over — the timer yields while paused and for a beat after a tap. */
  React.useEffect(() => {
    if (!autoPlay || paused || reducedMotion || items.length <= 1) return;
    const root = rootRef.current;
    let visible = true;
    let io: IntersectionObserver | null = null;
    if (root && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      io.observe(root);
    }
    const id = window.setInterval(
      () => {
        if (!visible || document.hidden) return;
        if (Date.now() < holdUntilRef.current) return;
        setActive(
          resolvedIndex == null ? 0 : (resolvedIndex + 1) % items.length,
        );
      },
      Math.max(800, autoPlayInterval),
    );
    return () => {
      window.clearInterval(id);
      io?.disconnect();
    };
  }, [
    autoPlay,
    autoPlayInterval,
    paused,
    reducedMotion,
    items.length,
    resolvedIndex,
    setActive,
  ]);

  const textIsLight = activeItem?.textTone !== "dark";
  const transitionDuration = reducedMotion ? "0ms" : "680ms";
  const transition = `${transitionDuration} cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <div
      ref={rootRef}
      data-active={resolvedIndex == null ? "false" : "true"}
      data-slot="hover-cards"
      className={cn(
        "relative isolate h-full min-h-[30rem] w-full overflow-hidden bg-[#f4f3ef] text-[#181816] dark:bg-black dark:text-[#f4f2ed]",
        className,
      )}
      style={{ containerType: "inline-size", ...style }}
      onPointerEnter={(event) => {
        setAutoPaused(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setAutoPaused(false);
        if (clearOnLeave && event.pointerType === "mouse") setActive(null);
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        setAutoPaused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setAutoPaused(false);
          setActive(null);
        }
        onBlur?.(event);
      }}
      {...props}
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {items.map((item, index) => (
          <img
            key={item.id}
            src={item.src}
            alt=""
            draggable={false}
            className="absolute -inset-[8%] h-[116%] w-[116%] max-w-none object-cover will-change-[opacity,filter,transform]"
            style={{
              objectPosition: item.objectPosition,
              filter: `blur(${Math.max(0, backdropBlur)}px) saturate(.82)`,
              opacity: resolvedIndex === index ? 1 : 0,
              transform:
                resolvedIndex === index ? "scale(1.045)" : "scale(1.085)",
              transition: `opacity ${transition}, transform ${transition}`,
            }}
          />
        ))}
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-500 ease-out data-[visible=true]:opacity-100",
            textIsLight ? "bg-black/45" : "bg-white/45",
          )}
          data-visible={activeItem ? "true" : "false"}
        />
      </div>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] transition-colors duration-500",
          activeItem
            ? textIsLight
              ? "bg-black/5"
              : "bg-white/5"
            : "bg-transparent",
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 z-20 text-center text-[clamp(9px,1.4cqw,22px)] font-normal leading-none tracking-[-0.035em] transition-colors duration-500",
          activeItem
            ? textIsLight
              ? "text-white"
              : "text-black"
            : "text-[#181816] dark:text-[#f4f2ed]",
        )}
        style={{ top: "calc(var(--hover-cards-height, 30rem) * 0.013)" }}
      >
        {title}
      </div>

      <div
        role="list"
        aria-label={typeof title === "string" ? title : "Hover card gallery"}
        className="absolute inset-x-[6.4cqw] z-10 flex items-start gap-[clamp(2px,0.42cqw,12px)]"
        style={{
          top: "calc(var(--hover-cards-height, 30rem) * 0.0855)",
          height: "calc(var(--hover-cards-height, 30rem) * 0.83)",
        }}
      >
        {items.map((item, index) => {
          const isActive = resolvedIndex === index;
          const isDimmed = resolvedIndex != null && !isActive;

          return (
            <div
              role="listitem"
              key={item.id}
              className="min-w-0 basis-0"
              style={{
                flexGrow: isActive ? 1.72 : 1,
                transition: `flex-grow ${transition}`,
              }}
            >
              <button
                type="button"
                aria-pressed={isActive}
                aria-label={`${item.label}: ${item.description}`}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setActive(index);
                }}
                onFocus={() => setActive(index)}
                onClick={() => {
                  // Lend control to the tap for a beat so auto-play
                  // doesn't immediately advance away from it.
                  holdUntilRef.current = Date.now() + 4000;
                  setActive(index);
                }}
                className={cn(
                  "group/card block w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left outline-none",
                  "focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                )}
              >
                <span
                  className={cn(
                    "block font-mono text-[clamp(7px,0.75cqw,15px)] italic leading-none tracking-[-0.08em] transition-[color,opacity] duration-500",
                    activeItem
                      ? textIsLight
                        ? "text-white"
                        : "text-black"
                      : "text-[#181816] dark:text-[#f4f2ed]",
                    isDimmed ? "opacity-45" : "opacity-100",
                  )}
                  style={{
                    marginBottom:
                      "calc(var(--hover-cards-height, 30rem) * 0.0205)",
                  }}
                >
                  {String(index + 1).padStart(3, "0")}
                </span>

                <span
                  className={cn(
                    "relative block w-full overflow-hidden bg-black/10 transition-[height,filter,opacity] dark:bg-white/10",
                    isDimmed ? "opacity-60" : "opacity-100",
                  )}
                  style={{
                    height: isActive
                      ? "calc(var(--hover-cards-height, 30rem) * 0.645)"
                      : "calc(var(--hover-cards-height, 30rem) * 0.393)",
                    filter: isDimmed ? "saturate(.72) brightness(.82)" : "none",
                    transitionDuration,
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    draggable={false}
                    loading={index < 5 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full select-none object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    style={{ objectPosition: item.objectPosition }}
                  />
                </span>

                <span
                  className={cn(
                    "block truncate text-[clamp(7px,0.85cqw,16px)] leading-none tracking-[-0.045em] transition-[color,opacity,transform] duration-500",
                    activeItem
                      ? textIsLight
                        ? "text-white"
                        : "text-black"
                      : "text-[#181816] dark:text-[#f4f2ed]",
                    isActive
                      ? "pointer-events-none -translate-y-1 opacity-0"
                      : isDimmed
                        ? "opacity-45"
                        : "opacity-100",
                  )}
                  style={{
                    marginTop:
                      "calc(var(--hover-cards-height, 30rem) * 0.0225)",
                  }}
                >
                  {item.label}
                </span>

                <span
                  className={cn(
                    "block max-w-[30ch] text-balance text-[clamp(8px,0.9cqw,16px)] leading-[1.22] tracking-[-0.04em] transition-[color,opacity,transform] duration-500",
                    textIsLight ? "text-white" : "text-black",
                    isActive
                      ? "translate-y-0 opacity-100 delay-100"
                      : "pointer-events-none translate-y-2 opacity-0",
                    "@max-[420px]:hidden",
                  )}
                  style={{
                    marginTop:
                      "calc(var(--hover-cards-height, 30rem) * -0.012)",
                  }}
                >
                  {item.description}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default HoverCards;
