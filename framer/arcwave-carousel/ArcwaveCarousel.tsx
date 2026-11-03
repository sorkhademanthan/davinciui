/**
 * ArcwaveCarousel
 * -----------------------------------------------------------------------------
 * An infinite 3D carousel whose cards sit on the inside of a cylinder. The
 * centre card faces the viewer while the side cards curve away, fade, blur and
 * darken toward the silhouette.
 *
 * Usage
 *   Drop the component on the canvas, add slides (or leave the default team),
 *   then tune the cylinder, motion, autoplay and caption properties. A fresh
 *   drop is fully configured and needs no setup.
 *
 * Cylinder math
 *   Each plate is placed by its signed slot distance d from the continuous
 *   carousel position. The true angle is theta = d * pitch. The visible arc is
 *   clamped to +/-90 degrees, then:
 *
 *     x = R * sin(theta)        z = -R * (1 - cos(theta))
 *
 *   so the plate plane is always tangent to the cylinder. rotateY mirrors the
 *   angle (clamped to maxRotation for readability) and opacity, blur, z-index
 *   and easing all derive from the visible angle ratio.
 *
 * Layout/motion are written straight to element refs from one rAF loop. No
 * React state is updated per frame.
 *
 * Browser support
 *   Any browser with CSS 3D transforms, pointer events and ResizeObserver.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 600
 * @framerDisableUnlink
 */

import * as React from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";

/* =============================================================================
 * 1. CONSTANTS
 * ===========================================================================*/

const BASE_CARD_WIDTH = 168;
const BASE_CARD_HEIGHT = 240;
const BASE_RADIUS = 532; // [MEASURED] 3.1667 * 168
const BASE_PERSPECTIVE = 480; // [MEASURED] 2.857 * 168
const BASE_GAP = 6.4; // [MEASURED] 30.038 * 168
const RADIUS_PER_WIDTH = 532 / 168; // 3.1667
const PERSPECTIVE_PER_WIDTH = 480 / 168; // 2.857

const ROTATION_LIMIT = 65; // [MEASURED] deg
const VISIBLE_ARC = 90; // [MEASURED] deg
const SIDE_OPACITY = 0.45; // [MEASURED]
const SIDE_BLUR = 2.4; // [MEASURED] px at 90 deg / W=168
const BLUR_EXPONENT = 1.3; // [MEASURED]
const Z_BASE = 500; // [MEASURED]
const INTERACTIVE_ANGLE = 75; // [MEASURED between 67 and 83]
const ARIA_HIDDEN_OPACITY = 0.1; // [MEASURED]
const MIN_RING_SLOTS = 20; // [MEASURED]

const DEFAULT_CARD_BACKGROUND = "rgb(23, 23, 27)";
const DEFAULT_BACKGROUND = "rgb(0, 0, 0)";
const DEFAULT_SHADOW_Y = 24;
const DEFAULT_SHADOW_BLUR = 60;
const DEFAULT_SHADOW_ALPHA = 0.45;

const CAPTION_PADDING_RATIO = 0.04; // [MEASURED] of card width
const CAPTION_TITLE_RATIO = 0.044; // [MEASURED]
const CAPTION_DESCRIPTION_RATIO = 0.034; // [MEASURED]
const CAPTION_GRADIENT_RATIO = 0.4; // [ASSUMED]

const SNAP_EPSILON = 0.001;

/* =============================================================================
 * 2. TYPES
 * ===========================================================================*/

type CardSizeMode = "fixed" | "fillHeight";
type AutoplayMode = "continuous" | "step";
type AutoplayDirection = "left" | "right";
type CaptionMode = "hover" | "always" | "center";
type CaptionReveal = "fade" | "slide" | "none";
type VideoPlayback = "visible" | "centre" | "always";
type SlideMediaType = "image" | "video";

type SlideControlProps = {
  type?: SlideMediaType;
};

export interface ArcwaveImage {
  src?: string;
  srcSet?: string;
  alt?: string;
  sizes?: string;
}

export interface ArcwaveLink {
  href?: string;
  target?: string;
}

export interface ArcwaveSlide {
  type?: SlideMediaType;
  image?: string | ArcwaveImage | null;
  video?: string | ArcwaveImage | null;
  poster?: string | ArcwaveImage | null;
  title?: string;
  description?: string;
  link?: string | ArcwaveLink | null;
}

export interface ArcwaveFont {
  family?: string;
  style?: string;
  weight?: string;
  variationSettings?: string;
}

export interface ArcwaveCarouselProps {
  slides?: ArcwaveSlide[];
  cardSizeMode?: CardSizeMode;
  cardWidth?: number;
  cardHeight?: number;
  heightPercent?: number;
  gap?: number;
  cornerRadius?: number;
  cardBackground?: string;
  cylinderRadius?: number;
  perspective?: number;
  maxRotation?: number;
  visibleArc?: number;
  sideOpacity?: number;
  sideBlur?: number;
  sideDarken?: number;
  shadow?: string;
  edgeFade?: number;
  background?: string;
  dragEnabled?: boolean;
  dragSensitivity?: number;
  wheelEnabled?: boolean;
  wheelSensitivity?: number;
  momentum?: number;
  springStiffness?: number;
  springDamping?: number;
  snap?: boolean;
  autoplay?: boolean;
  autoplayMode?: AutoplayMode;
  autoplayDirection?: AutoplayDirection;
  autoplaySpeed?: number;
  stepInterval?: number;
  resumeDelay?: number;
  pauseOnHover?: boolean;
  captionMode?: CaptionMode;
  titleFont?: string | ArcwaveFont;
  descriptionFont?: string | ArcwaveFont;
  titleColor?: string;
  descriptionColor?: string;
  captionPadding?: number;
  captionGradient?: boolean;
  reveal?: CaptionReveal;
  videoPlayback?: VideoPlayback;
  ariaLabel?: string;
  /** Demo/testing override: render statically at this slot position. */
  debugPosition?: number;
  /** Initial continuous position in slot units. */
  initialPosition?: number;
}

export interface ArcwavePlateParams {
  slotCount: number;
  radius: number;
  pitchDegrees: number;
  maxRotation: number;
  visibleArc: number;
  sideOpacity: number;
  sideBlur: number;
  blurExponent: number;
  blurScale: number;
  zBase: number;
  interactiveAngle: number;
  ariaHiddenOpacity: number;
}

export interface ArcwavePlateState {
  slot: number;
  distance: number;
  theta: number;
  thetaClamped: number;
  x: number;
  z: number;
  rotateY: number;
  opacity: number;
  blur: number;
  zIndex: number;
  visible: boolean;
  interactive: boolean;
  ariaHidden: boolean;
}

interface ArcwaveDragState {
  pointerId: number;
  startX: number;
  lastX: number;
  lastTime: number;
  startPosition: number;
  moved: boolean;
  velocity: number;
}

interface ArcwaveEngineConfig {
  slotCount: number;
  plateParams: ArcwavePlateParams;
  debugPosition?: number;
  isCanvas: boolean;
  reducedMotion: boolean;
  autoplay: boolean;
  autoplayMode: AutoplayMode;
  autoplayDirection: AutoplayDirection;
  autoplaySpeed: number;
  stepInterval: number;
  resumeDelay: number;
  pauseOnHover: boolean;
  dragEnabled: boolean;
  dragSensitivity: number;
  wheelEnabled: boolean;
  wheelSensitivity: number;
  momentum: number;
  springStiffness: number;
  springDamping: number;
  snap: boolean;
  videoPlayback: VideoPlayback;
  cardWidth: number;
  gap: number;
}

/* =============================================================================
 * 3. MATH HELPERS
 * ===========================================================================*/

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const numberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;

const smoothstep = (edge0: number, edge1: number, value: number): number => {
  if (edge1 === edge0) return value < edge0 ? 0 : 1;
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Signed distance in slots, wrapped into (-slotCount / 2, slotCount / 2]. */
export function wrapSlotDistance(distance: number, slotCount: number): number {
  if (!Number.isFinite(distance) || slotCount <= 0) return 0;
  const wrapped = ((distance % slotCount) + slotCount) % slotCount;
  return wrapped > slotCount / 2 ? wrapped - slotCount : wrapped;
}

/** Angle between neighbouring slots, in degrees. */
export function computePitchDegrees(
  cardWidth: number,
  gap: number,
  radius: number,
): number {
  const safeRadius = Math.max(1, radius);
  return ((cardWidth + Math.max(0, gap)) / safeRadius) * (180 / Math.PI);
}

/**
 * Pure plate geometry. `position` is the continuous carousel position in slot
 * units; `slot` is the plate index in the cloned ring.
 */
export function computePlate(
  slot: number,
  position: number,
  params: ArcwavePlateParams,
): ArcwavePlateState {
  const slotCount = Math.max(1, params.slotCount);
  const distance = wrapSlotDistance(slot - position, slotCount);
  const theta = distance * params.pitchDegrees;
  const thetaClamped = clamp(theta, -params.visibleArc, params.visibleArc);
  const thetaRatio = Math.abs(thetaClamped) / Math.max(1, params.visibleArc);

  const x = params.radius * Math.sin(toRadians(thetaClamped));
  const z = -params.radius * (1 - Math.cos(toRadians(thetaClamped)));
  const rotateY = clamp(theta, -params.maxRotation, params.maxRotation);

  const fadeStart = Math.min(params.maxRotation, params.visibleArc);
  const edge =
    1 - smoothstep(fadeStart, params.visibleArc, Math.abs(thetaClamped));
  const base = lerp(1, params.sideOpacity, thetaRatio);
  const beyondArc = Math.abs(theta) > params.visibleArc;
  const opacity = beyondArc ? 0 : base * edge;
  const visible = opacity > 0;
  const blur =
    params.sideBlur *
    Math.pow(
      Math.abs(thetaClamped) / Math.max(1, params.visibleArc),
      params.blurExponent,
    ) *
    params.blurScale;
  const zIndex =
    params.zBase -
    Math.round(
      (20 * Math.abs(thetaClamped)) / Math.max(1, params.pitchDegrees),
    );
  const interactive = visible && Math.abs(theta) <= params.interactiveAngle;
  const ariaHidden = !visible || opacity < params.ariaHiddenOpacity;

  return {
    slot,
    distance,
    theta,
    thetaClamped,
    x,
    z,
    rotateY,
    opacity,
    blur,
    zIndex,
    visible,
    interactive,
    ariaHidden,
  };
}

/** Clone the set until the ring has at least 20 slots. */
export function buildRingSlides(
  slides: ArcwaveSlide[] | undefined,
): ArcwaveSlide[] {
  const source = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
  const copies = Math.max(1, Math.ceil(MIN_RING_SLOTS / source.length));
  const ring: ArcwaveSlide[] = [];
  for (let copy = 0; copy < copies; copy += 1) {
    for (const slide of source) ring.push(slide);
  }
  return ring;
}

function resolveImageSource(image: ArcwaveSlide["image"]): string {
  if (typeof image === "string") return image;
  return image?.src ?? "";
}

function resolveLink(link: ArcwaveSlide["link"]): ArcwaveLink | null {
  if (!link) return null;
  if (typeof link === "string") return { href: link };
  return link.href ? link : null;
}

interface ResolvedFont {
  fontFamily: string;
  fontStyle?: string;
  fontWeight?: string | number;
  fontVariationSettings?: string;
}

function resolveFont(
  font: string | ArcwaveFont | undefined,
  fallback: string,
): ResolvedFont {
  if (typeof font === "string" && font.trim()) return { fontFamily: font };
  if (font && typeof font === "object") {
    return {
      fontFamily: font.family || fallback,
      fontStyle: font.style,
      fontWeight: font.weight,
      fontVariationSettings: font.variationSettings,
    };
  }
  return { fontFamily: fallback };
}

function formatShadow(value: string | undefined, scale: number): string {
  if (value && value.trim()) return value;
  const y = DEFAULT_SHADOW_Y * scale;
  const blur = DEFAULT_SHADOW_BLUR * scale;
  return `0 ${y}px ${blur}px rgba(0, 0, 0, ${DEFAULT_SHADOW_ALPHA})`;
}

function isFramerCanvas(): boolean {
  try {
    return RenderTarget.current() === RenderTarget.canvas;
  } catch {
    return false;
  }
}

/* =============================================================================
 * 4. DEFAULT CONTENT
 * ===========================================================================*/

const PORTRAIT_PALETTES: ReadonlyArray<[string, string, string]> = [
  ["#E5A87C", "#8E3C42", "#18181D"],
  ["#A7C4B5", "#285A55", "#16181D"],
  ["#E0B34B", "#8C3F2B", "#18151A"],
  ["#9BB7D4", "#3C4A7E", "#17171C"],
  ["#D5A9C6", "#6B355E", "#18151B"],
  ["#C5B3DB", "#4F3D78", "#17161D"],
  ["#B5D4C0", "#356B5F", "#16181C"],
  ["#E8C48F", "#92552E", "#181614"],
  ["#B9C6D8", "#44566A", "#15181C"],
  ["#D8A3A0", "#74393C", "#181518"],
];

function portraitDataUri(
  name: string,
  palette: [string, string, string],
): string {
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 240" width="168" height="240">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${palette[0]}"/>
        <stop offset="0.55" stop-color="${palette[1]}"/>
        <stop offset="1" stop-color="${palette[2]}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.5" cy="0.32" r="0.7">
        <stop offset="0" stop-color="${palette[0]}" stop-opacity="0.85"/>
        <stop offset="1" stop-color="${palette[2]}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="168" height="240" fill="url(#bg)"/>
    <rect width="168" height="240" fill="url(#glow)"/>
    <circle cx="84" cy="92" r="33" fill="${palette[0]}" opacity="0.55"/>
    <path d="M28 240 C32 176 58 146 84 146 C110 146 136 176 140 240 Z" fill="${palette[2]}" opacity="0.72"/>
    <text x="14" y="28" fill="${palette[0]}" opacity="0.72"
      font-family="Inter, Helvetica, Arial, sans-serif" font-size="13" font-weight="600">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const TEAM: ReadonlyArray<{ title: string; description: string }> = [
  {
    title: "Mara Okafor",
    description: "Creative Director — leads brand and campaign vision",
  },
  {
    title: "Nora Vance",
    description: "UX Researcher — listens first, then shapes the product",
  },
  {
    title: "Julian Reyes",
    description: "Lead Engineer — builds fast, reliable front-end systems",
  },
  {
    title: "Kai Nakamura",
    description: "Motion Designer — crafts transitions that feel alive",
  },
  {
    title: "Iris Calder",
    description: "Brand Strategist — finds the story behind each name",
  },
  {
    title: "Lena Moreau",
    description: "Art Director — sets the visual tone for every launch",
  },
  {
    title: "Sofia Lind",
    description: "Content Lead — writes words people actually remember",
  },
  {
    title: "Amara Diallo",
    description: "Head of Operations — keeps every project on rhythm",
  },
  {
    title: "Elias Hart",
    description: "Photographer — captures light, texture and quiet moments",
  },
  {
    title: "Theo Brandt",
    description: "Product Designer — turns rough ideas into clear interfaces",
  },
];

export const DEFAULT_SLIDES: ArcwaveSlide[] = TEAM.map((member, index) => ({
  type: "image",
  image: {
    src: portraitDataUri(
      member.title,
      PORTRAIT_PALETTES[index % PORTRAIT_PALETTES.length],
    ),
    alt: `${member.title} portrait`,
  },
  title: member.title,
  description: member.description,
  link: null,
}));

/* =============================================================================
 * 5. HOOKS
 * ===========================================================================*/

function useElementSize(ref: React.RefObject<HTMLElement | null>): {
  width: number;
  height: number;
} {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const apply = (width: number, height: number): void => {
      setSize((previous) =>
        Math.abs(previous.width - width) > 0.5 ||
        Math.abs(previous.height - height) > 0.5
          ? { width, height }
          : previous,
      );
    };
    const rect = element.getBoundingClientRect();
    apply(rect.width, rect.height);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (): void => setReduced(query.matches);
    apply();
    query.addEventListener?.("change", apply);
    return () => query.removeEventListener?.("change", apply);
  }, []);

  return reduced;
}

/* =============================================================================
 * 6. COMPONENTS
 * ===========================================================================*/

const DEFAULTS = {
  cardSizeMode: "fixed" as CardSizeMode,
  cardWidth: BASE_CARD_WIDTH,
  cardHeight: BASE_CARD_HEIGHT,
  heightPercent: 82,
  gap: BASE_GAP,
  cornerRadius: 0,
  cardBackground: DEFAULT_CARD_BACKGROUND,
  cylinderRadius: 0,
  perspective: 0,
  maxRotation: ROTATION_LIMIT,
  visibleArc: VISIBLE_ARC,
  sideOpacity: SIDE_OPACITY,
  sideBlur: SIDE_BLUR,
  sideDarken: 0,
  shadow: "",
  edgeFade: 20,
  background: DEFAULT_BACKGROUND,
  dragEnabled: true,
  dragSensitivity: 1,
  wheelEnabled: true,
  wheelSensitivity: 1,
  momentum: 0.5,
  springStiffness: 180,
  springDamping: 27,
  snap: false,
  autoplay: true,
  autoplayMode: "continuous" as AutoplayMode,
  autoplayDirection: "left" as AutoplayDirection,
  autoplaySpeed: 1,
  stepInterval: 3,
  resumeDelay: 1,
  pauseOnHover: false,
  captionMode: "hover" as CaptionMode,
  titleFont: "Inter, Helvetica, Arial, sans-serif",
  descriptionFont: "Inter, Helvetica, Arial, sans-serif",
  titleColor: "#FFFFFF",
  descriptionColor: "rgba(255,255,255,0.55)",
  captionPadding: CAPTION_PADDING_RATIO,
  captionGradient: true,
  reveal: "slide" as CaptionReveal,
  videoPlayback: "visible" as VideoPlayback,
  ariaLabel: "Card carousel",
  initialPosition: 0,
};

const PLATE_CSS = `
  .thr3-plate {
    box-sizing: border-box;
    outline: none;
    backface-visibility: hidden;
  }
  .thr3-plate:focus-visible {
    outline: 2px solid #0A84FF;
    outline-offset: 4px;
  }
  .thr3-caption-copy {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 350ms ease-out, transform 350ms ease-out;
  }
  .thr3-plate[data-caption-mode="hover"]:hover .thr3-caption-copy,
  .thr3-plate[data-caption-mode="always"] .thr3-caption-copy,
  .thr3-plate[data-caption-mode="center"][data-center="true"] .thr3-caption-copy {
    opacity: 1;
    transform: translateY(0);
  }
  .thr3-plate[data-reveal="fade"] .thr3-caption-copy {
    transform: none;
  }
  .thr3-plate[data-reveal="none"] .thr3-caption-copy {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .thr3-caption-copy {
      transition: none;
    }
  }
`;

const FALLBACK_FONT = "Inter, Helvetica, Arial, sans-serif";

export default function ArcwaveCarousel(
  rawProps: ArcwaveCarouselProps,
): React.ReactElement {
  const props = { ...DEFAULTS, ...rawProps };
  const rootRef = React.useRef<HTMLDivElement>(null);
  const containerSize = useElementSize(rootRef);
  const isCanvas = isFramerCanvas();
  const reducedMotion = usePrefersReducedMotion();

  const ring = React.useMemo(
    () => buildRingSlides(props.slides),
    [props.slides],
  );
  const slotCount = ring.length;

  const containerHeight = containerSize.height > 0 ? containerSize.height : 600;
  const configuredWidth = clamp(
    numberOr(props.cardWidth, BASE_CARD_WIDTH),
    32,
    4000,
  );
  const configuredHeight = clamp(
    numberOr(props.cardHeight, BASE_CARD_HEIGHT),
    32,
    4000,
  );
  const aspect = clamp(configuredWidth / Math.max(1, configuredHeight), 0.2, 3);
  const heightPercent = clamp(
    numberOr(props.heightPercent, DEFAULTS.heightPercent),
    10,
    100,
  );
  const cardHeight =
    props.cardSizeMode === "fillHeight"
      ? clamp((containerHeight * heightPercent) / 100, 32, 4000)
      : configuredHeight;
  const cardWidth =
    props.cardSizeMode === "fillHeight"
      ? clamp(cardHeight * aspect, 32, 4000)
      : configuredWidth;

  const scale = cardWidth / BASE_CARD_WIDTH;
  const gap = Math.max(0, numberOr(props.gap, BASE_GAP) * scale);
  const radius =
    (numberOr(props.cylinderRadius, 0) > 0
      ? numberOr(props.cylinderRadius, BASE_RADIUS)
      : BASE_RADIUS) * scale;
  const perspective =
    (numberOr(props.perspective, 0) > 0
      ? numberOr(props.perspective, BASE_PERSPECTIVE)
      : BASE_PERSPECTIVE) * scale;
  const pitchDegrees = computePitchDegrees(cardWidth, gap, radius);
  const maxRotation = clamp(numberOr(props.maxRotation, ROTATION_LIMIT), 0, 90);
  const visibleArc = clamp(numberOr(props.visibleArc, VISIBLE_ARC), 10, 120);
  const sideOpacity = clamp(numberOr(props.sideOpacity, SIDE_OPACITY), 0, 1);
  const sideBlur = Math.max(0, numberOr(props.sideBlur, SIDE_BLUR));
  const sideDarken = clamp(numberOr(props.sideDarken, 0), 0, 1);
  const edgeFade = clamp(numberOr(props.edgeFade, 20), 0, 45);
  const background = props.background || DEFAULT_BACKGROUND;
  const radiusCss = Math.max(0, numberOr(props.cornerRadius, 0) * scale);
  const shadow = formatShadow(props.shadow, scale);
  const captionPadding = Math.max(
    0,
    numberOr(props.captionPadding, CAPTION_PADDING_RATIO) * cardWidth,
  );
  const titleSize = Math.max(8, CAPTION_TITLE_RATIO * cardWidth);
  const descriptionSize = Math.max(7, CAPTION_DESCRIPTION_RATIO * cardWidth);
  const titleFont = resolveFont(props.titleFont, FALLBACK_FONT);
  const descriptionFont = resolveFont(props.descriptionFont, FALLBACK_FONT);
  const titleWeight = titleFont.fontWeight ?? 600;
  const descriptionWeight = descriptionFont.fontWeight ?? 400;

  const debugPosition = Number.isFinite(Number(props.debugPosition))
    ? Number(props.debugPosition)
    : undefined;
  const configuredInitial = numberOr(props.initialPosition, 0);
  const startPosition =
    debugPosition ?? (isCanvas ? slotCount / 2 : configuredInitial);

  const plateParams: ArcwavePlateParams = {
    slotCount,
    radius,
    pitchDegrees,
    maxRotation,
    visibleArc,
    sideOpacity,
    sideBlur,
    blurExponent: BLUR_EXPONENT,
    blurScale: scale,
    zBase: Z_BASE,
    interactiveAngle: INTERACTIVE_ANGLE,
    ariaHiddenOpacity: ARIA_HIDDEN_OPACITY,
  };

  const positionRef = React.useRef(startPosition);
  const targetRef = React.useRef(startPosition);
  const velocityRef = React.useRef(0);
  const dragRef = React.useRef<ArcwaveDragState | null>(null);
  const suppressClickRef = React.useRef(false);
  const hoveredRef = React.useRef(false);
  const lastInteractionRef = React.useRef(0);
  const kickRef = React.useRef<() => void>(() => {});
  const plateRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([]);
  const linkRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);
  const configRef = React.useRef<ArcwaveEngineConfig | null>(null);

  configRef.current = {
    slotCount,
    plateParams,
    debugPosition,
    isCanvas,
    reducedMotion,
    autoplay: Boolean(props.autoplay),
    autoplayMode: props.autoplayMode,
    autoplayDirection: props.autoplayDirection,
    autoplaySpeed: Math.max(0.1, numberOr(props.autoplaySpeed, 1)),
    stepInterval: Math.max(0.5, numberOr(props.stepInterval, 3)),
    resumeDelay: Math.max(0, numberOr(props.resumeDelay, 1)),
    pauseOnHover: Boolean(props.pauseOnHover),
    dragEnabled: Boolean(props.dragEnabled),
    dragSensitivity: Math.max(0.1, numberOr(props.dragSensitivity, 1)),
    wheelEnabled: Boolean(props.wheelEnabled),
    wheelSensitivity: Math.max(0.1, numberOr(props.wheelSensitivity, 1)),
    momentum: clamp(numberOr(props.momentum, 0.5), 0, 1),
    springStiffness: clamp(numberOr(props.springStiffness, 180), 10, 600),
    springDamping: clamp(numberOr(props.springDamping, 27), 2, 100),
    snap: Boolean(props.snap),
    videoPlayback: props.videoPlayback,
    cardWidth,
    gap,
  };

  const isCentreSlot = (slot: number): boolean => {
    const config = configRef.current;
    if (!config) return false;
    return (
      Math.abs(
        wrapSlotDistance(slot - positionRef.current, config.slotCount),
      ) <= 0.5
    );
  };

  const bringToCentre = (slot: number): void => {
    const config = configRef.current;
    if (!config || config.isCanvas || config.debugPosition !== undefined)
      return;
    const distance = wrapSlotDistance(
      slot - positionRef.current,
      config.slotCount,
    );
    if (Math.abs(distance) <= 0.5) return;
    targetRef.current += distance;
    velocityRef.current = 0;
    lastInteractionRef.current = performance.now();
    kickRef.current();
  };

  const handlePlateClick = (
    slot: number,
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (isCentreSlot(slot)) return;
    event.preventDefault();
    event.stopPropagation();
    bringToCentre(slot);
  };

  const handleLinkClick = (
    slot: number,
    event: React.MouseEvent<HTMLAnchorElement>,
  ): void => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (isCentreSlot(slot)) return;
    event.preventDefault();
    event.stopPropagation();
    bringToCentre(slot);
  };

  const handlePlateKeyDown = (
    slot: number,
    event: React.KeyboardEvent<HTMLDivElement>,
  ): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (!isCentreSlot(slot)) {
      bringToCentre(slot);
      return;
    }
    linkRefs.current[slot]?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.defaultPrevented) return;
    const config = configRef.current;
    if (!config || config.isCanvas || config.debugPosition !== undefined)
      return;
    let delta = 0;
    if (event.key === "ArrowRight") delta = 1;
    else if (event.key === "ArrowLeft") delta = -1;
    else return;
    event.preventDefault();
    targetRef.current += delta;
    velocityRef.current = 0;
    lastInteractionRef.current = performance.now();
    kickRef.current();
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    const config = configRef.current;
    if (
      !config ||
      config.isCanvas ||
      config.debugPosition !== undefined ||
      !config.dragEnabled
    ) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (dragRef.current) return;
    const now = performance.now();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: now,
      startPosition: positionRef.current,
      moved: false,
      velocity: 0,
    };
    suppressClickRef.current = false;
    lastInteractionRef.current = now;
    kickRef.current();
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    const drag = dragRef.current;
    const config = configRef.current;
    if (!drag || !config || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 4 && !drag.moved) {
      drag.moved = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    event.preventDefault();
    const now = performance.now();
    const dt = Math.max(0.001, (now - drag.lastTime) / 1000);
    const slotWidth = Math.max(1, config.cardWidth + config.gap);
    const next = drag.startPosition - (dx / slotWidth) * config.dragSensitivity;
    const slotDelta =
      (-(event.clientX - drag.lastX) / slotWidth) * config.dragSensitivity;
    drag.velocity = clamp(slotDelta / dt, -30, 30);
    drag.lastX = event.clientX;
    drag.lastTime = now;
    positionRef.current = next;
    targetRef.current = next;
    velocityRef.current = 0;
    lastInteractionRef.current = now;
    event.currentTarget.style.cursor = "grabbing";
    kickRef.current();
  };

  const finishDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    cancelled: boolean,
  ): void => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(drag.pointerId)) {
      event.currentTarget.releasePointerCapture(drag.pointerId);
    }
    const config = configRef.current;
    event.currentTarget.style.cursor =
      config?.dragEnabled && !config.isCanvas ? "grab" : "default";
    if (!config || cancelled || !drag.moved) return;

    const projected =
      positionRef.current + drag.velocity * config.momentum * 0.8;
    targetRef.current = config.snap ? Math.round(projected) : projected;
    velocityRef.current = config.reducedMotion ? 0 : drag.velocity;
    lastInteractionRef.current = performance.now();
    suppressClickRef.current = true;
    kickRef.current();
  };

  const handleClickCapture = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handlePointerEnter = (): void => {
    hoveredRef.current = true;
    kickRef.current();
  };

  const handlePointerLeave = (): void => {
    hoveredRef.current = false;
    kickRef.current();
  };

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let previous = performance.now();
    let lastStep = previous;
    let wasAutoplayActive = false;

    const applyPlate = (slot: number, position: number): void => {
      const config = configRef.current;
      const plate = plateRefs.current[slot];
      if (!config || !plate) return;

      const state = computePlate(slot, position, config.plateParams);
      const centre = Math.abs(state.distance) <= 0.5;
      plate.style.transform = `translate(-50%, -50%) translate3d(${state.x.toFixed(2)}px, 0px, ${state.z.toFixed(2)}px) rotateY(${state.rotateY.toFixed(3)}deg) scale(1)`;
      plate.style.opacity = state.opacity.toFixed(4);
      plate.style.filter = `blur(${state.blur.toFixed(2)}px)`;
      plate.style.zIndex = String(state.zIndex);
      plate.style.visibility = state.visible ? "visible" : "hidden";
      plate.style.pointerEvents = state.interactive ? "auto" : "none";
      plate.tabIndex = state.interactive ? 0 : -1;
      plate.dataset.center = centre ? "true" : "false";
      if (state.ariaHidden) plate.setAttribute("aria-hidden", "true");
      else plate.removeAttribute("aria-hidden");

      const anchor = linkRefs.current[slot];
      if (anchor) anchor.tabIndex = -1;

      const video = videoRefs.current[slot];
      if (video) {
        const shouldPlay =
          !config.isCanvas &&
          (config.videoPlayback === "always" ||
            (config.videoPlayback === "centre"
              ? centre
              : state.visible && state.opacity > ARIA_HIDDEN_OPACITY));
        const flag = shouldPlay ? "1" : "0";
        if (video.dataset.thr3Playing !== flag) {
          video.dataset.thr3Playing = flag;
          if (shouldPlay) void video.play().catch(() => {});
          else video.pause();
        }
      }
    };

    const apply = (position: number): void => {
      const config = configRef.current;
      if (!config) return;
      for (let slot = 0; slot < config.slotCount; slot += 1) {
        applyPlate(slot, position);
      }
    };

    const onWheel = (event: WheelEvent): void => {
      const config = configRef.current;
      if (
        !config ||
        config.isCanvas ||
        config.debugPosition !== undefined ||
        !config.wheelEnabled
      ) {
        return;
      }
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      const slotWidth = Math.max(1, config.cardWidth + config.gap);
      const step = clamp((delta / slotWidth) * config.wheelSensitivity, -4, 4);
      targetRef.current += step;
      velocityRef.current = 0;
      lastInteractionRef.current = performance.now();
      kickRef.current();
    };

    const tick = (now: number): void => {
      const config = configRef.current;
      if (!config) {
        frame = 0;
        return;
      }
      const dt = clamp((now - previous) / 1000, 0, 0.05);
      previous = now;

      const staticPosition =
        config.debugPosition ??
        (config.isCanvas ? config.slotCount / 2 : undefined);

      if (staticPosition !== undefined) {
        positionRef.current = staticPosition;
        targetRef.current = staticPosition;
        velocityRef.current = 0;
        apply(staticPosition);
        frame = 0;
        return;
      }

      const dragging = dragRef.current !== null;
      const pausedForHover = config.pauseOnHover && hoveredRef.current;
      const pausedForInteraction =
        now < lastInteractionRef.current + config.resumeDelay * 1000;
      const autoplayActive =
        config.autoplay &&
        !config.reducedMotion &&
        !pausedForHover &&
        !pausedForInteraction &&
        !dragging;

      if (!dragging) {
        if (autoplayActive) {
          if (!wasAutoplayActive) lastStep = now;
          if (config.autoplayMode === "continuous") {
            const sign = config.autoplayDirection === "left" ? 1 : -1;
            targetRef.current += sign * config.autoplaySpeed * dt;
          } else {
            const interval = config.stepInterval * 1000;
            if (now - lastStep >= interval) {
              const steps = Math.min(
                4,
                Math.floor((now - lastStep) / interval),
              );
              const sign = config.autoplayDirection === "left" ? 1 : -1;
              targetRef.current += sign * steps;
              lastStep += steps * interval;
            }
          }
        } else {
          lastStep = now;
        }
        wasAutoplayActive = autoplayActive;

        if (
          config.snap &&
          !autoplayActive &&
          now - lastInteractionRef.current > 180
        ) {
          targetRef.current = Math.round(targetRef.current);
        }

        if (config.reducedMotion) {
          positionRef.current = targetRef.current;
          velocityRef.current = 0;
        } else {
          const stiffness = config.springStiffness;
          const damping = config.springDamping;
          const acceleration =
            (targetRef.current - positionRef.current) * stiffness -
            velocityRef.current * damping;
          velocityRef.current += acceleration * dt;
          positionRef.current += velocityRef.current * dt;
          if (
            Math.abs(targetRef.current - positionRef.current) < 0.00005 &&
            Math.abs(velocityRef.current) < 0.00005
          ) {
            positionRef.current = targetRef.current;
            velocityRef.current = 0;
          }
        }
      }

      apply(positionRef.current);
      wasAutoplayActive = autoplayActive;

      const moving =
        Math.abs(targetRef.current - positionRef.current) > 0.00005 ||
        Math.abs(velocityRef.current) > 0.00005;
      const snapPending =
        config.snap &&
        Math.abs(targetRef.current - Math.round(targetRef.current)) > 0.0001;
      const autoplayWanted = config.autoplay && !config.reducedMotion;
      const keepRunning = autoplayWanted || dragging || moving || snapPending;

      if (keepRunning) frame = requestAnimationFrame(tick);
      else frame = 0;
    };

    const kick = (): void => {
      if (frame !== 0) return;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };

    kickRef.current = kick;
    root.addEventListener("wheel", onWheel, { passive: false });
    apply(positionRef.current);
    kick();

    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      kickRef.current = () => {};
      root.removeEventListener("wheel", onWheel);
      videoRefs.current.forEach((video) => video?.pause());
    };
  }, []);

  React.useEffect(() => {
    kickRef.current();
  }, [
    slotCount,
    radius,
    pitchDegrees,
    maxRotation,
    visibleArc,
    sideOpacity,
    sideBlur,
    scale,
    cardWidth,
    gap,
    isCanvas,
    reducedMotion,
    debugPosition,
    props.slides,
    props.autoplay,
    props.autoplayMode,
    props.autoplayDirection,
    props.autoplaySpeed,
    props.stepInterval,
    props.resumeDelay,
    props.pauseOnHover,
    props.dragEnabled,
    props.dragSensitivity,
    props.wheelEnabled,
    props.wheelSensitivity,
    props.momentum,
    props.springStiffness,
    props.springDamping,
    props.snap,
    props.videoPlayback,
    props.captionMode,
    props.reveal,
  ]);

  const renderPosition = positionRef.current;
  const captionGradient = props.captionGradient
    ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)"
    : "none";

  const plates = ring.map((slide, slot) => {
    const state = computePlate(slot, renderPosition, plateParams);
    const isCenter = Math.abs(state.distance) <= 0.5;
    const title = slide.title || `Slide ${slot + 1}`;
    const description = slide.description || "";
    const link = resolveLink(slide.link);
    const href = link?.href ?? "";
    const target = link?.target ?? "_blank";
    const imageMeta =
      slide.image && typeof slide.image === "object" ? slide.image : null;
    const imageSource = resolveImageSource(slide.image);
    const posterSource = resolveImageSource(slide.poster);
    const videoSource = resolveImageSource(slide.video);
    const isVideo = slide.type === "video" && Boolean(videoSource);
    const nearCenter = Math.abs(state.distance) <= 6;
    const label =
      title +
      (description ? `, ${description}` : "") +
      (isCenter && href ? ", open" : ", bring to centre");
    const darkenLayer =
      sideDarken > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${sideDarken})`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ) : null;

    return (
      <div
        key={`${slot}-${title}`}
        ref={(node) => {
          plateRefs.current[slot] = node;
        }}
        className="thr3-plate"
        role="button"
        aria-roledescription="slide"
        data-thr3-slot={slot}
        data-center={isCenter ? "true" : "false"}
        data-caption-mode={props.captionMode}
        data-reveal={props.reveal}
        tabIndex={state.interactive ? 0 : -1}
        aria-label={label}
        aria-hidden={state.ariaHidden || undefined}
        onClick={(event) => handlePlateClick(slot, event)}
        onKeyDown={(event) => handlePlateKeyDown(slot, event)}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: cardWidth,
          height: cardHeight,
          borderRadius: radiusCss,
          overflow: "hidden",
          background: props.cardBackground,
          visibility: state.visible ? "visible" : "hidden",
          outline: "none",
          willChange: "transform, opacity",
          boxShadow: shadow,
          cursor: "inherit",
          opacity: state.opacity,
          transform: `translate(-50%, -50%) translate3d(${state.x.toFixed(2)}px, 0px, ${state.z.toFixed(2)}px) rotateY(${state.rotateY.toFixed(3)}deg) scale(1)`,
          zIndex: state.zIndex,
          filter: `blur(${state.blur.toFixed(2)}px)`,
          pointerEvents: state.interactive ? "auto" : "none",
        }}
      >
        {isVideo ? (
          <video
            ref={(node) => {
              videoRefs.current[slot] = node;
            }}
            src={videoSource}
            poster={posterSource || undefined}
            muted
            playsInline
            loop
            preload="metadata"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              opacity: 1,
            }}
          />
        ) : imageSource ? (
          <img
            src={imageSource}
            srcSet={imageMeta?.srcSet}
            sizes={imageMeta?.sizes}
            alt={imageMeta?.alt || title}
            draggable={false}
            decoding="async"
            loading={nearCenter ? "eager" : "lazy"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              opacity: 1,
            }}
          />
        ) : null}
        {darkenLayer}
        {link?.href ? (
          <a
            ref={(node) => {
              linkRefs.current[slot] = node;
            }}
            href={link.href}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            tabIndex={-1}
            aria-label={title}
            onClick={(event) => handleLinkClick(slot, event)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              cursor: "pointer",
              outline: "none",
            }}
          />
        ) : null}
        <div
          data-thr3-caption=""
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${CAPTION_GRADIENT_RATIO * 100}%`,
            display: "flex",
            alignItems: "flex-end",
            padding: captionPadding,
            boxSizing: "border-box",
            background: captionGradient,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <div
            className="thr3-caption-copy"
            style={{
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: titleFont.fontFamily,
                fontStyle: titleFont.fontStyle,
                fontWeight: titleWeight,
                fontVariationSettings: titleFont.fontVariationSettings,
                fontSize: titleSize,
                lineHeight: 1.15,
                color: props.titleColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
            <div
              style={{
                marginTop: Math.max(2, titleSize * 0.18),
                fontFamily: descriptionFont.fontFamily,
                fontStyle: descriptionFont.fontStyle,
                fontWeight: descriptionWeight,
                fontVariationSettings: descriptionFont.fontVariationSettings,
                fontSize: descriptionSize,
                lineHeight: 1.2,
                color: props.descriptionColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={props.ariaLabel || "Card carousel"}
      tabIndex={isCanvas ? -1 : 0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishDrag(event, false)}
      onPointerCancel={(event) => finishDrag(event, true)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClickCapture={handleClickCapture}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background,
        touchAction: "pan-y",
        userSelect: "none",
        cursor: props.dragEnabled && !isCanvas ? "grab" : "default",
        outline: "none",
      }}
    >
      <style>{PLATE_CSS}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: `${perspective}px`,
          perspectiveOrigin: "50% 50%",
        }}
      >
        {plates}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: `${edgeFade}%`,
          background: `linear-gradient(90deg, ${background} 0%, ${background} 10%, transparent 100%)`,
          zIndex: 900,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: `${edgeFade}%`,
          background: `linear-gradient(270deg, ${background} 0%, ${background} 10%, transparent 100%)`,
          zIndex: 900,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* =============================================================================
 * 7. PROPERTY CONTROLS
 * ===========================================================================*/

addPropertyControls(ArcwaveCarousel, {
  slides: {
    type: ControlType.Array,
    title: "Slides",
    defaultValue: [],
    control: {
      type: ControlType.Object,
      controls: {
        type: {
          type: ControlType.Enum,
          title: "Type",
          options: ["image", "video"],
          optionTitles: ["Image", "Video"],
          defaultValue: "image",
        },
        image: {
          type: ControlType.ResponsiveImage,
          title: "Image",
          hidden: (props: SlideControlProps) => props.type === "video",
        },
        video: {
          type: ControlType.File,
          title: "Video",
          allowedFileTypes: ["mp4", "webm"],
          hidden: (props: SlideControlProps) => props.type !== "video",
        },
        poster: {
          type: ControlType.ResponsiveImage,
          title: "Poster",
          hidden: (props: SlideControlProps) => props.type !== "video",
        },
        title: {
          type: ControlType.String,
          title: "Title",
          defaultValue: "Untitled",
        },
        description: {
          type: ControlType.String,
          title: "Description",
          defaultValue: "",
        },
        link: {
          type: ControlType.Link,
          title: "Link",
        },
      },
    },
  },
  cardSizeMode: {
    type: ControlType.Enum,
    title: "Size",
    options: ["fixed", "fillHeight"],
    optionTitles: ["Fixed", "Fill Height"],
    defaultValue: "fixed",
  },
  cardWidth: {
    type: ControlType.Number,
    title: "Card Width",
    defaultValue: BASE_CARD_WIDTH,
    min: 32,
    max: 1200,
    step: 1,
    hidden: (props: ArcwaveCarouselProps) =>
      props.cardSizeMode === "fillHeight",
  },
  cardHeight: {
    type: ControlType.Number,
    title: "Card Height",
    defaultValue: BASE_CARD_HEIGHT,
    min: 32,
    max: 1600,
    step: 1,
    hidden: (props: ArcwaveCarouselProps) =>
      props.cardSizeMode === "fillHeight",
  },
  heightPercent: {
    type: ControlType.Number,
    title: "Height",
    defaultValue: 82,
    min: 10,
    max: 100,
    step: 1,
    unit: "%",
    hidden: (props: ArcwaveCarouselProps) =>
      props.cardSizeMode !== "fillHeight",
  },
  gap: {
    type: ControlType.Number,
    title: "Gap",
    defaultValue: BASE_GAP,
    min: 0,
    max: 80,
    step: 0.1,
  },
  cornerRadius: {
    type: ControlType.Number,
    title: "Radius",
    defaultValue: 0,
    min: 0,
    max: 200,
    step: 1,
  },
  cardBackground: {
    type: ControlType.Color,
    title: "Card",
    defaultValue: DEFAULT_CARD_BACKGROUND,
  },
  cylinderRadius: {
    type: ControlType.Number,
    title: "Radius",
    defaultValue: 0,
    min: 0,
    max: 4000,
    step: 1,
  },
  perspective: {
    type: ControlType.Number,
    title: "Perspective",
    defaultValue: 0,
    min: 0,
    max: 5000,
    step: 1,
  },
  maxRotation: {
    type: ControlType.Number,
    title: "Max Rotate",
    defaultValue: ROTATION_LIMIT,
    min: 0,
    max: 90,
    step: 1,
    unit: "°",
  },
  visibleArc: {
    type: ControlType.Number,
    title: "Visible Arc",
    defaultValue: VISIBLE_ARC,
    min: 10,
    max: 120,
    step: 1,
    unit: "°",
  },
  sideOpacity: {
    type: ControlType.Number,
    title: "Side Opacity",
    defaultValue: SIDE_OPACITY,
    min: 0,
    max: 1,
    step: 0.01,
  },
  sideBlur: {
    type: ControlType.Number,
    title: "Side Blur",
    defaultValue: SIDE_BLUR,
    min: 0,
    max: 20,
    step: 0.1,
  },
  sideDarken: {
    type: ControlType.Number,
    title: "Side Darken",
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.01,
  },
  shadow: {
    type: ControlType.String,
    title: "Shadow",
    defaultValue: "",
  },
  edgeFade: {
    type: ControlType.Number,
    title: "Edge Fade",
    defaultValue: 20,
    min: 0,
    max: 45,
    step: 1,
    unit: "%",
  },
  background: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: DEFAULT_BACKGROUND,
  },
  dragEnabled: {
    type: ControlType.Boolean,
    title: "Drag",
    defaultValue: true,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
  dragSensitivity: {
    type: ControlType.Number,
    title: "Drag Speed",
    defaultValue: 1,
    min: 0.1,
    max: 4,
    step: 0.05,
    hidden: (props: ArcwaveCarouselProps) => props.dragEnabled === false,
  },
  wheelEnabled: {
    type: ControlType.Boolean,
    title: "Wheel",
    defaultValue: true,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
  wheelSensitivity: {
    type: ControlType.Number,
    title: "Wheel Speed",
    defaultValue: 1,
    min: 0.1,
    max: 4,
    step: 0.05,
    hidden: (props: ArcwaveCarouselProps) => props.wheelEnabled === false,
  },
  momentum: {
    type: ControlType.Number,
    title: "Momentum",
    defaultValue: 0.5,
    min: 0,
    max: 1,
    step: 0.01,
  },
  springStiffness: {
    type: ControlType.Number,
    title: "Stiffness",
    defaultValue: 180,
    min: 10,
    max: 600,
    step: 1,
  },
  springDamping: {
    type: ControlType.Number,
    title: "Damping",
    defaultValue: 27,
    min: 2,
    max: 100,
    step: 0.5,
  },
  snap: {
    type: ControlType.Boolean,
    title: "Snap",
    defaultValue: false,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
  autoplay: {
    type: ControlType.Boolean,
    title: "Autoplay",
    defaultValue: true,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
  autoplayMode: {
    type: ControlType.Enum,
    title: "Mode",
    options: ["continuous", "step"],
    optionTitles: ["Continuous", "Step"],
    defaultValue: "continuous",
    hidden: (props: ArcwaveCarouselProps) => props.autoplay === false,
  },
  autoplayDirection: {
    type: ControlType.Enum,
    title: "Direction",
    options: ["left", "right"],
    optionTitles: ["Left", "Right"],
    defaultValue: "left",
    hidden: (props: ArcwaveCarouselProps) => props.autoplay === false,
  },
  autoplaySpeed: {
    type: ControlType.Number,
    title: "Speed",
    defaultValue: 1,
    min: 0.1,
    max: 6,
    step: 0.1,
    hidden: (props: ArcwaveCarouselProps) =>
      props.autoplay === false || props.autoplayMode === "step",
  },
  stepInterval: {
    type: ControlType.Number,
    title: "Step Every",
    defaultValue: 3,
    min: 0.5,
    max: 20,
    step: 0.1,
    unit: "s",
    hidden: (props: ArcwaveCarouselProps) =>
      props.autoplay === false || props.autoplayMode !== "step",
  },
  resumeDelay: {
    type: ControlType.Number,
    title: "Resume After",
    defaultValue: 1,
    min: 0,
    max: 10,
    step: 0.1,
    unit: "s",
    hidden: (props: ArcwaveCarouselProps) => props.autoplay === false,
  },
  pauseOnHover: {
    type: ControlType.Boolean,
    title: "Pause On Hover",
    defaultValue: false,
    enabledTitle: "On",
    disabledTitle: "Off",
    hidden: (props: ArcwaveCarouselProps) => props.autoplay === false,
  },
  captionMode: {
    type: ControlType.Enum,
    title: "Captions",
    options: ["hover", "always", "center"],
    optionTitles: ["Hover", "Always", "Center"],
    defaultValue: "hover",
  },
  titleFont: {
    type: ControlType.Font,
    title: "Title Font",
    defaultFont: "Inter",
    controls: "extended",
  },
  descriptionFont: {
    type: ControlType.Font,
    title: "Body Font",
    defaultFont: "Inter",
    controls: "extended",
  },
  titleColor: {
    type: ControlType.Color,
    title: "Title Color",
    defaultValue: "#FFFFFF",
  },
  descriptionColor: {
    type: ControlType.Color,
    title: "Body Color",
    defaultValue: "rgba(255,255,255,0.55)",
  },
  captionPadding: {
    type: ControlType.Number,
    title: "Caption Pad",
    defaultValue: CAPTION_PADDING_RATIO,
    min: 0,
    max: 0.2,
    step: 0.005,
  },
  captionGradient: {
    type: ControlType.Boolean,
    title: "Gradient",
    defaultValue: true,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
  reveal: {
    type: ControlType.Enum,
    title: "Reveal",
    options: ["fade", "slide", "none"],
    optionTitles: ["Fade", "Slide", "None"],
    defaultValue: "slide",
  },
  videoPlayback: {
    type: ControlType.Enum,
    title: "Video",
    options: ["visible", "centre", "always"],
    optionTitles: ["Visible", "Centre", "Always"],
    defaultValue: "visible",
  },
  ariaLabel: {
    type: ControlType.String,
    title: "Aria Label",
    defaultValue: "Card carousel",
  },
});
