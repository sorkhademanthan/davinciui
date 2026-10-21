"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@workspace/ui/lib/utils";

export interface AmbientStripItem {
  src: string;
  type?: "image" | "video";
  poster?: string;
  title?: string;
  subtitle?: string;
  tone?: "dark" | "light";
  alt?: string;
}

export interface AmbientStripProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  items: AmbientStripItem[];
  cardWidth?: number | "auto";
  expandScale?: number;
  gap?: number;
  blur?: number;
  loop?: boolean;
  restColor?: string;
  badge?: React.ReactNode;
  className?: string;
  onActiveChange?: (index: number | null) => void;
}

type Tone = "dark" | "light";
type ActiveTarget = { copyIndex: number; itemIndex: number };
type AmbientState = { index: number; key: string; fadeIn: boolean };

interface DragState {
  pointerId: number;
  startX: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
}

const ASPECT = 1.35;
const HOVER_DELAY = 40;
const SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
} as const;
const EDGE_MASK =
  "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => setWidth(node.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function useAutoTones(items: AmbientStripItem[]) {
  const [tones, setTones] = React.useState<Record<number, Tone>>({});
  const itemsRef = React.useRef(items);
  itemsRef.current = items;
  const itemsKey = items
    .map((item) => `${item.src}|${item.poster ?? ""}|${item.tone ?? ""}`)
    .join("::");

  React.useEffect(() => {
    let cancelled = false;

    itemsRef.current.forEach((item, index) => {
      if (item.tone) return;
      const source = item.type === "video" ? item.poster : item.src;
      if (!source) return;

      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (cancelled) return;

        try {
          const canvas = document.createElement("canvas");
          canvas.width = 8;
          canvas.height = 8;
          const context = canvas.getContext("2d", {
            willReadFrequently: true,
          });
          if (!context) return;

          context.drawImage(image, 0, 0, 8, 8);
          const data = context.getImageData(0, 0, 8, 8).data;

          let total = 0;
          for (let offset = 0; offset < data.length; offset += 4) {
            total +=
              0.2126 * (data[offset] ?? 0) +
              0.7152 * (data[offset + 1] ?? 0) +
              0.0722 * (data[offset + 2] ?? 0);
          }

          const luminance = total / (data.length / 4) / 255;
          const tone: Tone = luminance < 0.5 ? "dark" : "light";
          setTones((previous) =>
            previous[index] === tone
              ? previous
              : { ...previous, [index]: tone },
          );
        } catch {
          // Canvas sampling can fail on cross-origin media; keep the fallback.
        }
      };
      image.src = source;
    });

    return () => {
      cancelled = true;
    };
  }, [itemsKey]);

  return tones;
}

function CardMedia({ item }: { item: AmbientStripItem }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  if (item.type === "video") {
    return (
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        draggable={false}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />
    );
  }

  return (
    <img
      src={item.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
    />
  );
}

function AmbientMedia({ item }: { item: AmbientStripItem }) {
  if (item.type === "video" && item.poster) {
    return (
      <img
        src={item.poster}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (item.type === "video") {
    return (
      <video
        src={item.src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <img
      src={item.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function AmbientLayer({
  item,
  tone,
  blur,
  reduceMotion,
  outgoing,
  fadeIn,
}: {
  item: AmbientStripItem;
  tone: Tone;
  blur: number;
  reduceMotion: boolean;
  outgoing: boolean;
  fadeIn: boolean;
}) {
  const duration = reduceMotion ? 0.18 : outgoing ? 0.6 : 0.55;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0"
      initial={{ opacity: outgoing ? 1 : fadeIn ? 0 : 1 }}
      animate={{ opacity: outgoing ? 0 : 1 }}
      transition={{ duration, ease: reduceMotion ? "linear" : "easeOut" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          filter: `blur(${blur}px) saturate(1.35)`,
          willChange: "transform",
        }}
        initial={false}
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1.5, 1.6, 1.5],
                x: ["-1.5%", "1.5%", "-1.5%"],
                y: ["1%", "-1%", "1%"],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <AmbientMedia item={item} />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor:
              tone === "dark" ? "rgba(0, 0, 0, 0.25)" : "transparent",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

interface AmbientCardProps {
  item: AmbientStripItem;
  itemIndex: number;
  copyIndex: number;
  tone: Tone;
  width: number;
  height: number;
  expandedWidth: number;
  expandedHeight: number;
  expanded: boolean;
  dimmed: boolean;
  tabIndex: number;
  reduceMotion: boolean;
  onCardFocus: (target: ActiveTarget) => void;
  onCardBlur: (event: React.FocusEvent<HTMLElement>) => void;
  onCardKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
}

function AmbientCard({
  item,
  itemIndex,
  copyIndex,
  tone,
  width,
  height,
  expandedWidth,
  expandedHeight,
  expanded,
  dimmed,
  tabIndex,
  reduceMotion,
  onCardFocus,
  onCardBlur,
  onCardKeyDown,
}: AmbientCardProps) {
  const captionId = React.useId();
  const caption =
    [item.title, item.subtitle].filter(Boolean).join(", ") || item.alt;

  return (
    <motion.article
      data-ambient-card="true"
      data-copy-index={copyIndex}
      data-item-index={itemIndex}
      role="group"
      aria-labelledby={captionId}
      tabIndex={tabIndex}
      initial={false}
      animate={{
        width: expanded ? expandedWidth : width,
        height: expanded ? expandedHeight : height,
        opacity: dimmed ? 0.85 : 1,
        boxShadow: expanded
          ? "0 40px 80px -30px rgba(0, 0, 0, 0.45)"
          : "0 0 0 rgba(0, 0, 0, 0)",
      }}
      transition={
        reduceMotion
          ? { duration: 0.18, ease: "linear" }
          : {
              width: SPRING,
              height: SPRING,
              opacity: { duration: 0.25, ease: "easeOut" },
              boxShadow: { duration: 0.35, ease: "easeOut" },
            }
      }
      onFocus={(event) => {
        if (!event.currentTarget.matches(":focus-visible")) return;
        onCardFocus({ copyIndex, itemIndex });
      }}
      onBlur={onCardBlur}
      onKeyDown={onCardKeyDown}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[9px] bg-neutral-900 outline-none",
        "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30",
      )}
      style={{ flex: "0 0 auto", zIndex: expanded ? 10 : 1 }}
    >
      <CardMedia item={item} />

      <span id={captionId} className="sr-only">
        {caption || `Media ${itemIndex + 1}`}
      </span>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        initial={false}
        animate={{ opacity: expanded ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0.12 : 0.24,
          delay: expanded ? 0.06 : 0,
          ease: reduceMotion ? "linear" : "easeOut",
        }}
        style={{
          background:
            tone === "dark"
              ? "linear-gradient(to top, rgba(0, 0, 0, 0.58), transparent 62%)"
              : "linear-gradient(to top, rgba(255, 255, 255, 0.72), transparent 62%)",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-4 z-10"
        initial={false}
        animate={{
          opacity: expanded ? 1 : 0,
          y: expanded ? 0 : 6,
        }}
        transition={{
          duration: reduceMotion ? 0.12 : 0.24,
          delay: expanded ? 0.06 : 0,
          ease: reduceMotion ? "linear" : "easeOut",
        }}
      >
        {item.title ? (
          <p
            className={cn(
              "text-[13.5px] font-medium leading-tight",
              tone === "dark" ? "text-white" : "text-neutral-950",
            )}
          >
            {item.title}
          </p>
        ) : null}
        {item.subtitle ? (
          <p
            className={cn(
              "mt-1 font-mono text-[11px] leading-snug",
              tone === "dark" ? "text-white/65" : "text-neutral-800/70",
            )}
          >
            {item.subtitle}
          </p>
        ) : null}
      </motion.div>
    </motion.article>
  );
}

export function AmbientStrip({
  items,
  cardWidth = "auto",
  expandScale = 1.18,
  gap = 14,
  blur = 72,
  loop = true,
  restColor = "#c8c8c8",
  badge,
  className,
  style,
  onActiveChange,
  ...props
}: AmbientStripProps) {
  const hostRef = React.useRef<HTMLElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const containerWidth = useContainerWidth(hostRef);
  const hasHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const centerMode = hasHover === false;
  const tones = useAutoTones(items);

  const resolvedGap = Math.max(0, gap);
  const resolvedBlur = Math.max(0, blur);
  const resolvedExpandScale = Math.max(1, expandScale);
  const mobileLayout = containerWidth > 0 && containerWidth < 640;

  const resolvedCardWidth = React.useMemo(() => {
    if (typeof cardWidth === "number") return Math.max(48, cardWidth);
    if (containerWidth <= 0) return 150;
    return mobileLayout
      ? containerWidth * 0.56
      : clamp(containerWidth * 0.2, 150, 240);
  }, [cardWidth, containerWidth, mobileLayout]);

  const cardHeight = resolvedCardWidth * ASPECT;
  const expandedWidth = resolvedCardWidth * 1.08;
  const expandedHeight = cardHeight * resolvedExpandScale;
  const count = items.length;
  const setWidth = count * (resolvedCardWidth + resolvedGap);
  const copies =
    loop && count > 0
      ? Math.max(
          3,
          Math.ceil(1.5 + (containerWidth || 1) / Math.max(setWidth, 1)),
        )
      : 1;
  const totalCards = count * copies;

  const [hovered, setHovered] = React.useState<ActiveTarget | null>(null);
  const [focused, setFocused] = React.useState<ActiveTarget | null>(null);
  const [centerActive, setCenterActive] = React.useState<ActiveTarget | null>(
    null,
  );
  const [dragging, setDragging] = React.useState(false);
  const draggingRef = React.useRef(false);
  const pointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const hoverTimerRef = React.useRef<number | null>(null);
  const centerTimerRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const momentumRef = React.useRef<number | null>(null);

  const activeTarget = dragging
    ? null
    : centerMode
      ? centerActive
      : (hovered ?? focused);
  const activeItemIndex = activeTarget?.itemIndex ?? null;
  const anyActive = activeTarget !== null;

  const [ambientActive, setAmbientActive] = React.useState<AmbientState | null>(
    null,
  );
  const [ambientOutgoing, setAmbientOutgoing] =
    React.useState<AmbientState | null>(null);
  const lastAmbientIndexRef = React.useRef<number | null>(null);
  const ambientRevisionRef = React.useRef(0);

  React.useEffect(() => {
    const previous = lastAmbientIndexRef.current;
    if (previous === activeItemIndex) return;

    lastAmbientIndexRef.current = activeItemIndex;
    const revision = ++ambientRevisionRef.current;

    setAmbientActive(
      activeItemIndex === null
        ? null
        : {
            index: activeItemIndex,
            key: `active-${activeItemIndex}-${revision}`,
            fadeIn: previous === null,
          },
    );
    setAmbientOutgoing(
      previous === null
        ? null
        : {
            index: previous,
            key: `out-${previous}-${revision}`,
            fadeIn: false,
          },
    );

    const timeout = window.setTimeout(
      () => setAmbientOutgoing(null),
      reduceMotion ? 220 : 650,
    );
    return () => window.clearTimeout(timeout);
  }, [activeItemIndex, reduceMotion]);

  const onActiveChangeRef = React.useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;
  const reportedIndexRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (reportedIndexRef.current === activeItemIndex) return;
    const hadActive = reportedIndexRef.current !== null;
    reportedIndexRef.current = activeItemIndex;
    if (activeItemIndex !== null || hadActive) {
      onActiveChangeRef.current?.(activeItemIndex);
    }
  }, [activeItemIndex]);

  const updateCenterActive = React.useCallback(() => {
    if (!centerMode || draggingRef.current) return;
    const scroller = scrollRef.current;
    if (!scroller || count === 0) return;

    const step = resolvedCardWidth + resolvedGap;
    if (step <= 0) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    const copyIndex = clamp(Math.floor(center / step), 0, totalCards - 1);

    setCenterActive({ copyIndex, itemIndex: copyIndex % count });
  }, [centerMode, count, resolvedCardWidth, resolvedGap, totalCards]);

  const scheduleCenterUpdate = React.useCallback(() => {
    if (!centerMode) return;
    if (centerTimerRef.current !== null) return;

    centerTimerRef.current = window.setTimeout(() => {
      centerTimerRef.current = null;
      updateCenterActive();
    }, 80);
  }, [centerMode, updateCenterActive]);

  React.useEffect(() => {
    if (!centerMode) {
      setCenterActive(null);
      return;
    }
    scheduleCenterUpdate();
  }, [centerMode, scheduleCenterUpdate]);

  const evaluateHover = React.useCallback(() => {
    if (centerMode || draggingRef.current) return;
    const pointer = pointerRef.current;
    if (!pointer) {
      setHovered(null);
      return;
    }

    const element = document.elementFromPoint(pointer.x, pointer.y);
    const card =
      element instanceof Element
        ? element.closest<HTMLElement>("[data-ambient-card]")
        : null;

    if (!card) {
      setHovered(null);
      return;
    }

    setHovered({
      copyIndex: Number(card.dataset.copyIndex ?? 0),
      itemIndex: Number(card.dataset.itemIndex ?? 0),
    });
  }, [centerMode]);

  const scheduleHover = React.useCallback(() => {
    if (centerMode || draggingRef.current) return;
    if (hoverTimerRef.current !== null) return;

    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      evaluateHover();
    }, HOVER_DELAY);
  }, [centerMode, evaluateHover]);

  const handleScroll = React.useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    if (loop && setWidth > 0) {
      const left = scroller.scrollLeft;
      if (left < setWidth * 0.5) {
        scroller.scrollLeft = left + setWidth;
      } else if (left > setWidth * 1.5) {
        scroller.scrollLeft = left - setWidth;
      }
    }

    if (centerMode) scheduleCenterUpdate();
    else scheduleHover();
  }, [centerMode, loop, scheduleCenterUpdate, scheduleHover, setWidth]);

  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || count === 0) return;

    const offset = loop ? setWidth + (resolvedCardWidth + resolvedGap) / 2 : 0;
    scroller.scrollLeft = offset;
    setHovered(null);
    setFocused(null);
    setCenterActive(null);
    scheduleCenterUpdate();
  }, [
    count,
    copies,
    loop,
    resolvedCardWidth,
    resolvedGap,
    scheduleCenterUpdate,
    setWidth,
  ]);

  React.useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
      if (centerTimerRef.current !== null) {
        window.clearTimeout(centerTimerRef.current);
      }
      if (momentumRef.current !== null) {
        cancelAnimationFrame(momentumRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      const dominant =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const multiplier =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? scroller.clientWidth
            : 1;
      const delta = dominant * multiplier;
      if (Math.abs(delta) < 0.5) return;

      event.preventDefault();
      scroller.scrollLeft += delta;
      handleScroll();
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [handleScroll]);

  const stopMomentum = React.useCallback(() => {
    if (momentumRef.current === null) return;
    cancelAnimationFrame(momentumRef.current);
    momentumRef.current = null;
  }, []);

  const startMomentum = React.useCallback(
    (initialVelocity: number) => {
      stopMomentum();
      let velocity = initialVelocity;
      let lastTime = performance.now();

      const step = (now: number) => {
        const scroller = scrollRef.current;
        const deltaTime = Math.min(40, Math.max(0, now - lastTime));
        lastTime = now;

        if (!scroller || Math.abs(velocity) < 0.02) {
          momentumRef.current = null;
          if (centerMode) scheduleCenterUpdate();
          else scheduleHover();
          return;
        }

        scroller.scrollLeft += velocity * deltaTime;
        handleScroll();
        velocity *= Math.pow(0.94, deltaTime / 16.667);
        momentumRef.current = requestAnimationFrame(step);
      };

      momentumRef.current = requestAnimationFrame(step);
    },
    [
      centerMode,
      handleScroll,
      scheduleCenterUpdate,
      scheduleHover,
      stopMomentum,
    ],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const scroller = scrollRef.current;
    if (!scroller) return;

    stopMomentum();
    pointerRef.current = { x: event.clientX, y: event.clientY };
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };
    draggingRef.current = true;
    setDragging(true);
    setHovered(null);
    setFocused(null);
    scroller.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      scheduleHover();
      return;
    }

    const scroller = scrollRef.current;
    if (!scroller) return;

    const now = performance.now();
    const deltaTime = Math.max(1, now - drag.lastTime);
    const dx = event.clientX - drag.lastX;

    drag.velocity = -dx / deltaTime;
    drag.lastX = event.clientX;
    drag.lastTime = now;
    if (Math.abs(event.clientX - drag.startX) > 3) drag.moved = true;

    scroller.scrollLeft -= dx;
    handleScroll();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    draggingRef.current = false;
    setDragging(false);

    const scroller = scrollRef.current;
    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    if (drag.moved && Math.abs(drag.velocity) > 0.02) {
      startMomentum(drag.velocity);
    } else {
      if (centerMode) scheduleCenterUpdate();
      else scheduleHover();
    }
  };

  const handlePointerLeave = () => {
    if (draggingRef.current) return;
    pointerRef.current = null;
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHovered(null);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const scroller = scrollRef.current;
    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-ambient-card]"),
    );
    const currentIndex = cards.indexOf(event.currentTarget);
    if (currentIndex < 0) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next =
      cards[(currentIndex + direction + cards.length) % cards.length];
    if (!next) return;

    next.focus({ preventScroll: true });
    next.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleCardBlur = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Element && next.closest("[data-ambient-card]")) return;
    setFocused(null);
  };

  const activeItem =
    activeItemIndex === null ? undefined : items[activeItemIndex];
  const activeTone: Tone =
    activeItem?.tone ??
    (activeItemIndex === null ? "dark" : (tones[activeItemIndex] ?? "dark"));

  return (
    <section
      ref={hostRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Ambient media strip"
      className={cn(
        "relative isolate flex w-full min-h-[100svh] flex-col justify-center overflow-hidden",
        className,
      )}
      style={
        {
          "--ambient-rest": restColor,
          backgroundColor: restColor,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {ambientActive && items[ambientActive.index] ? (
          <AmbientLayer
            key={ambientActive.key}
            item={items[ambientActive.index]!}
            tone={activeTone}
            blur={resolvedBlur}
            reduceMotion={reduceMotion}
            outgoing={false}
            fadeIn={ambientActive.fadeIn}
          />
        ) : null}
        {ambientOutgoing && items[ambientOutgoing.index] ? (
          <AmbientLayer
            key={ambientOutgoing.key}
            item={items[ambientOutgoing.index]!}
            tone={
              items[ambientOutgoing.index]?.tone ??
              tones[ambientOutgoing.index] ??
              "dark"
            }
            blur={resolvedBlur}
            reduceMotion={reduceMotion}
            outgoing
            fadeIn={false}
          />
        ) : null}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={handlePointerLeave}
        className={cn(
          "relative z-10 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain select-none",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
          touchAction: "pan-y",
        }}
      >
        <div className="flex w-max items-center" style={{ gap: resolvedGap }}>
          {Array.from({ length: totalCards }, (_, copyIndex) => {
            const itemIndex = copyIndex % count;
            const item = items[itemIndex];
            if (!item) return null;

            const expanded =
              !dragging &&
              activeTarget?.copyIndex === copyIndex &&
              activeTarget.itemIndex === itemIndex;
            const dimmed = anyActive && !expanded;
            const tone = item.tone ?? tones[itemIndex] ?? "dark";
            const tabIndex = !loop
              ? 0
              : copyIndex >= count && copyIndex < count * 2
                ? 0
                : -1;

            return (
              <AmbientCard
                key={`${copyIndex}-${itemIndex}`}
                item={item}
                itemIndex={itemIndex}
                copyIndex={copyIndex}
                tone={tone}
                width={resolvedCardWidth}
                height={cardHeight}
                expandedWidth={expandedWidth}
                expandedHeight={expandedHeight}
                expanded={expanded}
                dimmed={dimmed}
                tabIndex={tabIndex}
                reduceMotion={reduceMotion}
                onCardFocus={(next) => {
                  setHovered(null);
                  setFocused(next);
                }}
                onCardBlur={handleCardBlur}
                onCardKeyDown={handleCardKeyDown}
              />
            );
          })}
        </div>
      </div>

      {badge ? (
        <div className="pointer-events-none absolute bottom-6 right-6 z-20 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[11px] font-medium tracking-[0.02em] text-neutral-700 shadow-sm backdrop-blur-md">
          {badge}
        </div>
      ) : null}
    </section>
  );
}

export default AmbientStrip;
