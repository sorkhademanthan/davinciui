"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@workspace/ui/lib/utils";

/* ---------------------------------- types --------------------------------- */

export type BentoSize = "auto" | "hero" | "large" | "regular" | "small";

export type BentoCaptionMode = "always" | "hover" | "hidden";

export interface BentoItem {
  src: string;
  title?: string;
  category?: string;
  description?: string;
  link?: string;
  size?: BentoSize;
  alt?: string;
}

export interface CMSMediaBentoProps {
  items?: BentoItem[];
  gap?: number;
  radius?: number;
  background?: string;
  captions?: BentoCaptionMode;
  hoverGrow?: number;
  focusDim?: number;
  hoverZoom?: number;
  mirror?: boolean;
  openLightbox?: boolean;
  transitionMs?: number;
  minHeight?: number;
  /** Width below which the layout collapses to the scrolling mobile grid. */
  mobileBreakpoint?: number;
  className?: string;
}

export interface BentoRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BentoTree =
  | { kind: "leaf"; index: number }
  | { kind: "h" | "v"; children: BentoTree[] };

/* -------------------------------- constants ------------------------------- */

export const BENTO_WEIGHTS: readonly number[] = [
  23, 10.5, 5.5, 5, 7.75, 4.5, 6.25, 5, 7, 10.5,
];

const SIZE_WEIGHTS: Record<Exclude<BentoSize, "auto">, number> = {
  hero: 23,
  large: 10.5,
  regular: 6.25,
  small: 5,
};

const leaf = (index: number): BentoTree => ({ kind: "leaf", index });
const h = (...children: BentoTree[]): BentoTree => ({ kind: "h", children });
const v = (...children: BentoTree[]): BentoTree => ({ kind: "v", children });

export const BENTO_WIDE_TREE: BentoTree = h(
  leaf(0),
  v(leaf(1), h(leaf(2), leaf(3))),
  v(leaf(4), h(leaf(5), leaf(6))),
  v(h(leaf(7), leaf(8)), leaf(9)),
);

export const BENTO_TALL_TREE: BentoTree = h(
  leaf(0),
  v(leaf(1), leaf(2), leaf(3)),
  v(h(leaf(4), leaf(5), leaf(6)), h(v(leaf(7), leaf(8)), leaf(9))),
);

export const BENTO_DEFAULT_ITEMS: BentoItem[] = [
  {
    src: "/images/spiral-3d-slider/blue-double.jpg",
    title: "Blue Double",
    category: "Editorial",
    description: "A double portrait cooled into a single blue field.",
    alt: "Blue Double",
  },
  {
    src: "/images/spiral-3d-slider/prism-portrait.jpg",
    title: "Prism",
    category: "Portrait",
    description: "Green and violet light broken across a face.",
    alt: "Prism",
  },
  {
    src: "/images/spiral-3d-slider/dark-glitch.jpg",
    title: "Night Shift",
    category: "Motion",
    description: "A portrait cut with scan lines and low evening color.",
    alt: "Night Shift",
  },
  {
    src: "/images/spiral-3d-slider/red-echo.jpg",
    title: "Red Echo",
    category: "Editorial",
    description: "A figure wrapped in a deep red wash.",
    alt: "Red Echo",
  },
  {
    src: "/images/spiral-3d-slider/visor-portrait.jpg",
    title: "Visor",
    category: "Portrait",
    description: "A portrait split by blue light and mirrored glass.",
    alt: "Visor",
  },
  {
    src: "/images/spiral-3d-slider/crimson-profile.jpg",
    title: "Crimson",
    category: "Editorial",
    description: "A profile lit by a narrow band of warm red light.",
    alt: "Crimson",
  },
  {
    src: "/images/spiral-3d-slider/blue-motion.jpg",
    title: "Blue Motion",
    category: "Motion",
    description: "A blue figure dissolving into movement.",
    alt: "Blue Motion",
  },
  {
    src: "/images/spiral-3d-slider/green-portrait.jpg",
    title: "Green Room",
    category: "Portrait",
    description: "A portrait suspended in a deep green haze.",
    alt: "Green Room",
  },
  {
    src: "/images/spiral-3d-slider/orange-haze.jpg",
    title: "Clay",
    category: "Texture",
    description: "Warm earth tones softened by a slow orange haze.",
    alt: "Clay",
  },
  {
    src: "/images/spiral-3d-slider/teal-echo.jpg",
    title: "Teal Echo",
    category: "Motion",
    description: "A teal figure dissolving into the dark at the frame edge.",
    alt: "Teal Echo",
  },
];

/* -------------------------------- solver ---------------------------------- */

function treeWeight(
  tree: BentoTree,
  weights: readonly number[],
  hoveredIndex: number | null,
  hoverGrow: number,
): number {
  if (tree.kind === "leaf") {
    const weight = weights[tree.index] ?? 0;
    return tree.index === hoveredIndex ? weight * hoverGrow : weight;
  }

  return tree.children.reduce(
    (sum, child) => sum + treeWeight(child, weights, hoveredIndex, hoverGrow),
    0,
  );
}

/**
 * Expand a weighted slicing tree into percentage rectangles. Horizontal (H)
 * nodes divide width by child weight, vertical (V) nodes divide height. The
 * hovered leaf's weight is multiplied before every split is solved, so the
 * entire composition reflows together.
 */
export function solveBentoLayout(
  tree: BentoTree,
  weights: readonly number[],
  hoveredIndex: number | null = null,
  hoverGrow = 1.8,
): BentoRect[] {
  const rects: BentoRect[] = [];

  const walk = (node: BentoTree, rect: BentoRect) => {
    if (node.kind === "leaf") {
      rects[node.index] = rect;
      return;
    }

    const total = treeWeight(node, weights, hoveredIndex, hoverGrow);
    if (total <= 0) return;

    const horizontal = node.kind === "h";
    let cursor = 0;

    for (const child of node.children) {
      const fraction =
        treeWeight(child, weights, hoveredIndex, hoverGrow) / total;
      const childRect = horizontal
        ? {
            x: rect.x + rect.w * cursor,
            y: rect.y,
            w: rect.w * fraction,
            h: rect.h,
          }
        : {
            x: rect.x,
            y: rect.y + rect.h * cursor,
            w: rect.w,
            h: rect.h * fraction,
          };

      walk(child, childRect);
      cursor += fraction;
    }
  };

  walk(tree, { x: 0, y: 0, w: 100, h: 100 });
  return rects;
}

function buildBalancedTree(
  indices: number[],
  weights: readonly number[],
  depth = 0,
): BentoTree {
  if (indices.length === 1) return leaf(indices[0]!);

  const horizontal = depth % 2 === 0;
  const total = indices.reduce((sum, index) => sum + (weights[index] ?? 0), 0);
  let split = 1;
  let running = weights[indices[0]!] ?? 0;

  for (let position = 1; position < indices.length; position += 1) {
    if (running >= total / 2) break;
    split = position + 1;
    running += weights[indices[position]!] ?? 0;
  }

  split = Math.min(Math.max(1, split), indices.length - 1);

  return {
    kind: horizontal ? "h" : "v",
    children: [
      buildBalancedTree(indices.slice(0, split), weights, depth + 1),
      buildBalancedTree(indices.slice(split), weights, depth + 1),
    ],
  };
}

export function resolveBentoTree(
  count: number,
  wide: boolean,
  items?: readonly BentoItem[],
): BentoTree {
  if (count === 10) return wide ? BENTO_WIDE_TREE : BENTO_TALL_TREE;

  const weights = Array.from({ length: count }, (_, index) => {
    const size = items?.[index]?.size;
    if (size && size !== "auto") return SIZE_WEIGHTS[size];
    return BENTO_WEIGHTS[index] ?? 6.25;
  });

  return buildBalancedTree(
    Array.from({ length: count }, (_, index) => index),
    weights,
  );
}

/* --------------------------------- hooks ---------------------------------- */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useElementSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

/* -------------------------------- subviews -------------------------------- */

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}

/* --------------------------------- lightbox ------------------------------- */

function Lightbox({
  items,
  index,
  onClose,
  onStep,
}: {
  items: BentoItem[];
  index: number;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const item = items[index];

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onStep(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onStep(-1);
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusables = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hasAttribute("disabled"));

      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onStep]);

  if (!item) return null;

  return createPortal(
    <div
      data-bento-lightbox=""
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(11,12,14,0.92)] p-6 backdrop-blur-[8px] motion-safe:animate-[bento-lightbox-in_.25s_ease-out]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title ?? "Media preview"}
        className="relative flex max-h-full max-w-full flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close media preview"
          onClick={onClose}
          className="absolute -right-2 -top-11 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <CloseIcon />
        </button>

        {items.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous media"
              onClick={() => onStep(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:-left-14"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next media"
              onClick={() => onStep(1)}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:-right-14"
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        ) : null}

        <div className="overflow-hidden rounded-[14px] leading-none motion-safe:animate-[bento-lightbox-media-in_.25s_ease-out]">
          <img
            src={item.src}
            alt={item.alt ?? item.title ?? ""}
            className="block max-h-[88vh] max-w-[92vw] rounded-[14px] object-contain"
          />
        </div>

        {item.title || item.category ? (
          <div className="absolute bottom-5 left-5 max-w-[min(80vw,560px)] text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.55)]">
            {item.category ? (
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/65">
                {item.category}
              </p>
            ) : null}
            {item.title ? (
              <p className="mt-1 text-[15px] font-medium leading-tight tracking-[-0.01em]">
                {item.title}
              </p>
            ) : null}
            {item.description ? (
              <p className="mt-1 max-w-[46ch] text-[12px] leading-5 text-white/70">
                {item.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------- component ------------------------------- */

export function CMSMediaBento({
  items = BENTO_DEFAULT_ITEMS,
  gap = 10,
  radius = 14,
  background,
  captions = "hover",
  hoverGrow = 1.8,
  focusDim = 0.35,
  hoverZoom = 1.04,
  mirror = false,
  openLightbox = true,
  transitionMs = 420,
  minHeight = 520,
  mobileBreakpoint = 520,
  className,
}: CMSMediaBentoProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const size = useElementSize(rootRef);
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const lastTriggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const stageHoverProps = {
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType === "touch") return;
      setHovered(null);
    },
    onBlur: (event: React.FocusEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setHovered(null);
      }
    },
  };

  const safeGap = Math.max(0, gap);
  const safeTransition = Math.max(0, transitionMs);
  const safeFocusDim = Math.max(0, Math.min(1, focusDim));
  const aspect = size.height > 0 ? size.width / size.height : 0;
  const isMobile = size.width > 0 && size.width < mobileBreakpoint;
  const wide = !isMobile && aspect >= 2.4;
  const tree = React.useMemo(
    () => resolveBentoTree(items.length, wide, items),
    [items, wide],
  );
  const weights = React.useMemo(
    () =>
      Array.from({ length: items.length }, (_, index) => {
        const sizeKey = items[index]?.size;
        if (sizeKey && sizeKey !== "auto") return SIZE_WEIGHTS[sizeKey];
        return BENTO_WEIGHTS[index] ?? 6.25;
      }),
    [items],
  );

  const liveRects = React.useMemo(
    () =>
      mirror
        ? solveBentoLayout(tree, weights, hovered, hoverGrow).map((rect) => ({
            ...rect,
            x: 100 - rect.x - rect.w,
          }))
        : solveBentoLayout(tree, weights, hovered, hoverGrow),
    [hovered, hoverGrow, mirror, tree, weights],
  );

  const stageWidth = Math.max(0, size.width - safeGap);
  const stageHeight = Math.max(0, size.height - safeGap);
  const transition = reducedMotion
    ? "none"
    : `left ${safeTransition}ms cubic-bezier(.22,1,.36,1), top ${safeTransition}ms cubic-bezier(.22,1,.36,1), width ${safeTransition}ms cubic-bezier(.22,1,.36,1), height ${safeTransition}ms cubic-bezier(.22,1,.36,1)`;

  const open = (index: number, trigger: HTMLElement) => {
    const link = items[index]?.link;

    if (link) {
      if (/^(https?:)?\/\//.test(link)) {
        window.open(link, "_blank", "noopener,noreferrer");
      } else {
        window.location.assign(link);
      }
      return;
    }

    if (openLightbox) {
      lastTriggerRef.current = trigger;
      setLightboxIndex(index);
    }
  };

  const closeLightbox = React.useCallback(() => {
    setLightboxIndex(null);
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0);
  }, []);

  const stepLightbox = React.useCallback(
    (direction: 1 | -1) => {
      setLightboxIndex((current) => {
        if (current === null || items.length === 0) return current;
        return (current + direction + items.length) % items.length;
      });
    },
    [items.length],
  );

  const surfaceStyle = {
    backgroundColor: background ?? "var(--bento-surface)",
    ...(background ? { "--bento-surface": background } : null),
    minHeight,
    "--bento-veil": `color-mix(in srgb, var(--bento-surface) ${
      safeFocusDim * 100
    }%, transparent)`,
  } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      data-cms-media-bento=""
      className={cn(
        "relative h-full w-full overflow-hidden",
        "[--bento-surface:#f2f1ee] dark:[--bento-surface:#0c0d0e]",
        className,
      )}
      style={surfaceStyle}
    >
      <style>{`@keyframes bento-lightbox-in{from{opacity:0}to{opacity:1}}@keyframes bento-lightbox-media-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}`}</style>

      {isMobile ? (
        <div
          data-bento-stage=""
          data-shown={mounted ? "true" : "false"}
          data-hush={hovered !== null ? "true" : "false"}
          className={cn(
            "grid h-full w-full grid-cols-2 content-start gap-[var(--bento-gap)] overflow-y-auto p-[var(--bento-gap)]",
            mounted && "shown",
            hovered !== null && "hush",
          )}
          style={
            {
              "--bento-gap": `${safeGap}px`,
            } as React.CSSProperties
          }
          {...stageHoverProps}
        >
          {items.map((item, index) => (
            <BentoTile
              key={`${item.src}-${index}`}
              item={item}
              index={index}
              rect={null}
              isMobile
              isHovered={hovered === index}
              hasHover={hovered !== null}
              captions={captions}
              radius={radius}
              hoverZoom={hoverZoom}
              reducedMotion={reducedMotion}
              transition={transition}
              mounted={mounted}
              onHover={setHovered}
              onOpen={open}
            />
          ))}
        </div>
      ) : (
        <div
          data-bento-stage=""
          data-shown={mounted ? "true" : "false"}
          data-hush={hovered !== null ? "true" : "false"}
          className={cn(
            "absolute",
            mounted && "shown",
            hovered !== null && "hush",
          )}
          style={{ inset: safeGap / 2 }}
          {...stageHoverProps}
        >
          {items.map((item, index) => {
            const rect = liveRects[index];
            if (!rect) return null;
            const tileWidth = (stageWidth * rect.w) / 100;
            const tileHeight = (stageHeight * rect.h) / 100;
            const shortSide = Math.max(
              0,
              Math.min(tileWidth, tileHeight) || 120,
            );
            const captionPadding = Math.max(
              12,
              Math.min(28, shortSide * 0.0753),
            );
            const captionSize = Math.max(13, Math.min(26, shortSide * 0.042));

            return (
              <BentoTile
                key={`${item.src}-${index}`}
                item={item}
                index={index}
                rect={rect}
                isMobile={false}
                isHovered={hovered === index}
                hasHover={hovered !== null}
                captions={captions}
                radius={radius}
                hoverZoom={hoverZoom}
                reducedMotion={reducedMotion}
                transition={transition}
                mounted={mounted}
                onHover={setHovered}
                onOpen={open}
                captionPadding={captionPadding}
                captionSize={captionSize}
                gap={safeGap}
              />
            );
          })}
        </div>
      )}

      {lightboxIndex !== null ? (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={closeLightbox}
          onStep={stepLightbox}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------- tile ---------------------------------- */

function BentoTile({
  item,
  index,
  rect,
  isMobile,
  isHovered,
  hasHover,
  captions,
  radius,
  hoverZoom,
  reducedMotion,
  transition,
  mounted,
  onHover,
  onOpen,
  captionPadding = 16,
  captionSize = 15,
  gap = 10,
}: {
  item: BentoItem;
  index: number;
  rect: BentoRect | null;
  isMobile: boolean;
  isHovered: boolean;
  hasHover: boolean;
  captions: BentoCaptionMode;
  radius: number;
  hoverZoom: number;
  reducedMotion: boolean;
  transition: string;
  mounted: boolean;
  onHover: (index: number | null) => void;
  onOpen: (index: number, trigger: HTMLElement) => void;
  captionPadding?: number;
  captionSize?: number;
  gap?: number;
}) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const captionVisible = isMobile
    ? captions !== "hidden"
    : captions === "always" || (captions === "hover" && isHovered);

  const dimOpacity = hasHover && !isHovered ? 1 : 0;

  const positionStyle: React.CSSProperties = isMobile
    ? ({
        gridColumn: index === 0 ? "1 / -1" : undefined,
        aspectRatio: index === 0 ? "16 / 9" : "1 / 1",
        minHeight: index === 0 ? 180 : 140,
        "--d": `${index * 60}ms`,
      } as React.CSSProperties)
    : rect
      ? ({
          left: `calc(${rect.x}% + ${gap / 2}px)`,
          top: `calc(${rect.y}% + ${gap / 2}px)`,
          width: `calc(${rect.w}% - ${gap}px)`,
          height: `calc(${rect.h}% - ${gap}px)`,
          transition,
          "--d": `${index * 60}ms`,
        } as React.CSSProperties)
      : {};

  return (
    <div
      data-bento-tile={index}
      data-bento-hovered={isHovered ? "true" : "false"}
      className={cn(
        "group relative",
        isMobile ? "w-full" : "absolute",
        isHovered && "lit",
      )}
      style={positionStyle}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        onHover(index);
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: radius,
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? "translateY(0) scale(1)"
            : "translateY(14px) scale(.985)",
          transition: reducedMotion
            ? "none"
            : `opacity .7s cubic-bezier(.22,1,.36,1) var(--d), transform .7s cubic-bezier(.22,1,.36,1) var(--d)`,
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-label={
            item.title
              ? `Open ${item.title}`
              : item.alt
                ? `Open ${item.alt}`
                : "Open media"
          }
          onClick={() => onOpen(index, buttonRef.current ?? document.body)}
          onFocus={() => {
            if (window.matchMedia("(hover: hover)").matches) onHover(index);
          }}
          className="absolute inset-0 z-0 block h-full w-full cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90"
          style={{ borderRadius: radius }}
        >
          <img
            src={item.src}
            alt={item.alt ?? item.title ?? ""}
            draggable={false}
            loading={index < 5 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full origin-center object-cover"
            style={{
              transform:
                !reducedMotion && isHovered
                  ? `scale(${hoverZoom})`
                  : "scale(1)",
              transition: reducedMotion
                ? "none"
                : "transform .6s cubic-bezier(.22,1,.36,1)",
            }}
          />

          <span
            aria-hidden="true"
            data-bento-shade=""
            className="bento-shade pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background:
                "linear-gradient(to top, rgba(11,12,14,0.72) 0%, rgba(11,12,14,0.324) 30%, rgba(11,12,14,0) 62%)",
            }}
          />

          <span
            aria-hidden="true"
            data-bento-veil=""
            className="bento-veil pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              opacity: dimOpacity,
              backgroundColor: "var(--bento-veil)",
            }}
          />

          {item.title ? (
            <span
              className="pointer-events-none absolute bottom-0 left-0 z-20 flex max-w-full flex-col items-start text-white"
              style={{
                padding: captionPadding,
                fontFamily:
                  'Inter, "Inter Placeholder", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                fontSize: captionSize,
                fontWeight: 400,
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
                opacity: captionVisible ? 1 : 0,
                transform: captionVisible ? "translateY(0)" : "translateY(6px)",
                transition: reducedMotion
                  ? "none"
                  : "opacity .3s ease, transform .3s ease",
                textShadow: "0 1px 14px rgba(0,0,0,0.45)",
              }}
            >
              <span className="line-clamp-2">{item.title}</span>
              {item.category ? (
                <span
                  className="mt-1 line-clamp-1 text-white/70"
                  style={{ fontSize: Math.max(10, captionSize * 0.72) }}
                >
                  {item.category}
                </span>
              ) : null}
            </span>
          ) : null}
        </button>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.08]"
          style={{ borderRadius: radius }}
        />
      </div>
    </div>
  );
}

export default CMSMediaBento;
