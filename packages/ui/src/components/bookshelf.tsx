"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import * as React from "react";

export interface BookItem {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  cover?: string;
  color?: string;
  coverColor?: string;
  textColor?: string;
  accent?: string;
  width?: number;
  thickness?: number;
}

export interface BookshelfHandle {
  next: () => void;
  prev: () => void;
  play: () => void;
  pause: () => void;
}

export interface BookshelfProps extends React.HTMLAttributes<HTMLDivElement> {
  books: BookItem[];
  initialIndex?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  transitionDuration?: number;
  perspective?: number;
  bookHeight?: number;
  gap?: number;
  title?: string;
  showHeader?: boolean;
  showControls?: boolean;
  decorative?: boolean;
  label?: string;
  onActiveBookChange?: (index: number) => void;
}

export const BOOKSHELF_DEFAULTS = {
  initialIndex: 0,
  autoplay: true,
  autoplayInterval: 3.5,
  transitionDuration: 1,
  perspective: 1400,
  bookHeight: 340,
  gap: 18,
} as const;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const coverWidthOf = (book: BookItem) => Math.max(56, book.width ?? 170);
const spineWidthOf = (book: BookItem) => clamp(book.thickness ?? 22, 6, 80);
const openWidthOf = (book: BookItem) => coverWidthOf(book) + spineWidthOf(book);

function computeLayout(books: BookItem[], gap: number, activeIndex: number) {
  const widths = books.map((book, index) =>
    index === activeIndex ? openWidthOf(book) : spineWidthOf(book),
  );
  const lefts: number[] = [];
  let cursor = 0;
  for (let index = 0; index < books.length; index++) {
    lefts.push(cursor);
    cursor += (widths[index] ?? 0) + gap;
  }
  const total = Math.max(0, cursor - gap);
  const activeLeft = lefts[activeIndex] ?? 0;
  const activeWidth = widths[activeIndex] ?? 0;
  const maxTotal =
    books.reduce((sum, book, index) => {
      return sum + openWidthOf(book) + (index > 0 ? gap : 0);
    }, 0) || total;

  return {
    widths,
    lefts,
    total,
    maxTotal,
    activeCenter: activeLeft + activeWidth / 2,
  };
}

function isHexColor(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function readableTextColor(background: string) {
  if (!isHexColor(background)) return "#f5f1e8";
  const hex = background.slice(1);
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#141311" : "#f5f1e8";
}

function BoxFace({
  width,
  height,
  transform,
  style,
  className,
  children,
}: {
  width: number;
  height: number;
  transform: string;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute left-0 top-0 overflow-hidden", className)}
      style={{
        width,
        height,
        transform: `translate(-50%, -50%) ${transform}`,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface BoxFaceConfig {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

function Box3D({
  width,
  height,
  depth,
  x,
  y,
  z,
  front,
  back,
  left,
  right,
  top,
  bottom,
  className,
  style,
}: {
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  z: number;
  front?: BoxFaceConfig;
  back?: BoxFaceConfig;
  left?: BoxFaceConfig;
  right?: BoxFaceConfig;
  top?: BoxFaceConfig;
  bottom?: BoxFaceConfig;
  className?: string;
  style?: React.CSSProperties;
}) {
  const faces = [
    {
      key: "front",
      width,
      height,
      transform: `translateZ(${depth / 2}px)`,
      config: front,
    },
    {
      key: "back",
      width,
      height,
      transform: `translateZ(${-depth / 2}px) rotateY(180deg)`,
      config: back,
    },
    {
      key: "left",
      width: depth,
      height,
      transform: `translateX(${-width / 2}px) rotateY(-90deg)`,
      config: left,
    },
    {
      key: "right",
      width: depth,
      height,
      transform: `translateX(${width / 2}px) rotateY(90deg)`,
      config: right,
    },
    {
      key: "top",
      width,
      height: depth,
      transform: `translateY(${-height / 2}px) rotateX(90deg)`,
      config: top,
    },
    {
      key: "bottom",
      width,
      height: depth,
      transform: `translateY(${height / 2}px) rotateX(-90deg)`,
      config: bottom,
    },
  ];

  return (
    <div
      className={cn("absolute", className)}
      style={{
        left: x,
        top: y,
        width: 0,
        height: 0,
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {faces.map((face) =>
        face.config ? (
          <BoxFace
            key={face.key}
            width={face.width}
            height={face.height}
            transform={face.transform}
            style={face.config.style}
            className={face.config.className}
          >
            {face.config.children}
          </BoxFace>
        ) : null,
      )}
    </div>
  );
}

function BookCoverFace({
  book,
  width,
  height,
}: {
  book: BookItem;
  width: number;
  height: number;
}) {
  const baseColor = book.coverColor ?? book.color ?? "#191919";
  const textColor = book.textColor ?? readableTextColor(baseColor);
  const padding = clamp(width * 0.09, 10, 24);
  const contentWidth = Math.max(40, width - padding * 2);
  const longestWord = Math.max(
    ...book.title.split(/\s+/).map((word) => word.length),
    1,
  );
  const titleSize = clamp(
    Math.min(width * 0.155, contentWidth / (longestWord * 0.55)),
    12,
    height * 0.11,
  );
  const longTitle = book.title.length > 18;
  const authorSize = clamp(width * 0.045, 6, 10);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: baseColor, color: textColor }}
    >
      {book.cover ? (
        <img
          src={book.cover}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(120% 90% at 12% 0%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(160deg, transparent 35%, rgba(0,0,0,0.28) 100%)",
            }}
          />
          {book.accent && (
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[42%] aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[26%] opacity-90 blur-[0.2px]"
              style={{
                background: `radial-gradient(circle at 30% 25%, ${book.accent}, transparent 72%)`,
                boxShadow: `0 0 60px ${book.accent}55`,
              }}
            />
          )}
          <div className="relative flex h-full flex-col" style={{ padding }}>
            {book.subtitle && (
              <span
                className="break-words uppercase leading-[1.3] tracking-[0.32em] opacity-70"
                style={{ fontSize: authorSize }}
              >
                {book.subtitle}
              </span>
            )}
            <span
              className={cn(
                "mt-auto break-words font-serif font-medium leading-[0.92] tracking-[-0.045em]",
                longTitle ? "uppercase" : "",
              )}
              style={{ fontSize: titleSize }}
            >
              {book.title}
            </span>
            <span
              aria-hidden="true"
              className="mt-[8%] h-px w-full"
              style={{ background: `${textColor}44` }}
            />
            {book.author && (
              <span
                className="mt-[4%] break-words uppercase leading-[1.3] tracking-[0.24em] opacity-70"
                style={{ fontSize: authorSize }}
              >
                {book.author}
              </span>
            )}
          </div>
        </>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[12%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.32), rgba(0,0,0,0.08) 45%, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10"
      />
    </div>
  );
}

export const Bookshelf = React.forwardRef<BookshelfHandle, BookshelfProps>(
  function Bookshelf(
    {
      books = [],
      initialIndex = BOOKSHELF_DEFAULTS.initialIndex,
      autoplay = BOOKSHELF_DEFAULTS.autoplay,
      autoplayInterval = BOOKSHELF_DEFAULTS.autoplayInterval,
      transitionDuration = BOOKSHELF_DEFAULTS.transitionDuration,
      perspective = BOOKSHELF_DEFAULTS.perspective,
      bookHeight = BOOKSHELF_DEFAULTS.bookHeight,
      gap = BOOKSHELF_DEFAULTS.gap,
      title = "Favorite Books",
      showHeader = true,
      showControls = true,
      decorative = false,
      label = "Favorite books bookshelf",
      onActiveBookChange,
      className,
      style,
      ...props
    }: BookshelfProps,
    ref,
  ) {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const stageRef = React.useRef<HTMLDivElement | null>(null);
    const shelfRef = React.useRef<HTMLDivElement | null>(null);
    const slotRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const bookRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const coverRefs = React.useRef<Array<HTMLDivElement | null>>([]);
    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const timelineRef = React.useRef<gsap.core.Timeline | null>(null);
    const mountedRef = React.useRef(false);

    const [activeIndex, setActiveIndex] = React.useState(() =>
      clamp(initialIndex, 0, Math.max(0, books.length - 1)),
    );
    const [reducedMotion, setReducedMotion] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);
    const [manuallyPaused, setManuallyPaused] = React.useState(false);

    const booksRef = React.useRef(books);
    const gapRef = React.useRef(gap);
    const bookHeightRef = React.useRef(bookHeight);
    const durationRef = React.useRef(transitionDuration);
    const reducedMotionRef = React.useRef(reducedMotion);
    const activeIndexRef = React.useRef(activeIndex);
    const onActiveChangeRef = React.useRef(onActiveBookChange);

    booksRef.current = books;
    gapRef.current = gap;
    bookHeightRef.current = bookHeight;
    durationRef.current = transitionDuration;
    reducedMotionRef.current = reducedMotion;
    activeIndexRef.current = activeIndex;
    onActiveChangeRef.current = onActiveBookChange;

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      const sync = () => setReducedMotion(query.matches);
      sync();
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }, []);

    React.useEffect(() => {
      if (books.length === 0) return;
      setActiveIndex((current) =>
        clamp(current, 0, Math.max(0, books.length - 1)),
      );
    }, [books.length]);

    const applyLayout = React.useCallback((animate: boolean) => {
      const shelf = shelfRef.current;
      const stage = stageRef.current;
      const currentBooks = booksRef.current;
      if (!shelf || !stage || currentBooks.length === 0) return;

      const index = clamp(
        activeIndexRef.current,
        0,
        Math.max(0, currentBooks.length - 1),
      );
      const layout = computeLayout(currentBooks, gapRef.current, index);
      const stageWidth = stage.clientWidth;
      const shelfX = stageWidth / 2 - layout.activeCenter;
      const duration =
        animate && !reducedMotionRef.current
          ? Math.max(0, durationRef.current)
          : 0;
      const ease = "power2.inOut";

      timelineRef.current?.kill();
      timelineRef.current = null;

      const timeline =
        duration > 0
          ? gsap.timeline({
              onComplete: () => {
                timelineRef.current = null;
              },
            })
          : null;

      const push = (
        target: Element,
        vars: gsap.TweenVars,
        position: number,
      ) => {
        if (timeline) {
          timeline.to(target, { ...vars, duration, ease }, position);
        } else {
          gsap.set(target, vars);
        }
      };

      push(shelf, { x: shelfX }, 0);

      currentBooks.forEach((book, i) => {
        const slot = slotRefs.current[i];
        const bookNode = bookRefs.current[i];
        const cover = coverRefs.current[i];
        const distance = Math.abs(i - index);
        const depth = -Math.min(distance, 4) * 14;
        const scale = 1 - Math.min(distance, 4) * 0.008;
        const brightness = Math.max(0.5, 1 - distance * 0.12);

        if (slot) {
          push(
            slot,
            {
              left: layout.lefts[i] ?? 0,
              width: layout.widths[i] ?? spineWidthOf(book),
            },
            0,
          );
        }

        if (bookNode) {
          push(
            bookNode,
            {
              z: depth,
              scale,
              filter: `brightness(${brightness})`,
            },
            0,
          );
        }

        if (cover) {
          push(cover, { rotateY: i === index ? -6 : 90 }, 0);
        }
      });

      timelineRef.current = timeline;
    }, []);

    const booksKey = books
      .map(
        (book) =>
          `${book.id}:${book.width ?? ""}:${book.thickness ?? ""}:${book.cover ?? ""}`,
      )
      .join("|");

    useIsomorphicLayoutEffect(() => {
      applyLayout(mountedRef.current);
      mountedRef.current = true;
    }, [
      activeIndex,
      booksKey,
      gap,
      bookHeight,
      transitionDuration,
      reducedMotion,
      applyLayout,
    ]);

    React.useEffect(() => {
      const stage = stageRef.current;
      if (!stage || typeof ResizeObserver === "undefined") return;
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => applyLayout(false));
      });
      observer.observe(stage);
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
    }, [applyLayout]);

    React.useEffect(() => {
      return () => {
        timelineRef.current?.kill();
        timelineRef.current = null;
      };
    }, []);

    const select = React.useCallback((nextIndex: number) => {
      const currentBooks = booksRef.current;
      if (currentBooks.length === 0) return;
      const wrapped =
        ((nextIndex % currentBooks.length) + currentBooks.length) %
        currentBooks.length;
      if (wrapped === activeIndexRef.current) return;
      activeIndexRef.current = wrapped;
      setActiveIndex(wrapped);
      onActiveChangeRef.current?.(wrapped);
    }, []);

    const next = React.useCallback(() => {
      select(activeIndexRef.current + 1);
    }, [select]);

    const prev = React.useCallback(() => {
      select(activeIndexRef.current - 1);
    }, [select]);

    React.useImperativeHandle(
      ref,
      () => ({
        next,
        prev,
        play: () => setManuallyPaused(false),
        pause: () => setManuallyPaused(true),
      }),
      [next, prev],
    );

    React.useEffect(() => {
      if (
        !autoplay ||
        reducedMotion ||
        hovered ||
        manuallyPaused ||
        books.length < 2
      ) {
        return;
      }
      const timer = window.setInterval(
        () => {
          select(activeIndexRef.current + 1);
        },
        Math.max(1.2, autoplayInterval) * 1000,
      );
      return () => window.clearInterval(timer);
    }, [
      autoplay,
      autoplayInterval,
      reducedMotion,
      hovered,
      manuallyPaused,
      books.length,
      activeIndex,
      select,
    ]);

    const focusBook = React.useCallback((index: number) => {
      const currentBooks = booksRef.current;
      if (currentBooks.length === 0) return;
      const target =
        ((index % currentBooks.length) + currentBooks.length) %
        currentBooks.length;
      buttonRefs.current[target]?.focus();
    }, []);

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
      index: number,
    ) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        focusBook(index - 1);
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        focusBook(index + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        focusBook(0);
      } else if (event.key === "End") {
        event.preventDefault();
        focusBook(books.length - 1);
      }
    };

    const layout = computeLayout(books, gap, activeIndex);
    const shelfWidth = Math.max(layout.maxTotal, 1);
    const stageHeight = bookHeight + 48;
    const activeBook = books[activeIndex];

    return (
      <div
        ref={rootRef}
        data-slot="bookshelf"
        data-active={String(activeIndex)}
        role={decorative ? undefined : "group"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        className={cn(
          "relative flex w-full flex-col items-center overflow-hidden text-white",
          className,
        )}
        style={style}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        {...props}
      >
        {showHeader && (
          <div className="flex w-full items-center justify-center gap-4 pb-2 pt-1">
            <span
              aria-hidden="true"
              className="h-px w-12 bg-white/20 sm:w-16"
            />
            <h2 className="whitespace-nowrap font-serif text-xs uppercase tracking-[0.36em] text-white/85 sm:text-sm">
              {title}
            </h2>
            <span
              aria-hidden="true"
              className="h-px w-12 bg-white/20 sm:w-16"
            />
          </div>
        )}

        <div
          className="relative w-full"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, #000 5%, #000 95%, transparent 100%)",
          }}
        >
          <div
            ref={stageRef}
            className="relative w-full"
            style={{
              height: `${stageHeight}px`,
              perspective: `${perspective}px`,
            }}
          >
            <div
              ref={shelfRef}
              className="absolute left-0 bottom-6"
              style={{
                width: `${shelfWidth}px`,
                height: `${bookHeight}px`,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {books.map((book, index) => {
                const isActive = index === activeIndex;
                const coverWidth = coverWidthOf(book);
                const thickness = spineWidthOf(book);
                const baseColor = book.color ?? "#1b1b1b";
                const textColor =
                  book.textColor ?? readableTextColor(baseColor);

                const coverDepth = clamp(thickness * 0.22, 2, 5);
                const pageReveal = clamp(thickness * 0.6, 4, 14);
                const pageGap = 0.5;
                const pageDepth = Math.max(2, thickness - coverDepth * 2);
                const pageBlockWidth = coverWidth + pageReveal;
                const pageBlockHeight = bookHeight + pageReveal;

                const pageFrontStyle: React.CSSProperties = {
                  background: [
                    `repeating-linear-gradient(to right, rgba(120, 110, 90, 0.2) 0px, rgba(120, 110, 90, 0.2) 1px, transparent 1px, transparent 4px) right top / ${pageReveal}px 100% no-repeat`,
                    `repeating-linear-gradient(to bottom, rgba(120, 110, 90, 0.2) 0px, rgba(120, 110, 90, 0.2) 1px, transparent 1px, transparent 4px) left top / 100% ${pageReveal}px no-repeat`,
                    "linear-gradient(180deg, #f7f2e7 0%, #efe8d8 55%, #e4dbc9 100%)",
                  ].join(", "),
                  boxShadow: "inset 0 0 18px rgba(74, 59, 36, 0.14)",
                };
                const pageForeEdgeStyle: React.CSSProperties = {
                  background:
                    "repeating-linear-gradient(to right, #f4efe4 0px, #f4efe4 2px, #d9d0be 2px, #d9d0be 3px)",
                };
                const pageTopEdgeStyle: React.CSSProperties = {
                  background:
                    "repeating-linear-gradient(to right, #f4efe4 0px, #f4efe4 2px, #d9d0be 2px, #d9d0be 3px)",
                };
                const coverEdgeStyle: React.CSSProperties = {
                  background: `linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.28)), ${baseColor}`,
                };
                const coverSideEdgeStyle: React.CSSProperties = {
                  background: `linear-gradient(90deg, rgba(255,255,255,0.1), rgba(0,0,0,0.32)), ${baseColor}`,
                };
                const coverInsideStyle: React.CSSProperties = {
                  background:
                    "linear-gradient(145deg, #f3ede1 0%, #e4dac8 100%)",
                };
                const spineShadow = isActive
                  ? "12px 0 24px rgba(0,0,0,0.35)"
                  : "8px 0 18px rgba(0,0,0,0.28)";

                const faces = (
                  <div
                    ref={(node) => {
                      bookRefs.current[index] = node;
                    }}
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Box3D
                      width={thickness}
                      height={bookHeight}
                      depth={thickness}
                      x={thickness / 2}
                      y={bookHeight / 2}
                      z={-thickness / 2}
                      front={{
                        style: {
                          background: `linear-gradient(90deg, rgba(0,0,0,0.55), rgba(255,255,255,0.08) 48%, rgba(0,0,0,0.45)), ${baseColor}`,
                          color: textColor,
                          boxShadow: spineShadow,
                        },
                        children: (
                          <>
                            <span
                              className="absolute inset-0 flex items-center justify-center overflow-hidden px-[2px]"
                              style={{
                                writingMode: "vertical-rl",
                                textOrientation: "mixed",
                                fontSize: `${clamp(thickness * 0.28, 7, 12)}px`,
                                letterSpacing: "0.06em",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              {book.title}
                            </span>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/25 to-transparent"
                            />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/30 to-transparent"
                            />
                          </>
                        ),
                      }}
                      left={{
                        style: {
                          background: `linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.08)), ${baseColor}`,
                        },
                      }}
                      right={{
                        style: {
                          background:
                            "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(0,0,0,0.4))",
                        },
                      }}
                      top={{ style: coverEdgeStyle }}
                      bottom={{ style: coverEdgeStyle }}
                      back={{ style: { background: "#0e0d0c" } }}
                    />

                    <div
                      ref={(node) => {
                        coverRefs.current[index] = node;
                      }}
                      className="absolute top-0"
                      style={{
                        left: `${thickness}px`,
                        width: `${coverWidth}px`,
                        height: `${bookHeight}px`,
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                        willChange: "transform",
                      }}
                    >
                      <Box3D
                        width={pageBlockWidth}
                        height={pageBlockHeight}
                        depth={pageDepth}
                        x={pageBlockWidth / 2}
                        y={pageBlockHeight / 2 - pageReveal}
                        z={-thickness / 2 - pageGap}
                        style={{
                          visibility: isActive ? "visible" : "hidden",
                        }}
                        front={{ style: pageFrontStyle }}
                        back={{ style: { background: "#e8e0d0" } }}
                        right={{ style: pageForeEdgeStyle }}
                        top={{ style: pageTopEdgeStyle }}
                        bottom={{ style: pageTopEdgeStyle }}
                      />

                      <Box3D
                        width={coverWidth}
                        height={bookHeight}
                        depth={coverDepth}
                        x={coverWidth / 2}
                        y={bookHeight / 2}
                        z={-thickness + coverDepth / 2}
                        style={{
                          visibility: isActive ? "visible" : "hidden",
                        }}
                        front={{ style: coverInsideStyle }}
                        back={{
                          style: {
                            background: `linear-gradient(145deg, rgba(0,0,0,0.25), transparent), ${baseColor}`,
                          },
                        }}
                        right={{ style: coverSideEdgeStyle }}
                        top={{ style: coverEdgeStyle }}
                        bottom={{ style: coverEdgeStyle }}
                      />

                      <Box3D
                        width={coverWidth}
                        height={bookHeight}
                        depth={coverDepth}
                        x={coverWidth / 2}
                        y={bookHeight / 2}
                        z={-coverDepth / 2}
                        front={{
                          children: (
                            <BookCoverFace
                              book={book}
                              width={coverWidth}
                              height={bookHeight}
                            />
                          ),
                        }}
                        back={{ style: coverInsideStyle }}
                        right={{ style: coverSideEdgeStyle }}
                        top={{ style: coverEdgeStyle }}
                        bottom={{ style: coverEdgeStyle }}
                      />
                    </div>

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-0 top-0 z-20 h-full rounded-[2px] border border-white/75 opacity-0 transition-opacity duration-150 group-focus-visible:opacity-100"
                      style={{
                        width: `${isActive ? coverWidth + thickness : thickness}px`,
                        transform: "translateZ(1px)",
                      }}
                    />

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-3 left-1/2 h-3 -translate-x-1/2 rounded-[50%] bg-black/70 blur-md"
                      style={{
                        width: `${isActive ? (coverWidth + thickness) * 0.72 : thickness * 1.6}px`,
                        opacity: isActive ? 0.55 : 0.3,
                      }}
                    />
                  </div>
                );
                return (
                  <div
                    key={book.id}
                    ref={(node) => {
                      slotRefs.current[index] = node;
                    }}
                    className="absolute top-0 h-full"
                    style={{ width: thickness, left: 0 }}
                  >
                    {decorative ? (
                      <div
                        data-index={index}
                        data-active={isActive ? "true" : "false"}
                        className="group absolute inset-0 rounded-sm"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {faces}
                      </div>
                    ) : (
                      <button
                        ref={(node) => {
                          buttonRefs.current[index] = node;
                        }}
                        type="button"
                        aria-label={book.title}
                        aria-pressed={isActive}
                        data-index={index}
                        data-active={isActive ? "true" : "false"}
                        onClick={() => select(index)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        className="group absolute inset-0 cursor-pointer rounded-sm outline-none"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {faces}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showControls && !decorative && books.length > 1 && (
          <div className="flex items-center gap-5 pb-1 pt-3">
            <button
              type="button"
              aria-label="Previous book"
              onClick={prev}
              className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <p
              className="min-w-[9rem] text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/45"
              aria-live="polite"
            >
              <span className="text-white/80">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              {" / "}
              {String(books.length).padStart(2, "0")}
              <span className="sr-only"> — {activeBook?.title}</span>
            </p>
            <button
              type="button"
              aria-label="Next book"
              onClick={next}
              className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition-colors hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  },
);

export default Bookshelf;
