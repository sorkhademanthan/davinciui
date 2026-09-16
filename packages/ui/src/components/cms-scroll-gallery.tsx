"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ---------------------------------- types --------------------------------- */

export type GalleryMediaType = "image" | "video" | "auto";

export interface CMSScrollGalleryItem {
  title: string;
  /** Image or video URL. Videos detected by extension unless mediaType is set. */
  media: string;
  mediaType?: GalleryMediaType;
  alt?: string;
}

export type GalleryTransitionStyle =
  | "zoom-fade"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "blur-fade"
  | "scale-reveal";

export type DockPosition =
  | "center"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "custom";

export type DockOrientation = "vertical" | "horizontal";

export interface CMSScrollGalleryProps {
  items?: CMSScrollGalleryItem[];
  className?: string;

  /* Scroll */
  scrollLengthPerItem?: number; // in vh units, default 100
  transitionSmoothing?: number; // 0..1, higher = smoother
  initialItem?: number;

  /* Background */
  fit?: "cover" | "contain";
  positionX?: number; // 0..100 percent
  positionY?: number;
  fallbackColor?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  /* Typography */
  fontFamily?: string;
  fontSize?: number; // desktop px, default 144
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: string;
  titleColor?: string;
  titleAlign?: "center" | "left" | "right";
  responsiveScale?: boolean;
  maxTitleWidth?: string;
  mobileTitleScale?: number; // 0..1

  /* Thumbnails */
  showThumbnails?: boolean;
  orientation?: DockOrientation;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  thumbnailRadius?: number;
  gap?: number;
  dockPadding?: number;
  thumbnailFit?: "cover" | "contain";
  thumbnailOpacity?: number;

  /* Active thumbnail */
  activeBorderColor?: string;
  activeBorderWidth?: number;
  activeBorderOffset?: number;
  activeBorderRadius?: number;

  /* Dock */
  dockPosition?: DockPosition;
  dockXOffset?: number;
  dockYOffset?: number;
  draggable?: boolean;
  showDragHandle?: boolean;
  glassBackground?: string;
  glassOpacity?: number;
  glassBlur?: number;
  glassRadius?: number;

  /* Motion */
  transitionStyle?: GalleryTransitionStyle;
  mediaScale?: number; // default 1.2
  textScale?: number; // default 1.2
  motionStrength?: number; // px for slides, default 120
  blurAmount?: number; // px, default 12

  /* Mobile */
  mobileThumbnailSize?: number;
  mobileGap?: number;
  mobileDockPosition?: DockPosition;
  disableDragOnMobile?: boolean;
  reducedMotion?: boolean;
}

const UNSPLASH_PARAMS = "?q=80&w=1920&auto=format&fit=crop";

const DEFAULT_ITEMS: CMSScrollGalleryItem[] = [
  {
    title: "Aurora",
    media: `https://images.unsplash.com/photo-1531366936337-7c912a4589a7${UNSPLASH_PARAMS}`,
    alt: "Aurora — violet and green northern lights over snowy peaks",
  },
  {
    title: "Kyoto",
    media: `https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e${UNSPLASH_PARAMS}`,
    alt: "Kyoto — Yasaka pagoda rising over a lantern-lit lane at dusk",
  },
  {
    title: "Tide",
    media: "https://assets.mixkit.co/videos/44370/44370-720.mp4",
    mediaType: "video",
    alt: "Tide — gliding over the sea into a burning sunset",
  },
  {
    title: "Dunes",
    media: `https://images.unsplash.com/photo-1473580044384-7ba9967e16a0${UNSPLASH_PARAMS}`,
    alt: "Dunes — footprints trailing across golden sand ripples",
  },
  {
    title: "Neon",
    media: "https://assets.mixkit.co/videos/4332/4332-720.mp4",
    mediaType: "video",
    alt: "Neon — Times Square glowing through rain at night",
  },
  {
    title: "Santorini",
    media: `https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff${UNSPLASH_PARAMS}`,
    alt: "Santorini — whitewashed Oia glowing at blue hour",
  },
  {
    title: "Mist",
    media: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23${UNSPLASH_PARAMS}`,
    alt: "Mist — a fairytale castle floating in morning fog",
  },
  {
    title: "Muse",
    media: `https://images.unsplash.com/photo-1529139574466-a303027c1d8b${UNSPLASH_PARAMS}`,
    alt: "Muse — bold editorial portrait against a teal sky",
  },
];

function isVideoItem(item: CMSScrollGalleryItem): boolean {
  if (item.mediaType === "video") return true;
  if (item.mediaType === "image") return false;
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(item.media);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Smoothstep easing — turns the linear scroll-distance crossfade buttery. */
function easeInOut(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Fraction of each scroll segment devoted to the crossfade (rest is a full
 * hold). The blend spans most of the segment so consecutive media melt into
 * each other instead of cutting, and it still completes exactly at the
 * segment boundary — so the discrete active index (floor) always matches
 * what's on screen, and segment starts (including scroll-top) render fully
 * opaque, never ghosted.
 */
const SEGMENT_FADE = 0.75;

function segmentVisibility(p: number, index: number, count: number) {
  if (count <= 1) return 1;
  const u = p * count - index; // 0..1 while this item owns the segment
  if (u < -SEGMENT_FADE) return 0;
  if (u < 0) return easeInOut((u + SEGMENT_FADE) / SEGMENT_FADE);
  // Last item holds from its segment start through the track end (p = 1
  // yields u = 1) — fading it out would leave a blank viewport after the
  // final scroll.
  if (index === count - 1) return 1;
  if (u >= 1) return 0;
  if (u < 1 - SEGMENT_FADE) return 1;
  return 1 - easeInOut((u - (1 - SEGMENT_FADE)) / SEGMENT_FADE);
}

function useIsMobile(breakpoint = 809) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}

/**
 * Compact detection based on the gallery viewport itself (not the window).
 * The docs preview renders inside a narrow iframe where the window is wide
 * but the stage is small — window matchMedia alone misfires there and flips
 * the dock unexpectedly. ResizeObserver keeps orientation stable.
 */
function useCompactViewport(
  ref: React.RefObject<HTMLDivElement | null>,
  breakpoint = 700,
) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setCompact(el.clientWidth <= breakpoint);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, breakpoint]);
  return compact;
}

/* ------------------------------ media layer ------------------------------ */

function MediaLayer({
  item,
  index,
  count,
  progress,
  fit,
  objectPosition,
  transitionStyle,
  mediaScale,
  motionStrength,
  blurAmount,
  forceReduced,
  active,
  priority,
}: {
  item: CMSScrollGalleryItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  fit: "cover" | "contain";
  objectPosition: string;
  transitionStyle: GalleryTransitionStyle;
  mediaScale: number;
  motionStrength: number;
  blurAmount: number;
  forceReduced: boolean;
  active: boolean;
  priority: boolean;
}) {
  const vis = useTransform(
    progress,
    (v: number) => segmentVisibility(v, index, count),
  );

  const signed = useTransform(progress, (v: number) => {
    const c = (index + 0.5) / count;
    return clamp((v - c) * count, -1, 1);
  });

  const style = transitionStyle;
  const reduced = forceReduced;

  const opacity = vis;

  const scale = useTransform(vis, (o: number) => {
    if (reduced || style === "fade" || style === "blur-fade") return 1;
    if (style === "scale-reveal") {
      const s = 0.85 + 0.15 * o;
      return s;
    }
    // zoom-fade default + slides keep subtle zoom
    if (style === "zoom-fade") return 1 + (1 - o) * (mediaScale - 1);
    return 1 + (1 - o) * Math.min(0.12, mediaScale - 1);
  });

  const x = useTransform(signed, (s: number) => {
    if (reduced) return 0;
    if (style === "slide-left") return s * motionStrength;
    if (style === "slide-right") return s * -motionStrength;
    return 0;
  });
  const y = useTransform(signed, (s: number) => {
    if (reduced) return 0;
    if (style === "slide-up") return s * motionStrength;
    if (style === "slide-down") return s * -motionStrength;
    return 0;
  });

  const blur = useTransform(vis, (o: number) => {
    if (reduced) return "blur(0px)";
    if (style === "blur-fade") return `blur(${(1 - o) * blurAmount}px)`;
    return "blur(0px)";
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active || priority) {
      el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [active, priority]);

  const video = isVideoItem(item);

  return (
    <motion.div
      aria-hidden={!active}
      className="absolute inset-0 will-change-transform"
      style={{ opacity, scale, x, y, filter: blur, zIndex: active ? 1 : 0 }}
    >
      {video ? (
        <video
          ref={videoRef}
          src={item.media}
          className="h-full w-full"
          style={{ objectFit: fit, objectPosition }}
          autoPlay
          loop
          muted
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-label={item.alt ?? item.title}
        />
      ) : (
        <img
          src={item.media}
          alt={item.alt ?? item.title}
          draggable={false}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full select-none"
          style={{ objectFit: fit, objectPosition }}
        />
      )}
    </motion.div>
  );
}

/* ------------------------------ title layer ------------------------------ */

function TitleLayer({
  item,
  index,
  count,
  progress,
  transitionStyle,
  textScale,
  motionStrength,
  blurAmount,
  forceReduced,
  active,
  titleStyle,
}: {
  item: CMSScrollGalleryItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  transitionStyle: GalleryTransitionStyle;
  textScale: number;
  motionStrength: number;
  blurAmount: number;
  forceReduced: boolean;
  active: boolean;
  titleStyle: React.CSSProperties;
}) {
  const vis = useTransform(
    progress,
    (v: number) => segmentVisibility(v, index, count),
  );
  const signed = useTransform(progress, (v: number) => {
    const c = (index + 0.5) / count;
    return clamp((v - c) * count, -1, 1);
  });
  const style = transitionStyle;
  const reduced = forceReduced;

  const scale = useTransform(vis, (o: number) => {
    if (reduced || style === "fade" || style === "blur-fade") return 1;
    if (style === "scale-reveal") return 0.9 + 0.1 * o;
    return 1 + (1 - o) * (textScale - 1);
  });
  const x = useTransform(signed, (s: number) => {
    if (reduced) return 0;
    if (style === "slide-left") return s * motionStrength * 0.6;
    if (style === "slide-right") return s * -motionStrength * 0.6;
    return 0;
  });
  const y = useTransform(signed, (s: number) => {
    if (reduced) return 0;
    if (style === "slide-up") return s * motionStrength * 0.6;
    if (style === "slide-down") return s * -motionStrength * 0.6;
    // Titles stay locked on center for every other preset — any vertical
    // drift reads as "off-center". Zoom comes from scale only.
    return 0;
  });
  const blur = useTransform(vis, (o: number) => {
    if (reduced) return "blur(0px)";
    if (style === "blur-fade") return `blur(${(1 - o) * blurAmount * 0.6}px)`;
    return "blur(0px)";
  });

  return (
    // Outer wrapper shares the dock's anchor math (top/left 50% +
    // translate(-50%, -50%)) so the title center and the vertical rail
    // center are the same point by construction — never approximated.
    <div
      aria-hidden={!active}
      className="pointer-events-none absolute"
      style={{
        top: "50%",
        left: "50%",
        width: "100%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.h2
        aria-hidden={!active}
        className="flex items-center justify-center text-center will-change-transform"
        style={{
          opacity: vis,
          scale,
          x,
          y,
          filter: blur,
          ...titleStyle,
          margin: "0 auto",
          padding: 0,
          width: "100%",
          maxWidth: "none",
          // Subtle lift so large type stays clean over imagery + glass dock.
          textShadow:
            "0 1px 12px rgba(0,0,0,0.45), 0 4px 40px rgba(0,0,0,0.35)",
        }}
      >
        <span
          style={{
            display: "block",
            width: "100%",
            // No max-width cap here: capping the box below 100% while auto
            // margins absorb the leftover shifts the text off-center. The
            // full-width box keeps the glyphs dead-center; long titles
            // overflow symmetrically instead of drifting sideways.
            margin: "0 auto",
            textAlign: titleStyle.textAlign,
          }}
        >
          {item.title}
        </span>
      </motion.h2>
    </div>
  );
}

/* -------------------------------- component ------------------------------ */

export function CMSScrollGallery({
  items = DEFAULT_ITEMS,
  className,
  scrollLengthPerItem = 100,
  transitionSmoothing = 0.55,
  initialItem = 0,
  fit = "cover",
  positionX = 50,
  positionY = 50,
  fallbackColor = "#dddddd",
  overlayColor = "#000000",
  overlayOpacity = 0,
  fontFamily = "Aspekta Variable, Inter, system-ui, sans-serif",
  fontSize = 168,
  fontWeight = 800,
  lineHeight = 1,
  letterSpacing = "-0.04em",
  titleColor = "#FFFFFF",
  titleAlign = "center",
  responsiveScale = true,
  maxTitleWidth = "90vw",
  mobileTitleScale = 0.45,
  showThumbnails = true,
  orientation = "vertical",
  thumbnailWidth = 56,
  thumbnailHeight = 56,
  thumbnailRadius = 10,
  gap = 10,
  dockPadding = 12,
  thumbnailFit = "cover",
  thumbnailOpacity = 1,
  activeBorderColor = "#ffffff",
  activeBorderWidth = 2,
  activeBorderOffset = 5,
  activeBorderRadius = 14,
  dockPosition = "center",
  dockXOffset = 0,
  dockYOffset = 0,
  draggable = true,
  showDragHandle = true,
  glassBackground = "rgba(255,255,255,0.2)",
  glassOpacity = 1,
  glassBlur = 30,
  glassRadius = 18,
  transitionStyle = "zoom-fade",
  mediaScale = 1.2,
  textScale = 1.2,
  motionStrength = 120,
  blurAmount = 12,
  mobileThumbnailSize = 44,
  mobileGap = 8,
  mobileDockPosition,
  disableDragOnMobile = true,
  reducedMotion: reducedMotionProp = false,
}: CMSScrollGalleryProps) {
  const count = Math.max(1, items.length);
  const trackRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const systemReduced = useReducedMotion() ?? false;
  const forceReduced = reducedMotionProp || systemReduced;
  const isMobile = useIsMobile(809);
  const isCompactStage = useCompactViewport(viewportRef, 700);
  // Compact = genuinely small stage (phone) or narrow embed. Never flips
  // orientation by itself — it only shrinks sizes.
  const isCompact = isMobile || isCompactStage;

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Buttery smoothing: soft spring over native scroll. Lower stiffness =
  // silkier; damping keeps it from overshooting into adjacent items.
  const smoothing = clamp(transitionSmoothing, 0, 0.99);
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 170 - smoothing * 130,
    damping: 26 + smoothing * 14,
    mass: 0.9,
    restDelta: 0.0004,
  });

  const [activeIndex, setActiveIndex] = useState(() =>
    clamp(initialItem, 0, count - 1),
  );

  useEffect(() => {
    setActiveIndex((prev) => clamp(prev, 0, count - 1));
  }, [count]);

  // Discrete index follows RAW scroll progress so the thumbnail outline and
  // live title stay snappy; the eased spring drives only the visuals.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const gp = clamp(v, 0, 0.999999) * count;
    const next = clamp(Math.floor(gp), 0, count - 1);
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  const scrollToIndex = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const target = clamp(i, 0, count - 1);
      const rect = track.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const trackHeight = track.offsetHeight;
      const viewportH = window.innerHeight;
      const scrollable = Math.max(1, trackHeight - viewportH);
      const targetProgress = (target + 0.5) / count;
      const targetY = trackTop + targetProgress * scrollable;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    },
    [count],
  );

  /* ------------------------- dock drag + position ------------------------ */
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  const dragEnabled = draggable && !(isCompact && disableDragOnMobile);

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!dragEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        baseX: dragOffset.x,
        baseY: dragOffset.y,
      };
      document.body.style.cursor = "grabbing";
    },
    [dragEnabled, dragOffset],
  );

  useEffect(() => {
    if (!dragEnabled) return;
    const move = (e: PointerEvent) => {
      const s = dragState.current;
      if (!s?.dragging) return;
      const viewport = viewportRef.current;
      const maxX = viewport ? viewport.clientWidth / 2 - 60 : 600;
      const maxY = viewport ? viewport.clientHeight / 2 - 80 : 400;
      setDragOffset({
        x: clamp(s.baseX + (e.clientX - s.startX), -maxX, maxX),
        y: clamp(s.baseY + (e.clientY - s.startY), -maxY, maxY),
      });
    };
    const up = () => {
      if (dragState.current) dragState.current.dragging = false;
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragEnabled]);

  // Orientation is always exactly what the caller sets — a narrow embed
  // (docs side preview) must NOT flip vertical into horizontal on its own.
  const effectiveOrientation: DockOrientation = orientation;
  // Mobile position override only applies when explicitly provided, so the
  // side preview keeps the configured dock position.
  const effectivePosition: DockPosition =
    isCompact && mobileDockPosition ? mobileDockPosition : dockPosition;

  const tSize = isCompact ? mobileThumbnailSize : thumbnailWidth;
  const tHeight = isCompact ? mobileThumbnailSize : thumbnailHeight;
  const tGap = isCompact ? mobileGap : gap;

  const dockPlacementStyle: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      position: "absolute",
      zIndex: 10,
      transform: `translate(calc(-50% + ${dragOffset.x + dockXOffset}px), calc(-50% + ${dragOffset.y + dockYOffset}px))`,
      top: "50%",
      left: "50%",
    };
    const set = (top?: string, left?: string) => {
      if (top) base.top = top;
      if (left) base.left = left;
    };
    switch (effectivePosition) {
      case "left":
        set("50%", "72px");
        base.transform = `translate(calc(-50% + ${dragOffset.x + dockXOffset}px), calc(-50% + ${dragOffset.y + dockYOffset}px))`;
        break;
      case "right":
        set("50%", "calc(100% - 72px)");
        break;
      case "top":
        set("72px", "50%");
        break;
      case "bottom":
        set("calc(100% - 72px)", "50%");
        break;
      case "top-left":
        set("72px", "72px");
        base.transform = `translate(${dragOffset.x + dockXOffset}px, ${dragOffset.y + dockYOffset}px)`;
        break;
      case "top-right":
        set("72px", "calc(100% - 72px)");
        base.transform = `translate(calc(-100% + ${dragOffset.x + dockXOffset}px), ${dragOffset.y + dockYOffset}px)`;
        break;
      case "bottom-left":
        set("calc(100% - 72px)", "72px");
        base.transform = `translate(${dragOffset.x + dockXOffset}px, calc(-100% + ${dragOffset.y + dockYOffset}px))`;
        break;
      case "bottom-right":
        set("calc(100% - 72px)", "calc(100% - 72px)");
        base.transform = `translate(calc(-100% + ${dragOffset.x + dockXOffset}px), calc(-100% + ${dragOffset.y + dockYOffset}px))`;
        break;
      case "custom":
        base.top = `calc(50% + ${dockYOffset}px)`;
        base.left = `calc(50% + ${dockXOffset}px)`;
        base.transform = `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px))`;
        break;
      case "center":
      default:
        break;
    }
    return base;
  }, [effectivePosition, dragOffset, dockXOffset, dockYOffset]);

  const objectPosition = `${positionX}% ${positionY}%`;
  const trackHeight = `${count * scrollLengthPerItem}vh`;

  const titleStyle: React.CSSProperties = useMemo(() => {
    const desktop = responsiveScale
      ? `clamp(${Math.round(fontSize * 0.35)}px, ${((fontSize / 1440) * 100).toFixed(2)}vw, ${fontSize}px)`
      : `${fontSize}px`;
    // Compact stages (phone / narrow embed): dedicated size. Never multiply
    // the already-clamped desktop value — that double-shrinks into tiny type.
    const size = isCompact
      ? `clamp(28px, 12vw, ${Math.round(fontSize * mobileTitleScale)}px)`
      : desktop;
    return {
      fontFamily,
      fontSize: size,
      fontWeight,
      lineHeight: `${lineHeight}em`,
      letterSpacing,
      color: titleColor,
      textAlign: titleAlign,
      maxWidth: maxTitleWidth,
      whiteSpace: "nowrap" as const,
      pointerEvents: "none" as const,
      userSelect: "none" as const,
    };
  }, [
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    titleColor,
    titleAlign,
    responsiveScale,
    maxTitleWidth,
    isCompact,
    mobileTitleScale,
  ]);

  return (
    <div
      ref={trackRef}
      data-testid="cms-scroll-gallery-track"
      className={cn("relative w-full", className)}
      style={{ height: trackHeight, background: fallbackColor }}
    >
      <div
        ref={viewportRef}
        data-testid="cms-scroll-gallery-viewport"
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{
          height: "100vh",
          background: fallbackColor,
          overflowX: "clip",
        }}
      >
        {/* Background media stack */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          {items.map((item, i) => (
            <MediaLayer
              key={`${item.media}-${i}`}
              item={item}
              index={i}
              count={count}
              progress={smoothProgress}
              fit={fit}
              objectPosition={objectPosition}
              transitionStyle={transitionStyle}
              mediaScale={mediaScale}
              motionStrength={motionStrength}
              blurAmount={blurAmount}
              forceReduced={forceReduced}
              active={i === activeIndex}
              priority={Math.abs(i - activeIndex) <= 1}
            />
          ))}
        </div>

        {/* Overlay */}
        {overlayOpacity > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: overlayColor,
              opacity: overlayOpacity,
              zIndex: 1,
            }}
          />
        )}

        {/* Centered title stack */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 2, userSelect: "none" }}
        >
          {items.map((item, i) => (
            <TitleLayer
              key={`title-${i}`}
              item={item}
              index={i}
              count={count}
              progress={smoothProgress}
              transitionStyle={transitionStyle}
              textScale={textScale}
              motionStrength={motionStrength}
              blurAmount={blurAmount}
              forceReduced={forceReduced}
              active={i === activeIndex}
              titleStyle={titleStyle}
            />
          ))}
          {/* Screen-reader live title */}
          <span className="sr-only" aria-live="polite">
            {items[activeIndex]?.title}
          </span>
        </div>

        {/* Floating thumbnail rail */}
        {showThumbnails && (
          <div style={dockPlacementStyle}>
            <div className="relative flex flex-col items-center">
              {showDragHandle && dragEnabled && (
                <div
                  role="presentation"
                  aria-hidden
                  onPointerDown={onHandlePointerDown}
                  className="absolute flex items-center justify-center"
                  style={{
                    // Floats 18px above the glass — out of flow so the rail
                    // itself stays exactly on the placement center.
                    bottom: "100%",
                    marginBottom: 18,
                    width: 36,
                    height: 12,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    cursor: dragState.current?.dragging
                      ? "grabbing"
                      : "grab",
                    touchAction: "none",
                  }}
                  data-testid="cms-scroll-gallery-drag-handle"
                >
                  <div
                    style={{
                      width: 26,
                      height: 4,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.5)",
                    }}
                  />
                </div>
              )}
              <div
                role="tablist"
                aria-label="Gallery items"
                className="flex"
                style={{
                  flexDirection:
                    effectiveOrientation === "vertical" ? "column" : "row",
                  gap: tGap,
                  padding: isCompact
                    ? Math.max(8, dockPadding - 4)
                    : dockPadding,
                  borderRadius: glassRadius,
                  background: glassBackground,
                  opacity: glassOpacity,
                  backdropFilter: `blur(${glassBlur}px)`,
                  WebkitBackdropFilter: `blur(${glassBlur}px)`,
                }}
                data-testid="cms-scroll-gallery-dock"
              >
                {items.map((item, i) => {
                  const isActive = i === activeIndex;
                  const video = isVideoItem(item);
                  return (
                    <button
                      key={`thumb-${i}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Go to ${item.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToIndex(i);
                      }}
                      className="relative shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                      style={{
                        width: tSize,
                        height: tHeight,
                        borderRadius: thumbnailRadius,
                        opacity: thumbnailOpacity,
                      }}
                      data-testid={`cms-scroll-gallery-thumb-${i}`}
                    >
                      {video ? (
                        <video
                          src={item.media}
                          muted
                          playsInline
                          preload="metadata"
                          tabIndex={-1}
                          aria-hidden
                          className="h-full w-full"
                          style={{
                            objectFit: thumbnailFit,
                            objectPosition: "center",
                            borderRadius: thumbnailRadius,
                            pointerEvents: "none",
                          }}
                        />
                      ) : (
                        <img
                          src={item.media}
                          alt=""
                          aria-hidden
                          draggable={false}
                          loading="lazy"
                          className="h-full w-full"
                          style={{
                            objectFit: thumbnailFit,
                            objectPosition: "center",
                            borderRadius: thumbnailRadius,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {/* Active outline — larger frame surrounding thumb */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute"
                        style={{
                          inset: -activeBorderOffset,
                          border: `${activeBorderWidth}px solid ${activeBorderColor}`,
                          borderRadius: activeBorderRadius,
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? "scale(1)" : "scale(0.92)",
                          transition:
                            "opacity 0.3s ease, transform 0.3s ease",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CMSScrollGallery;

/* Framer property-controls bridge (used when loaded inside Framer). */
export const CMSScrollGalleryPropertyControls = {
  items: { type: "array", title: "Items / CMS Source" },
  scrollLengthPerItem: {
    type: "number",
    title: "Scroll Length Per Item",
    defaultValue: 100,
    min: 20,
    max: 300,
  },
  transitionStyle: {
    type: "enum",
    title: "Transition Style",
    options: [
      "zoom-fade",
      "fade",
      "slide-up",
      "slide-down",
      "slide-left",
      "slide-right",
      "blur-fade",
      "scale-reveal",
    ],
    defaultValue: "zoom-fade",
  },
  dockPosition: {
    type: "enum",
    title: "Dock Position",
    options: [
      "center",
      "left",
      "right",
      "top",
      "bottom",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
      "custom",
    ],
  },
  orientation: {
    type: "enum",
    title: "Orientation",
    options: ["vertical", "horizontal"],
  },
  draggable: { type: "boolean", title: "Draggable", defaultValue: true },
};
