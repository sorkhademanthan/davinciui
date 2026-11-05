"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface CurveWallItem {
  /** Image or video source rendered inside the tile. */
  src: string;
  /** Media kind. Defaults to "image". */
  type?: "image" | "video";
  /** Accessible description for the media. */
  alt: string;
  /** Optional destination for the tile. */
  href?: string;
  /** Open the destination in a new tab. Defaults to false. */
  newTab?: boolean;
}

export interface CurveWallProps {
  /** Media arranged across the wall. */
  items: CurveWallItem[];
  /** Columns used to size the grid. Defaults to 5. */
  columns?: number;
  /** Gap between cells in pixels. Defaults to 12. */
  gap?: number;
  /** Tile width divided by height. Defaults to 0.8. */
  ratio?: number;
  /** Scale applied to the tile and grid pitch. Defaults to 0.86. */
  tileScale?: number;
  /** Fit wall media inside each tile. Defaults to "cover". */
  fit?: "cover" | "contain";
  /** Tile corner radius in pixels. Defaults to 6. */
  radius?: number;
  /** Horizontal drift applied to media inside each tile, 0 to 1. */
  drift?: number;
  /** Curvature strength. Positive swells outward. Defaults to 0.16. */
  bow?: number;
  /** Cursor lens strength. Defaults to 0.22. */
  lens?: number;
  /** Cursor lens reach, relative to the smaller cell side. Defaults to 1.4. */
  reach?: number;
  /** Multiplier applied to drag movement. Defaults to 1. */
  dragSpeed?: number;
  /** Multiplier applied to wheel movement. Defaults to 1. */
  wheelSpeed?: number;
  /** Glide retained after a fling, 0 to 1. Defaults to 0.92. */
  settle?: number;
  /** Idle drift in pixels per second. Defaults to 0. */
  wander?: number;
  /** Idle drift angle in degrees. Defaults to 215. */
  heading?: number;
  /** Shuffle the media order across cells. Defaults to true. */
  scatter?: boolean;
  /** Shuffle seed. Defaults to 7. */
  seed?: number;
  /** Render the spotlight vignette. Defaults to true. */
  spotlight?: boolean;
  /** Vignette shade, 0 to 1. Defaults to 0.62. */
  shade?: number;
  /** Clear radius of the spotlight, relative to the smaller cell side. */
  hole?: number;
  /** Spotlight falloff, relative to the smaller cell side. */
  feather?: number;
  /** Vignette and backdrop tint. Defaults to #08080a. */
  tint?: string;
  /** Stage background. Defaults to var(--background, #000000). */
  background?: string;
  /** Additional classes for the stage. */
  className?: string;
  /** Additional styles for the stage. */
  style?: CSSProperties;
  /** Accessible name for the gallery region. */
  ariaLabel?: string;
  /** Enable pointer, wheel, and keyboard interaction. Defaults to true. */
  interactive?: boolean;
}

interface Layout {
  w: number;
  h: number;
  gap: number;
  cellW: number;
  cellH: number;
  tileW: number;
  tileH: number;
  cols: number;
  rows: number;
  spanX: number;
  spanY: number;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  bands: string;
}

interface Point {
  x: number;
  y: number;
}

interface DragState {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  held: boolean;
  pointer: number;
  grabX: number;
  grabY: number;
  seedX: number;
  seedY: number;
  lastX: number;
  lastY: number;
  lastAt: number;
  downAt: number;
  travel: number;
}

interface Quad {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
}

type ViewerPhase = "idle" | "opening" | "open" | "closing";

interface ViewerState {
  phase: ViewerPhase;
  slot: number;
  startedAt: number;
  from: Quad | null;
  fromWidth: number;
  fromHeight: number;
  current: Quad | null;
  currentWidth: number;
  currentHeight: number;
}

interface ViewerPress {
  active: boolean;
  slot: number;
  x: number;
  y: number;
  at: number;
}

const VIEWER_DURATION = 550;
const VIEWER_HEIGHT = 0.73;
const VIEWER_MAX_WIDTH = 0.8;
const HOVER_DIM = 0.25;
const VIEWER_DIM = 0.75;
const LIFT_DEPTH = 0.05;
const LIFT_RADIUS = 1.15;
const MAX_FRAME_DELTA = 1 / 20;
const EMPTY_ITEM: CurveWallItem = {
  src: "",
  alt: "Curve wall tile",
};

const MEDIA_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  transformOrigin: "50% 50%",
  transform: "scale(1.12)",
  userSelect: "none",
  pointerEvents: "none",
};

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

function mod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function wrap(value: number, start: number, span: number) {
  return start + mod(value - start, span);
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function mix(current: number, target: number, rate: number, delta: number) {
  return current + (target - current) * (1 - (1 - rate) ** (delta * 60));
}

function easeToward(current: number, target: number, tau: number, delta: number) {
  return target + (current - target) * Math.exp(-delta / tau);
}

function periodicDelta(value: number, span: number) {
  return mod(value + span / 2, span) - span / 2;
}

function lerp(start: number, target: number, amount: number) {
  return start + (target - start) * amount;
}

function lerpPoint(start: Point, target: Point, amount: number): Point {
  return {
    x: lerp(start.x, target.x, amount),
    y: lerp(start.y, target.y, amount),
  };
}

function lerpQuad(start: Quad, target: Quad, amount: number): Quad {
  return {
    tl: lerpPoint(start.tl, target.tl, amount),
    tr: lerpPoint(start.tr, target.tr, amount),
    bl: lerpPoint(start.bl, target.bl, amount),
    br: lerpPoint(start.br, target.br, amount),
  };
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (time: number) => ((ax * time + bx) * time + cx) * time;
  const sampleY = (time: number) => ((ay * time + by) * time + cy) * time;
  return (time: number) => {
    if (time <= 0) return 0;
    if (time >= 1) return 1;
    let low = 0;
    let high = 1;
    let guess = time;
    for (let index = 0; index < 8; index++) {
      const value = sampleX(guess);
      if (Math.abs(value - time) < 0.0001) break;
      if (value < time) low = guess;
      else high = guess;
      guess = (low + high) / 2;
    }
    return sampleY(guess);
  };
}

const viewerEase = cubicBezier(0.22, 1, 0.36, 1);

function viewerTarget(layout: Layout, aspect: number) {
  const maxWidth = layout.w * VIEWER_MAX_WIDTH;
  let height = layout.h * VIEWER_HEIGHT;
  let width = height * aspect;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspect;
  }
  const left = layout.midX - width / 2;
  const top = layout.midY - height / 2;
  const right = left + width;
  const bottom = top + height;
  return {
    width,
    height,
    quad: {
      tl: { x: left, y: top },
      tr: { x: right, y: top },
      bl: { x: left, y: bottom },
      br: { x: right, y: bottom },
    },
  };
}

function homography(
  width: number,
  height: number,
  tl: Point,
  tr: Point,
  bl: Point,
  br: Point,
) {
  const s1x = tr.x - br.x;
  const s1y = tr.y - br.y;
  const s2x = bl.x - br.x;
  const s2y = bl.y - br.y;
  const s3x = tl.x - tr.x - bl.x + br.x;
  const s3y = tl.y - tr.y - bl.y + br.y;
  const det = s1x * s2y - s2x * s1y;
  const p = det === 0 ? 0 : (s3x * s2y - s2x * s3y) / det;
  const q = det === 0 ? 0 : (s1x * s3y - s3x * s1y) / det;
  const a = (tr.x - tl.x + p * tr.x) / width;
  const b = (tr.y - tl.y + p * tr.y) / width;
  const c = p / width;
  const d = (bl.x - tl.x + q * bl.x) / height;
  const e = (bl.y - tl.y + q * bl.y) / height;
  const f = q / height;
  return `matrix3d(${a},${b},0,${c},${d},${e},0,${f},0,0,1,0,${tl.x},${tl.y},0,1)`;
}

function seededRandom(seed: number) {
  let state = (Math.floor(seed) * 2654435761) >>> 0 || 1;
  return () => {
    state = (state + 1831565813) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildScatter(
  columns: number,
  rows: number,
  count: number,
  scatter: boolean,
  seed: number,
) {
  const total = columns * rows;
  const order = Array<number>(total);
  if (count <= 1) {
    order.fill(0);
    return order;
  }
  if (!scatter) {
    for (let index = 0; index < total; index++) {
      order[index] =
        (index % columns + Math.floor(index / columns) * (columns + 1)) % count;
    }
    return order;
  }
  const random = seededRandom(seed);
  let pool: number[] = [];
  const refill = () => {
    pool = [];
    for (let index = 0; index < count; index++) pool.push(index);
    for (let index = pool.length - 1; index > 0; index--) {
      const swap = Math.floor(random() * (index + 1));
      const value = pool[index]!;
      pool[index] = pool[swap]!;
      pool[swap] = value;
    }
  };
  for (let index = 0; index < total; index++) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const near: number[] = [];
    const diagonal: number[] = [];
    if (column > 0) near.push(order[index - 1]!);
    if (row > 0) near.push(order[index - columns]!);
    if (column === columns - 1) near.push(order[row * columns]!);
    if (row === rows - 1) near.push(order[column]!);
    if (row > 0 && column > 0) diagonal.push(order[index - columns - 1]!);
    if (row > 0 && column < columns - 1) {
      diagonal.push(order[index - columns + 1]!);
    }
    const allowed = (value: number, strict: boolean) =>
      near.indexOf(value) === -1 && (!strict || diagonal.indexOf(value) === -1);
    if (pool.length === 0) refill();
    let found = -1;
    for (let pass = 0; pass < 2 && found === -1; pass++) {
      for (let poolIndex = 0; poolIndex < pool.length; poolIndex++) {
        if (allowed(pool[poolIndex]!, pass === 0)) {
          found = poolIndex;
          break;
        }
      }
    }
    if (found === -1) {
      let value = Math.floor(random() * count);
      for (let offset = 0; offset < count; offset++) {
        const candidate = (value + offset) % count;
        if (allowed(candidate, false)) {
          value = candidate;
          break;
        }
      }
      order[index] = value;
    } else {
      order[index] = pool[found]!;
      pool.splice(found, 1);
    }
  }
  return order;
}

function isVideo(
  media: HTMLImageElement | HTMLVideoElement | null,
): media is HTMLVideoElement {
  return media instanceof HTMLVideoElement;
}

export function CurveWall({
  items,
  columns = 5,
  gap = 12,
  ratio = 0.8,
  tileScale = 0.86,
  fit = "cover",
  radius = 6,
  drift = 0.4,
  bow = 0.16,
  lens = 0.22,
  reach = 1.4,
  dragSpeed = 1,
  wheelSpeed = 1,
  settle = 0.92,
  wander = 0,
  heading = 215,
  scatter = true,
  seed = 7,
  spotlight = true,
  shade = 0.62,
  hole = 0.9,
  feather = 0.9,
  tint = "#08080a",
  background = "var(--background, #000000)",
  className,
  style,
  ariaLabel = "Curve media wall",
  interactive = true,
}: CurveWallProps) {
  const stageRef = useRef<HTMLElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<Array<HTMLDivElement | null>>([]);
  const mediaRefs = useRef<Array<HTMLImageElement | HTMLVideoElement | null>>(
    [],
  );
  const layoutRef = useRef<Layout | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, set: false });
  const hoverRef = useRef({ slot: -1, amounts: [] as number[] });
  const visibleRef = useRef(true);
  const reducedRef = useRef(false);
  const coarseRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const introRef = useRef(false);
  const introTimerRef = useRef<number | null>(null);
  const tileItemsRef = useRef<CurveWallItem[]>([]);
  const aspectsRef = useRef<number[]>([]);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const viewerRef = useRef<ViewerState>({
    phase: "idle",
    slot: -1,
    startedAt: 0,
    from: null,
    fromWidth: 0,
    fromHeight: 0,
    current: null,
    currentWidth: 0,
    currentHeight: 0,
  });
  const viewerPressRef = useRef<ViewerPress>({
    active: false,
    slot: -1,
    x: 0,
    y: 0,
    at: 0,
  });
  const previousViewerSlotRef = useRef<number | null>(null);
  const configRef = useRef({
    bow,
    lens,
    reach,
    drift,
    dragSpeed,
    wheelSpeed,
    settle,
    wander,
    heading,
    spotlight,
    shade,
    spotlightTint: tint,
    fit,
  });
  const dragRef = useRef<DragState>({
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
    held: false,
    pointer: -1,
    grabX: 0,
    grabY: 0,
    seedX: 0,
    seedY: 0,
    lastX: 0,
    lastY: 0,
    lastAt: 0,
    downAt: 0,
    travel: 0,
  });
  const [layout, setLayout] = useState<Layout | null>(null);
  const [viewerSlot, setViewerSlot] = useState<number | null>(null);

  configRef.current = {
    bow,
    lens,
    reach,
    drift,
    dragSpeed,
    wheelSpeed,
    settle,
    wander,
    heading,
    spotlight,
    shade,
    spotlightTint: tint,
    fit: fit as "cover" | "contain",
  };

  const tileItems = useMemo(() => {
    if (!layout || layout.cols <= 0 || layout.rows <= 0 || items.length === 0) {
      return [];
    }
    const order = buildScatter(
      layout.cols,
      layout.rows,
      items.length,
      scatter,
      seed,
    );
    return Array.from({ length: layout.cols * layout.rows }, (_, slot) => {
      const index = order[slot] ?? 0;
      return items[index] ?? items[0] ?? EMPTY_ITEM;
    });
  }, [items, layout, scatter, seed]);

  tileItemsRef.current = tileItems;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: none)");
    const update = () => {
      reducedRef.current = motion.matches;
      coarseRef.current = hover.matches;
    };
    update();
    motion.addEventListener?.("change", update);
    hover.addEventListener?.("change", update);
    return () => {
      motion.removeEventListener?.("change", update);
      hover.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (width < 2 || height < 2) return;
      const safeColumns = Math.max(2, Math.round(columns));
      const safeGap = gap;
      const safeRatio = Math.max(0.3, ratio);
      const safeScale = clamp(tileScale, 0.4, 1.4);
      const baseCellW = width / safeColumns;
      const cellW = baseCellW * safeScale;
      const scaledGap = safeGap * safeScale;
      const tileW = Math.max(24, (baseCellW - safeGap) * safeScale);
      const tileH = Math.max(24, tileW / safeRatio);
      const cellH = tileH + scaledGap;
      const cols = safeColumns + 2;
      const rows = Math.ceil(height / cellH) + 2;
      const spanX = cols * cellW;
      const spanY = rows * cellH;
      const unit = Math.min(cellW, cellH);
      const coarseScale =
        typeof window !== "undefined" &&
        window.matchMedia("(hover: none)").matches
          ? 1.9
          : 1;
      const holeSize = Math.max(24, hole * unit) * coarseScale;
      const featherSize = Math.max(8, feather * unit) * coarseScale;
      const bands: string[] = [];
      for (let index = 0; index <= 13; index++) {
        const ratioStep = index / 13;
        const stop = holeSize + ratioStep * featherSize;
        bands.push(
          `rgba(0,0,0,${smoothstep(ratioStep).toFixed(3)}) ${stop.toFixed(1)}px`,
        );
      }
      const next: Layout = {
        w: width,
        h: height,
        gap: scaledGap,
        cellW,
        cellH,
        tileW,
        tileH,
        cols,
        rows,
        spanX,
        spanY,
        startX: -(spanX - width) / 2,
        startY: -(spanY - height) / 2,
        midX: width / 2,
        midY: height / 2,
        bands: bands.join(","),
      };
      layoutRef.current = next;
      if (!pointerRef.current.set) {
        pointerRef.current = {
          x: next.midX,
          y: next.midY,
          tx: next.midX,
          ty: next.midY,
          set: true,
        };
      }
      setLayout((current) =>
        current &&
        current.w === next.w &&
        current.h === next.h &&
        current.cols === next.cols &&
        current.rows === next.rows &&
        Math.abs(current.tileW - next.tileW) < 0.5 &&
        Math.abs(current.tileH - next.tileH) < 0.5
          ? current
          : next,
      );
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [columns, gap, ratio, tileScale, hole, feather]);

  useEffect(() => {
    const cover = coverRef.current;
    if (!cover || introRef.current || !layout) return;
    const finish = () => {
      if (introRef.current) return;
      introRef.current = true;
      if (introTimerRef.current !== null) {
        window.clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
      cover.style.transition = reducedRef.current
        ? "none"
        : "opacity 600ms ease";
      cover.style.opacity = "0";
    };
    if (reducedRef.current) {
      finish();
      return;
    }
    const media = mediaRefs.current.filter(
      (element): element is HTMLImageElement | HTMLVideoElement =>
        Boolean(element),
    );
    let pending = media.length;
    const onReady = () => {
      pending -= 1;
      if (pending <= 0) finish();
    };
    media.forEach((element) => {
      const ready =
        element instanceof HTMLImageElement
          ? element.complete
          : element.readyState >= 2;
      if (ready) {
        onReady();
        return;
      }
      element.addEventListener("load", onReady, { once: true });
      element.addEventListener("loadeddata", onReady, { once: true });
      element.addEventListener("error", onReady, { once: true });
    });
    introTimerRef.current = window.setTimeout(finish, 1600);
    if (pending === 0) finish();
    return () => {
      media.forEach((element) => {
        element.removeEventListener("load", onReady);
        element.removeEventListener("loadeddata", onReady);
        element.removeEventListener("error", onReady);
      });
      if (introTimerRef.current !== null) {
        window.clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
    };
  }, [layout]);

  useEffect(() => {
    const stage = stageRef.current;
    const activeLayout = layoutRef.current;
    if (!stage || !activeLayout) return;
    const tiles = tileRefs.current;
    const media = mediaRefs.current;
    const count = tiles.length;
    const transforms = new Array<string>(count).fill("");
    const innerTransforms = new Array<string>(count).fill("");
    const sizes = new Array<string>(count).fill("");
    hoverRef.current.slot = -1;
    hoverRef.current.amounts = new Array<number>(count).fill(0);
    let lastTime = performance.now();
    let stopped = false;

    const pauseAll = () => {
      for (const element of media) {
        if (isVideo(element) && !element.paused) element.pause();
      }
    };

    const render = (delta: number, now: number) => {
      const config = configRef.current;
      const drag = dragRef.current;
      const pointer = pointerRef.current;
      const hover = hoverRef.current;
      const viewer = viewerRef.current;
      const currentLayout = layoutRef.current;
      if (!currentLayout) return;
      const { w, h, cellW, cellH, tileW, midX, midY } = currentLayout;
      const viewerActive = viewer.phase !== "idle";

      if (!drag.held && !viewerActive) {
        if (Math.abs(drag.vx) > 1.2 || Math.abs(drag.vy) > 1.2) {
          const friction =
            clamp(config.settle, 0.5, 0.99) ** (delta * 60);
          drag.ox += drag.vx * delta;
          drag.oy += drag.vy * delta;
          drag.vx *= friction;
          drag.vy *= friction;
        } else {
          drag.vx = 0;
          drag.vy = 0;
        }
        if (config.wander > 0) {
          const angle = (config.heading * Math.PI) / 180;
          drag.ox += Math.cos(angle) * config.wander * delta;
          drag.oy += Math.sin(angle) * config.wander * delta;
        }
      } else if (viewerActive) {
        drag.vx = 0;
        drag.vy = 0;
      }

      if (Math.abs(pointer.x - pointer.tx) > 0.35 || Math.abs(pointer.y - pointer.ty) > 0.35) {
        pointer.x = mix(pointer.x, pointer.tx, 0.16, delta);
        pointer.y = mix(pointer.y, pointer.ty, 0.16, delta);
      } else {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }

      const pace = Math.hypot(drag.vx, drag.vy);
      const bowAmount = clamp(config.bow, -0.6, 0.6);
      const lensAmount =
        clamp(config.lens, 0, 1) * (1 / (1 + pace / 380));
      const reachPx = Math.max(
        40,
        config.reach * Math.min(cellW, cellH),
      );
      const reachSq = reachPx * reachPx;
      const gapHalf = currentLayout.gap / 2;
      const mediaDrift = config.drift * tileW * 0.05;
      const warp = (x: number, y: number): Point => {
        const dx = x - midX;
        const dy = y - midY;
        const nx = dx / midX;
        const ny = dy / midY;
        const scale = 1 + bowAmount * (nx * nx + ny * ny);
        let warpedX = midX + dx * scale;
        let warpedY = midY + dy * scale;
        if (lensAmount > 0.001) {
          const px = warpedX - pointer.x;
          const py = warpedY - pointer.y;
          const strength =
            lensAmount * Math.exp(-(px * px + py * py) / reachSq);
          warpedX += px * strength;
          warpedY += py * strength;
        }
        return { x: warpedX, y: warpedY };
      };

      const hoverSlot = viewerActive || drag.held ? -1 : hover.slot;
      const anyHover = hoverSlot >= 0;

      for (let slot = 0; slot < count; slot++) {
        const target = slot === hoverSlot ? 1 : 0;
        const amount = hover.amounts[slot] ?? 0;
        if (reducedRef.current) {
          hover.amounts[slot] = target;
        } else {
          const next = easeToward(
            amount,
            target,
            target > amount ? 0.08 : 0.12,
            delta,
          );
          hover.amounts[slot] =
            Math.abs(next - target) < 0.001 ? target : next;
        }
      }

      const bumpRadius = LIFT_RADIUS * Math.max(cellW, cellH);
      const bumpRadiusSq = bumpRadius * bumpRadius;
      const hoverFields: Array<{ x: number; y: number; amount: number }> = [];
      for (let slot = 0; slot < count; slot++) {
        const amount = hover.amounts[slot] ?? 0;
        if (amount <= 0.001) continue;
        const column = slot % currentLayout.cols;
        const row = Math.floor(slot / currentLayout.cols);
        const x = wrap(
          column * cellW + drag.ox,
          currentLayout.startX,
          currentLayout.spanX,
        );
        const y = wrap(
          row * cellH + drag.oy,
          currentLayout.startY,
          currentLayout.spanY,
        );
        hoverFields.push({
          x: x + cellW / 2,
          y: y + cellH / 2,
          amount,
        });
      }

      const projectVertex = (x: number, y: number): Point => {
        const projected = warp(x, y);
        if (reducedRef.current || hoverFields.length === 0) return projected;
        let lift = 0;
        for (const field of hoverFields) {
          const dx = periodicDelta(x - field.x, currentLayout.spanX);
          const dy = periodicDelta(y - field.y, currentLayout.spanY);
          const distanceSq = dx * dx + dy * dy;
          if (distanceSq >= bumpRadiusSq) continue;
          const distance = Math.sqrt(distanceSq);
          const bump = 0.5 + 0.5 * Math.cos((Math.PI * distance) / bumpRadius);
          lift += field.amount * bump;
        }
        if (lift <= 0.0001) return projected;
        const depth = clamp(lift * LIFT_DEPTH, 0, 0.12);
        const scale = 1 / (1 - depth);
        return {
          x: midX + (projected.x - midX) * scale,
          y: midY + (projected.y - midY) * scale,
        };
      };

      const makeWallQuad = (x: number, y: number): Quad => {
        const right = x + cellW;
        const bottom = y + cellH;
        const c = projectVertex(x, y);
        const tr = projectVertex(right, y);
        const bl = projectVertex(x, bottom);
        const br = projectVertex(right, bottom);
        const topWidth = Math.hypot(tr.x - c.x, tr.y - c.y) || 1;
        const bottomWidth = Math.hypot(br.x - bl.x, br.y - bl.y) || 1;
        const leftHeight = Math.hypot(bl.x - c.x, bl.y - c.y) || 1;
        const rightHeight = Math.hypot(br.x - tr.x, br.y - tr.y) || 1;
        const t1x = ((tr.x - c.x) / topWidth) * gapHalf;
        const t1y = ((tr.y - c.y) / topWidth) * gapHalf;
        const t2x = ((br.x - bl.x) / bottomWidth) * gapHalf;
        const t2y = ((br.y - bl.y) / bottomWidth) * gapHalf;
        const t3x = ((bl.x - c.x) / leftHeight) * gapHalf;
        const t3y = ((bl.y - c.y) / leftHeight) * gapHalf;
        const t4x = ((br.x - tr.x) / rightHeight) * gapHalf;
        const t4y = ((br.y - tr.y) / rightHeight) * gapHalf;
        return {
          tl: { x: c.x + t1x + t3x, y: c.y + t1y + t3y },
          tr: { x: tr.x - t1x + t4x, y: tr.y - t1y + t4y },
          bl: { x: bl.x + t2x - t3x, y: bl.y + t2y - t3y },
          br: { x: br.x - t2x - t4x, y: br.y - t2y - t4y },
        };
      };

      for (let slot = 0; slot < count; slot++) {
        const tile = tiles[slot];
        if (!tile) continue;
        const column = slot % currentLayout.cols;
        const row = Math.floor(slot / currentLayout.cols);
        const x = wrap(
          column * cellW + drag.ox,
          currentLayout.startX,
          currentLayout.spanX,
        );
        const y = wrap(
          row * cellH + drag.oy,
          currentLayout.startY,
          currentLayout.spanY,
        );
        const mediaElement = media[slot] ?? null;
        const viewerSlotActive = viewer.phase !== "idle" && viewer.slot === slot;

        if (
          !viewerSlotActive &&
          (x > w + cellW ||
            x + cellW < -cellW ||
            y > h + cellH ||
            y + cellH < -cellH)
        ) {
          if (transforms[slot] !== "translate3d(-99999px,0,0)") {
            tile.style.transform = "translate3d(-99999px,0,0)";
            transforms[slot] = "translate3d(-99999px,0,0)";
          }
          if (isVideo(mediaElement) && !mediaElement.paused) {
            mediaElement.pause();
          }
          continue;
        }

        const wallQuad = makeWallQuad(x, y);
        let quad = wallQuad;
        let renderWidth = tileW;
        let renderHeight = currentLayout.tileH;
        let expanded = false;

        if (viewerSlotActive) {
          const aspect = aspectsRef.current[slot] ?? ratio;
          const duration = reducedRef.current ? 0 : VIEWER_DURATION;
          let progress =
            duration <= 0
              ? 1
              : clamp((now - viewer.startedAt) / duration, 0, 1);

          if (viewer.phase === "opening") {
            if (!viewer.from) {
              viewer.from = wallQuad;
              viewer.fromWidth = tileW;
              viewer.fromHeight = currentLayout.tileH;
              viewer.startedAt = now;
              progress = duration <= 0 ? 1 : 0;
            }
          }
          const eased = viewerEase(progress);

          if (viewer.phase === "opening") {
            const target = viewerTarget(currentLayout, aspect);
            const from = viewer.from ?? wallQuad;
            quad = lerpQuad(from, target.quad, eased);
            renderWidth = lerp(viewer.fromWidth || tileW, target.width, eased);
            renderHeight = lerp(
              viewer.fromHeight || currentLayout.tileH,
              target.height,
              eased,
            );
            expanded = true;
            if (progress >= 1) viewer.phase = "open";
          } else if (viewer.phase === "open") {
            const target = viewerTarget(currentLayout, aspect);
            quad = target.quad;
            renderWidth = target.width;
            renderHeight = target.height;
            expanded = true;
          } else if (viewer.phase === "closing") {
            const from = viewer.from ?? wallQuad;
            quad = lerpQuad(from, wallQuad, eased);
            renderWidth = lerp(viewer.fromWidth, tileW, eased);
            renderHeight = lerp(viewer.fromHeight, currentLayout.tileH, eased);
            expanded = true;
            if (progress >= 1) {
              viewer.phase = "idle";
              viewer.slot = -1;
              viewer.from = null;
              viewer.current = null;
              viewer.fromWidth = 0;
              viewer.fromHeight = 0;
              viewer.currentWidth = 0;
              viewer.currentHeight = 0;
              setViewerSlot(null);
              quad = wallQuad;
              renderWidth = tileW;
              renderHeight = currentLayout.tileH;
              expanded = false;
            }
          }

          if (expanded) {
            viewer.current = quad;
            viewer.currentWidth = renderWidth;
            viewer.currentHeight = renderHeight;
          }
        }

        const viewerOpen = viewer.phase !== "idle" && viewer.slot === slot;
        const sizeKey = `${renderWidth.toFixed(2)}:${renderHeight.toFixed(2)}`;
        if (sizes[slot] !== sizeKey) {
          tile.style.width = `${renderWidth.toFixed(2)}px`;
          tile.style.height = `${renderHeight.toFixed(2)}px`;
          sizes[slot] = sizeKey;
        }

        const transform = homography(
          renderWidth,
          renderHeight,
          quad.tl,
          quad.tr,
          quad.bl,
          quad.br,
        );
        if (transform !== transforms[slot]) {
          tile.style.transform = transform;
          transforms[slot] = transform;
        }

        if (mediaElement) {
          const mediaFit = expanded ? "contain" : config.fit;
          if (mediaElement.style.objectFit !== mediaFit) {
            mediaElement.style.objectFit = mediaFit;
          }
          let inner = "translate3d(0,0,0) scale(1)";
          if (!expanded && config.fit === "cover" && mediaDrift > 0) {
            const innerX = (x + cellW / 2) / w - 0.5;
            const innerY = (y + cellH / 2) / h - 0.5;
            inner = `translate3d(${(-innerX * mediaDrift).toFixed(2)}px,${(-innerY * mediaDrift).toFixed(2)}px,0) scale(1.12)`;
          }
          if (inner !== innerTransforms[slot]) {
            mediaElement.style.transform = inner;
            innerTransforms[slot] = inner;
          }
        }

        const onScreen = x < w && x + cellW > 0 && y < h && y + cellH > 0;
        if (isVideo(mediaElement)) {
          if (onScreen && visibleRef.current && !document.hidden) {
            if (mediaElement.paused) {
              mediaElement.play().catch(() => {});
            }
          } else if (!mediaElement.paused) {
            mediaElement.pause();
          }
        }

        const viewerAny = viewer.phase !== "idle";
        const overlay = overlayRefs.current[slot];
        if (overlay) {
          let opacity = 0;
          if (viewerAny) opacity = viewerOpen ? 0 : VIEWER_DIM;
          else if (anyHover) opacity = slot === hoverSlot ? 0 : HOVER_DIM;
          const value = String(opacity);
          if (overlay.style.opacity !== value) overlay.style.opacity = value;
          const duration = viewerAny ? "350ms" : "300ms";
          if (overlay.style.transitionDuration !== duration) {
            overlay.style.transitionDuration = duration;
          }
        }

        const zIndex = viewerOpen ? "6" : "1";
        if (tile.style.zIndex !== zIndex) tile.style.zIndex = zIndex;
        const cursor = viewerOpen ? "zoom-out" : "inherit";
        if (tile.style.cursor !== cursor) tile.style.cursor = cursor;
      }

      const vignette = vignetteRef.current;
      if (vignette) {
        const opacity = config.spotlight ? clamp(config.shade, 0, 1) : 0;
        const roundedOpacity = Math.round(opacity * 200);
        if (vignette.dataset.opacity !== String(roundedOpacity)) {
          vignette.style.opacity = String(opacity);
          vignette.dataset.opacity = String(roundedOpacity);
        }
        if (opacity > 0) {
          const centerX = Math.round(coarseRef.current ? midX : pointer.x);
          const centerY = Math.round(coarseRef.current ? midY : pointer.y);
          const center = `${centerX}:${centerY}`;
          if (vignette.dataset.center !== center) {
            const gradient = `radial-gradient(circle at ${centerX}px ${centerY}px,${currentLayout.bands})`;
            vignette.style.maskImage = gradient;
            vignette.style.webkitMaskImage = gradient;
            vignette.dataset.center = center;
          }
        }
      }
    };

    const tick = (now: number) => {
      if (stopped) return;
      if (!visibleRef.current || document.hidden) {
        frameRef.current = null;
        return;
      }
      const delta = Math.min((now - lastTime) / 1000, MAX_FRAME_DELTA);
      lastTime = now;
      render(Math.max(delta, 0), now);
      frameRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frameRef.current !== null || stopped) return;
      lastTime = performance.now();
      frameRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };

    render(0, performance.now());
    start();

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        pauseAll();
      } else if (visibleRef.current) {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              const visible = entries.some((entry) => entry.isIntersecting);
              visibleRef.current = visible;
              if (visible) start();
              else {
                stop();
                pauseAll();
              }
            },
            { rootMargin: "96px", threshold: 0 },
          );
    if (observer) observer.observe(stage);
    else visibleRef.current = true;

    const onWheel = (event: WheelEvent) => {
      if (!interactive) return;
      if (viewerRef.current.phase !== "idle") return;
      if (event.cancelable) event.preventDefault();
      const multiplier = wheelSpeed * 9;
      dragRef.current.vx = clamp(
        dragRef.current.vx - event.deltaX * multiplier,
        -9000,
        9000,
      );
      dragRef.current.vy = clamp(
        dragRef.current.vy - event.deltaY * multiplier,
        -9000,
        9000,
      );
      start();
    };
    stage.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      stopped = true;
      stop();
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      stage.removeEventListener("wheel", onWheel);
      pauseAll();
    };
  }, [layout, tileItems, interactive, wheelSpeed]);

  useEffect(() => {
    return () => {
      if (introTimerRef.current !== null) {
        window.clearTimeout(introTimerRef.current);
      }
    };
  }, []);

  const openViewer = useCallback(
    (slot: number) => {
      if (!interactive) return;
      const viewer = viewerRef.current;
      if (viewer.phase !== "idle") return;
      const tile = tileRefs.current[slot];
      if (!tile) return;
      viewer.phase = "opening";
      viewer.slot = slot;
      viewer.startedAt = 0;
      viewer.from = null;
      viewer.fromWidth = 0;
      viewer.fromHeight = 0;
      viewer.current = null;
      viewer.currentWidth = 0;
      viewer.currentHeight = 0;
      viewerPressRef.current.active = false;
      const drag = dragRef.current;
      drag.held = false;
      drag.pointer = -1;
      drag.vx = 0;
      drag.vy = 0;
      hoverRef.current.slot = -1;
      const stage = stageRef.current;
      if (stage) stage.style.cursor = "default";
      setViewerSlot(slot);
    },
    [interactive],
  );

  const closeViewer = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer.phase === "idle" || viewer.phase === "closing") return;
    const layout = layoutRef.current;
    viewer.phase = "closing";
    viewer.startedAt = performance.now();
    viewer.from = viewer.current;
    viewer.fromWidth = viewer.currentWidth || layout?.tileW || 1;
    viewer.fromHeight = viewer.currentHeight || layout?.tileH || 1;
    viewerPressRef.current.active = false;
    hoverRef.current.slot = -1;
  }, []);

  useEffect(() => {
    const previous = previousViewerSlotRef.current;
    tileRefs.current.forEach((tile, slot) => {
      if (!tile) return;
      tile.inert = interactive && viewerSlot !== null && slot !== viewerSlot;
    });
    const targetSlot = viewerSlot ?? previous;
    if (targetSlot !== null && targetSlot >= 0) {
      const tile = tileRefs.current[targetSlot];
      requestAnimationFrame(() => {
        tile?.focus({ preventScroll: true });
      });
    }
    previousViewerSlotRef.current = viewerSlot;
  }, [viewerSlot, interactive]);

  useEffect(() => {
    if (viewerSlot === null) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeViewer();
    };
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const stage = stageRef.current;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (stage?.contains(target)) return;
      closeViewer();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [viewerSlot, closeViewer]);

  const findSlotAt = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage || typeof document === "undefined") return -1;
    const element = document.elementFromPoint(clientX, clientY);
    const tile = element?.closest<HTMLElement>("[data-slot]");
    if (!tile || !stage.contains(tile)) return -1;
    const index = Number(tile.dataset.slot);
    return Number.isFinite(index) ? index : -1;
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!interactive) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const stage = stageRef.current;
      if (!stage) return;
      const viewer = viewerRef.current;
      if (viewer.phase !== "idle") {
        const target = event.target as Element | null;
        if (target?.closest("[data-visit]")) return;
        const slot = findSlotAt(event.clientX, event.clientY);
        if (slot !== viewer.slot) {
          closeViewer();
          return;
        }
        viewerPressRef.current = {
          active: true,
          slot,
          x: event.clientX,
          y: event.clientY,
          at: performance.now(),
        };
        return;
      }
      stage.focus({ preventScroll: true });
      const drag = dragRef.current;
      drag.held = true;
      drag.pointer = event.pointerId;
      drag.grabX = event.clientX;
      drag.grabY = event.clientY;
      drag.seedX = drag.ox;
      drag.seedY = drag.oy;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastAt = performance.now();
      drag.downAt = drag.lastAt;
      drag.travel = 0;
      drag.vx = 0;
      drag.vy = 0;
      hoverRef.current.slot = -1;
      stage.style.cursor = "grabbing";
      try {
        stage.setPointerCapture(event.pointerId);
      } catch {
        void 0;
      }
    },
    [closeViewer, findSlotAt, interactive],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!interactive) return;
      const stage = stageRef.current;
      if (!stage) return;
      if (viewerRef.current.phase !== "idle") return;
      const rect = stage.getBoundingClientRect();
      const pointer = pointerRef.current;
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
      pointer.set = true;
      const drag = dragRef.current;
      if (drag.held && drag.pointer === event.pointerId) {
        drag.ox = drag.seedX + (event.clientX - drag.grabX) * dragSpeed;
        drag.oy = drag.seedY + (event.clientY - drag.grabY) * dragSpeed;
        const now = performance.now();
        const elapsed = Math.max(8, now - drag.lastAt);
        drag.vx = clamp(
          ((event.clientX - drag.lastX) * dragSpeed * 1000) / elapsed,
          -9000,
          9000,
        );
        drag.vy = clamp(
          ((event.clientY - drag.lastY) * dragSpeed * 1000) / elapsed,
          -9000,
          9000,
        );
        drag.travel +=
          Math.abs(event.clientX - drag.lastX) +
          Math.abs(event.clientY - drag.lastY);
        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
        drag.lastAt = now;
        hoverRef.current.slot = -1;
        return;
      }
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        const slot = findSlotAt(event.clientX, event.clientY);
        hoverRef.current.slot = slot;
        stage.style.cursor = slot >= 0 ? "pointer" : "grab";
      }
    },
    [dragSpeed, findSlotAt, interactive],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const viewer = viewerRef.current;
      if (viewer.phase !== "idle") {
        const press = viewerPressRef.current;
        if (
          press.active &&
          press.slot === viewer.slot &&
          event.type === "pointerup"
        ) {
          const moved = Math.hypot(
            event.clientX - press.x,
            event.clientY - press.y,
          );
          const elapsed = performance.now() - press.at;
          press.active = false;
          if (moved < 5 && elapsed < 300) closeViewer();
        }
        return;
      }
      const drag = dragRef.current;
      if (drag.pointer !== event.pointerId) return;
      const wasClick =
        Math.hypot(
          event.clientX - drag.grabX,
          event.clientY - drag.grabY,
        ) < 5 &&
        drag.travel < 5 &&
        event.type === "pointerup" &&
        performance.now() - drag.downAt < 300;
      drag.held = false;
      drag.pointer = -1;
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        void 0;
      }
      if (wasClick) {
        const slot = findSlotAt(event.clientX, event.clientY);
        if (slot >= 0) openViewer(slot);
      }
      if (!interactive) {
        stage.style.cursor = "default";
        return;
      }
      const slot = findSlotAt(event.clientX, event.clientY);
      hoverRef.current.slot = slot;
      stage.style.cursor = slot >= 0 ? "pointer" : "grab";
    },
    [closeViewer, findSlotAt, interactive, openViewer],
  );

  const handlePointerLeave = useCallback(() => {
    if (dragRef.current.held) return;
    if (viewerRef.current.phase !== "idle") return;
    hoverRef.current.slot = -1;
    const currentLayout = layoutRef.current;
    if (currentLayout) {
      pointerRef.current.tx = currentLayout.midX;
      pointerRef.current.ty = currentLayout.midY;
    }
    const stage = stageRef.current;
    if (stage) stage.style.cursor = interactive ? "grab" : "default";
  }, [interactive]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!interactive) return;
      const target = event.target as Element | null;
      if (target?.closest("[data-visit]")) return;
      const tile = target?.closest<HTMLElement>("[data-slot]");
      const slot = tile ? Number(tile.dataset.slot) : -1;
      const viewer = viewerRef.current;
      const activateKey = event.key === "Enter" || event.key === " ";
      if (viewer.phase !== "idle") {
        if (event.key === "Escape") {
          event.preventDefault();
          closeViewer();
        } else if (activateKey && slot === viewer.slot) {
          event.preventDefault();
          closeViewer();
        }
        return;
      }
      if (activateKey && Number.isFinite(slot) && slot >= 0) {
        event.preventDefault();
        openViewer(slot);
        return;
      }
      const currentLayout = layoutRef.current;
      if (!currentLayout) return;
      const step = 4.8;
      const drag = dragRef.current;
      if (event.key === "ArrowLeft") drag.vx = -currentLayout.cellW * step;
      else if (event.key === "ArrowRight") drag.vx = currentLayout.cellW * step;
      else if (event.key === "ArrowUp") drag.vy = -currentLayout.cellH * step;
      else if (event.key === "ArrowDown") drag.vy = currentLayout.cellH * step;
      else return;
      event.preventDefault();
      hoverRef.current.slot = -1;
    },
    [closeViewer, interactive, openViewer],
  );

  const recordAspect = useCallback(
    (slot: number, element: HTMLImageElement | HTMLVideoElement) => {
      const width =
        element instanceof HTMLVideoElement
          ? element.videoWidth
          : element.naturalWidth;
      const height =
        element instanceof HTMLVideoElement
          ? element.videoHeight
          : element.naturalHeight;
      if (width > 0 && height > 0) {
        aspectsRef.current[slot] = width / height;
      }
    },
    [],
  );

  return (
    <section
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background,
        touchAction: "none",
        userSelect: "none",
        outline: "none",
        cursor: interactive ? "grab" : "default",
        ...style,
      }}
    >
      {layout &&
        tileItems.map((item, slot) => {
          const active = viewerSlot === slot;
          return (
            <div
              key={slot}
              data-slot={slot}
              ref={(node) => {
                tileRefs.current[slot] = node;
              }}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? item.alt : undefined}
              aria-expanded={interactive ? active : undefined}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: layout.tileW,
                height: layout.tileH,
                transformOrigin: "0 0",
                transform: "translate3d(-99999px,0,0)",
                borderRadius: radius,
                overflow: "hidden",
                background: "var(--background, #000000)",
                zIndex: 1,
                cursor: active ? "zoom-out" : "inherit",
                backfaceVisibility: "hidden",
              }}
            >
              {item.type === "video" ? (
                <video
                  ref={(node) => {
                    mediaRefs.current[slot] = node;
                  }}
                  src={item.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  onLoadedMetadata={(event) =>
                    recordAspect(slot, event.currentTarget)
                  }
                  style={MEDIA_STYLE}
                />
              ) : (
                <img
                  ref={(node) => {
                    mediaRefs.current[slot] = node;
                  }}
                  src={item.src}
                  alt=""
                  draggable={false}
                  onLoad={(event) => recordAspect(slot, event.currentTarget)}
                  style={MEDIA_STYLE}
                />
              )}
              <div
                ref={(node) => {
                  overlayRefs.current[slot] = node;
                }}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#000",
                  opacity: 0,
                  pointerEvents: "none",
                  transitionProperty: "opacity",
                  transitionTimingFunction: "ease",
                  transitionDuration: "300ms",
                }}
              />
              {interactive && active && item.href && (
                <a
                  data-visit
                  href={item.href}
                  target={item.newTab ? "_blank" : undefined}
                  rel={item.newTab ? "noopener noreferrer" : undefined}
                  aria-label={`Visit ${item.alt}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                  className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                >
                  Visit
                </a>
              )}
            </div>
          );
        })}

      <div
        ref={vignetteRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          background: tint,
          opacity: 0,
        }}
      />

      <div
        ref={coverRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          background: tint,
          opacity: 1,
          pointerEvents: "none",
        }}
      />

    </section>
  );
}
