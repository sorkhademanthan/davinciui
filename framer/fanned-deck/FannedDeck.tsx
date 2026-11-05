/**
 * FannedDeck
 * -----------------------------------------------------------------------------
 * Pixel-accurate replica of the "Arc Deck Pro" Framer component: a 3D fan of
 * up to 14 portrait cards on a light stage. Each card is bent like a curved
 * sheet (14 vertical slices, each rotated in 3D), the deck overlaps 40%,
 * tilts outward along an arc, and bobs gently. Hovering (or focusing) a card
 * lifts it to the front, straightens and partially uncurls it, spreads its
 * neighbours, dims the rest, and pops a coloured username bubble above it.
 * On load / viewport re-entry the cards deal out from a stacked pile.
 *
 * Every number below was extracted from the live reference DOM
 * (arcdeckpro.framer.website) with the console snippet from the brief:
 *   - overlap step 0.6x--s, arc Y = 0.31 * (k/3)^2
 *   - tilt = -3.5 + k * 4.3333 deg (the live fan is asymmetric; the spec's
 *     5.5 deg/card was superseded by measurement)
 *   - per-card scale = 0.84 + 0.16 * (k/3)^2, hover lift token
 *     --hop = 0.18 + 0.05*|k| (x--s)
 *   - bob: duration cycles [5.4, 6.3, 7.2]s by i%3, delay -0.85s*i, 5px
 *   - slices: rotateY = (6.5-j) * 3.1429deg, Z = 0.0819 * ((6.5-j)/6.5)^2,
 *     X antisymmetric (baked table; the brief's formula did not match)
 *   - hover: neighbour spread 0.16 * 0.62^(dist-1), tilt * 0.4, scale * 1.06,
 *     uncurl x0.45 (x0.2026 for slice X), dim others 0.12, lift 18px
 *   - bubble Y offsets are hand-placed per card on the live site; both idle
 *     and hover tables are copied verbatim (cycled for decks > 7)
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 675
 */

import * as React from "react";
import { addPropertyControls, ControlType } from "framer";

/* =============================================================================
 * 1. TYPES
 * ===========================================================================*/

export type FannedDeckEntrance = "deal" | "flip" | "rise" | "sweep";

export interface FannedDeckItem {
  image?: unknown;
  video?: unknown;
  type?: "image" | "video";
  alt?: string;
  label?: string;
  color?: string;
  link?: unknown;
  newTab?: boolean;
  pinned?: boolean;
}

export interface FannedDeckProps {
  items?: FannedDeckItem[];
  background?: string;
  overlap?: number;
  arc?: number;
  tilt?: number;
  curve?: number;
  sag?: number;
  depth?: number;
  cardRadius?: number;
  shadow?: boolean;
  outline?: boolean;
  hoverLift?: number;
  hoverScale?: number;
  hoverSpread?: number;
  hoverStraighten?: boolean;
  hoverUncurl?: boolean;
  edgeScale?: number;
  bubbleScale?: number;
  dimOthers?: number;
  entrance?: FannedDeckEntrance;
  bob?: boolean;
  stackingOrder?: "right-on-top" | "left-on-top";
}

interface ResolvedCard {
  src: string | null;
  videoSrc: string | null;
  isVideo: boolean;
  alt: string;
  label: string;
  color: string;
  link: string | null;
  newTab: boolean;
  pinned: boolean;
  gradient: string;
}

/* =============================================================================
 * 2. MEASURED CONSTANTS
 * ===========================================================================*/

/** Antisymmetric slice X offsets (x--s), verbatim from the live DOM. */
const SLICE_X = [
  0.00977, 0.00593, 0.00325, 0.00153, 0.00056, 0.00012, 0, -0, -0.00012,
  -0.00056, -0.00153, -0.00325, -0.00593, -0.00977,
];

const SLICE_COUNT = 14;
const SLICE_STEP_DEG = 3.1429;
const SLICE_SAG = 0.0819;

/** Hover uncurl factors (measured on the live slices). */
const HOVER_FACTOR = { x: 0.2026, z: 0.4538, ry: 0.45 };

/** Per-card bubble Y offsets (x--s): [idle, hovered], hand-placed live. */
const BUBBLE_Y: Array<[number, number]> = [
  [-0.0852, -0.0672],
  [-0.0123, -0.0071],
  [0.0375, 0.0314],
  [0.0662, 0.0494],
  [0.0688, 0.0447],
  [0.0207, 0.007],
  [-0.0495, -0.0517],
];

/** Placeholder gradients shown while each card's media loads (live values). */
const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(140deg,#ff5a3c,#ffb347)",
  "linear-gradient(140deg,#3e5bff,#9fb4ff)",
  "linear-gradient(140deg,#ffd23f,#ff9f1c)",
  "linear-gradient(140deg,#ff9a8b,#ffe0d3)",
  "linear-gradient(140deg,#d7263d,#ff7a59)",
  "linear-gradient(140deg,#1b998b,#7ae7c7)",
  "linear-gradient(140deg,#2d6a4f,#95d5b2)",
];

const IDLE_SHADOW = "rgba(0, 0, 0, 0.26) 0px 14px 28px -9.8px";
const HOVER_SHADOW = "rgba(0, 0, 0, 0.353) 0px 28px 50.4px -11.2px";

const EASE_FAN = "cubic-bezier(0.25, 1.45, 0.45, 1)";
const EASE_SLICE = "cubic-bezier(0.3, 1.35, 0.5, 1)";
const EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const ITEM_TRANSITION = `transform 560ms ${EASE_FAN}, opacity 300ms, z-index linear 280ms`;
const ARC_TRANSITION = `transform 560ms ${EASE_FAN}`;
const PERSP_TRANSITION = `transform 560ms ${EASE_FAN}`;
const THREED_TRANSITION = "transform 400ms";
const FACE_TRANSITION = "transform 260ms ease-out";
const SHADOW_TRANSITION = `box-shadow 420ms, transform 620ms ${EASE_SLICE}`;
const SLICE_TRANSITION = `transform 620ms ${EASE_SLICE}, opacity 500ms`;
const POP_TRANSITION = `transform 480ms ${EASE_POP}, opacity 220ms`;
const DIM_TRANSITION = "opacity 360ms ease";
/** Append a per-card stagger delay to every segment of a transition shorthand. */
const withDelay = (transition: string, delayMs: number | null): string => {
  if (!delayMs) return transition;
  return transition
    .split(", ")
    .map((part) => `${part} ${delayMs}ms`)
    .join(", ");
};

const BOB_DURATION_CYCLE = [5.4, 6.3, 7.2];
const BOB_DELAY_STEP = -0.85;
const ENTRANCE_STAGGER_MS = 70;

const GLOBAL_STYLE = `
@keyframes fanned-deck-bob {
  0%, 100% { transform: translate3d(0px, 0px, 0px); }
  50% { transform: translate3d(0, calc(var(--bob) * -1), 0); }
}
@keyframes fanned-deck-hop {
  0% { transform: translate3d(0px, 0px, 0px); animation-timing-function: cubic-bezier(0.2, 0.7, 0.35, 1); }
  40% { transform: translate3d(0, calc(var(--hop) * -1), 0); animation-timing-function: cubic-bezier(0.55, 0, 0.7, 0.45); }
  78% { transform: translate3d(0, calc(var(--hop) * 0.06), 0); animation-timing-function: cubic-bezier(0.3, 0, 0.4, 1); }
  100% { transform: translate3d(0px, 0px, 0px); }
}
@media (prefers-reduced-motion: reduce) {
  .fanned-deck-bob-layer { animation: none !important; }
}
`;

/* =============================================================================
 * 3. HELPERS
 * ===========================================================================*/

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const numberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Best-effort URL out of a String, ResponsiveImage, File or Link value. */
const resolveUrl = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of ["src", "url", "href"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  const srcSet = record["srcSet"];
  if (typeof srcSet === "string" && srcSet.trim()) {
    const first = srcSet.split(",")[0]?.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return "";
};

const resolveCards = (items: FannedDeckItem[] | undefined): ResolvedCard[] => {
  const resolveOne = (item: FannedDeckItem, index: number): ResolvedCard => {
    const type = item.type === "video" ? "video" : "image";
    const imageSrc = resolveUrl(item.image);
    const videoSrc = resolveUrl(item.video);
    const isVideo =
      type === "video" && videoSrc !== "" ? true : type === "video";
    return {
      src: type === "video" ? null : imageSrc || null,
      videoSrc: isVideo ? videoSrc : null,
      isVideo,
      alt: typeof item.alt === "string" ? item.alt : "",
      label:
        typeof item.label === "string" && item.label.trim()
          ? item.label.trim()
          : "",
      color:
        typeof item.color === "string" && item.color.trim()
          ? item.color.trim()
          : "#2f6bff",
      link: resolveUrl(item.link) || null,
      newTab: item.newTab !== false,
      pinned: item.pinned === true,
      gradient: PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]!,
    };
  };
  if (!items || items.length === 0) {
    return Array.from({ length: 7 }, (_, index) => resolveOne({}, index));
  }
  return items.slice(0, 14).map(resolveOne);
};

const itemsKey = (items: FannedDeckItem[] | undefined): string =>
  (items ?? [])
    .map(
      (item) =>
        `${item.type ?? "image"}:${resolveUrl(item.image)}:${resolveUrl(
          item.video,
        )}:${resolveUrl(item.link)}:${item.label ?? ""}:${item.color ?? ""}:${
          item.newTab !== false ? 1 : 0
        }:${item.pinned === true ? 1 : 0}`,
    )
    .join("|");

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

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
 * 4. COMPONENT
 * ===========================================================================*/

const FannedDeck: React.FC<FannedDeckProps> = (rawProps) => {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const propsRef = React.useRef(props);
  React.useEffect(() => {
    propsRef.current = props;
  });

  const reducedMotion = usePrefersReducedMotion();
  const reduceMotionRef = React.useRef(reducedMotion);
  React.useEffect(() => {
    reduceMotionRef.current = reducedMotion;
  });

  const key = React.useMemo(() => itemsKey(props.items), [props.items]);
  // Keyed on the resolved source string rather than the array identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cards = React.useMemo(() => resolveCards(props.items), [key]);
  const cardsRef = React.useRef(cards);
  React.useEffect(() => {
    cardsRef.current = cards;
  });
  const n = cards.length;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const faceRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  // "pile" = stacked start state, "fan" = laid-out state. Entrance replays
  // whenever the deck re-enters the viewport.
  const [phase, setPhase] = React.useState<"pile" | "fan">("pile");
  const [active, setActive] = React.useState<number | null>(null);
  const enteringRef = React.useRef(false);
  const entranceTimerRef = React.useRef<number | null>(null);
  const imagesDecodedRef = React.useRef(false);

  const clearEntranceTimer = (): void => {
    if (entranceTimerRef.current !== null) {
      window.clearTimeout(entranceTimerRef.current);
      entranceTimerRef.current = null;
    }
  };

  const playEntrance = React.useCallback((): void => {
    if (reduceMotionRef.current) {
      setPhase("fan");
      return;
    }
    clearEntranceTimer();
    enteringRef.current = true;
    setPhase("pile");
    // Double rAF so the pile state is committed before the transition starts.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setPhase("fan");
        entranceTimerRef.current = window.setTimeout(() => {
          enteringRef.current = false;
        }, 560 + ENTRANCE_STAGGER_MS * 14 + 120);
      });
    });
  }, []);

  // Preload media; the entrance waits for decode (or 2.5s, whichever first).
  React.useEffect(() => {
    let cancelled = false;
    imagesDecodedRef.current = false;
    const sources = cardsRef.current
      .map((card) => card.src)
      .filter((src): src is string => Boolean(src));
    const decoded = sources.length
      ? Promise.all(
          sources.map(
            (src) =>
              new Promise<void>((resolve) => {
                const image = new Image();
                image.onload = () => {
                  void image.decode?.().catch(() => {});
                  resolve();
                };
                image.onerror = () => resolve();
                image.src = src;
              }),
          ),
        )
      : Promise.resolve();
    const timeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 2500);
    });
    void Promise.race([decoded, timeout]).then(() => {
      if (!cancelled) imagesDecodedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // Play the entrance on mount and replay on viewport re-entry.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let inView = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        if (visible && !inView) {
          inView = true;
          if (imagesDecodedRef.current || reduceMotionRef.current) {
            playEntrance();
          } else {
            const wait = window.setInterval(() => {
              if (imagesDecodedRef.current) {
                window.clearInterval(wait);
                playEntrance();
              }
            }, 120);
            clearEntranceTimer();
            entranceTimerRef.current = window.setTimeout(() => {
              window.clearInterval(wait);
              playEntrance();
            }, 2600);
          }
        } else if (!visible && inView) {
          inView = false;
          clearEntranceTimer();
          if (!reduceMotionRef.current) setPhase("pile");
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      clearEntranceTimer();
    };
  }, [playEntrance]);

  /* ------------------------------------------------------------------
   * Pointer tilt on the face layer: rotateX/rotateY from the pointer
   * position (max 4.5deg), written directly to the element; resets on
   * leave. CSS transitions (260ms ease-out) smooth the updates.
   * ---------------------------------------------------------------- */
  const handleFacePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    const face = event.currentTarget;
    const rect = face.getBoundingClientRect();
    const gx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const gy = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    face.style.setProperty("--gx", `${(gx * 100).toFixed(1)}%`);
    face.style.setProperty("--gy", `${(gy * 100).toFixed(1)}%`);
    face.style.transform = `rotateX(${((0.5 - gy) * 9).toFixed(2)}deg) rotateY(${((gx - 0.5) * 9).toFixed(2)}deg)`;
  };

  const handleFacePointerLeave = (
    event: React.PointerEvent<HTMLDivElement>,
  ): void => {
    const face = event.currentTarget;
    face.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    index: number,
  ): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    // Anchors navigate natively; non-linked cards activate on Enter/Space.
    if (!cardsRef.current[index]?.link) {
      event.preventDefault();
      setActive(index);
    }
  };

  /* ------------------------------------------------------------------
   * Per-card layout (all values x--s unless noted)
   * ---------------------------------------------------------------- */
  const overlap = clamp(numberOr(props.overlap, 0.6), 0.2, 1.2);
  const arc = clamp(numberOr(props.arc, 0.31), 0, 1);
  const tiltStep = clamp(numberOr(props.tilt, 4.3333), 0, 10);
  const curve = clamp(numberOr(props.curve, SLICE_STEP_DEG), 0, 8);
  const sag = clamp(numberOr(props.sag, SLICE_SAG), 0, 0.3);
  const depth = clamp(numberOr(props.depth, 2.8), 1, 6);
  const radius = clamp(numberOr(props.cardRadius, 22), 0, 60);
  const hoverLift = clamp(numberOr(props.hoverLift, 18), 0, 60);
  const hoverScale = clamp(numberOr(props.hoverScale, 1.06), 1, 1.3);
  const hoverSpread = clamp(numberOr(props.hoverSpread, 0.16), 0, 0.5);
  const dimOthers = clamp(numberOr(props.dimOthers, 0.12), 0, 0.5);
  const maxK = Math.max((n - 1) / 2, 1);
  const flip = 0.62; // neighbour spread decay per card of distance (measured)

  const entering = phase === "pile" || enteringRef.current;
  const sliceTransform = (j: number, uncurled: boolean): string => {
    const f = uncurled && props.hoverUncurl !== false ? HOVER_FACTOR : null;
    const u = Math.abs(6.5 - j) / 6.5;
    const x = SLICE_X[j]! * (f ? f.x : 1);
    const z = sag * u * u * (f ? f.z : 1);
    const ry = (6.5 - j) * curve * (f ? f.ry : 1);
    return `translate3d(calc(var(--s) * ${x.toFixed(5)}), 0, calc(var(--s) * ${z.toFixed(5)})) rotateY(${ry.toFixed(3)}deg)`;
  };

  return (
    <div
      ref={rootRef}
      role="list"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        containerType: "size",
        overflow: "visible",
        background: props.background ?? "#efefef",
        ["--s" as string]: "min(17.609cqw, 54.902cqh)",
      }}
    >
      <style>{GLOBAL_STYLE}</style>
      {cards.map((card, i) => {
        const half = (n - 1) / 2;
        const k = n > 1 ? i - half : 0;
        const hovered = active === i;
        const dimmed = active !== null && !hovered;

        const spread =
          active !== null && !hovered && n > 1
            ? Math.sign(i - active) *
              hoverSpread *
              Math.pow(flip, Math.abs(i - active) - 1)
            : 0;
        const x = k * overlap + spread;
        const arcY = n > 1 ? arc * (k / maxK) ** 2 : 0;
        const lift = hovered ? hoverLift : 0;
        const hop = 0.18 + 0.05 * Math.abs(k);
        const tilt = n > 1 ? -3.5 + k * tiltStep : 0;
        const edgeScale = clamp(
          numberOr(propsRef.current.edgeScale, 1),
          0.84,
          1.3,
        );
        const scale =
          n > 1
            ? 0.84 + (edgeScale - 0.84) * (Math.abs(k) / maxK) ** 2
            : 1;
        const z =
          props.stackingOrder === "left-on-top" ? n - i : i + 1;
        const perspTilt =
          hovered && props.hoverStraighten !== false ? tilt * 0.4 : tilt;
        const perspScale = hovered ? scale * hoverScale : scale;

        const bobDuration =
          BOB_DURATION_CYCLE[i % BOB_DURATION_CYCLE.length];
        const bobDelay = BOB_DELAY_STEP * i;
        const bubbleY = BUBBLE_Y[i % BUBBLE_Y.length]![hovered ? 1 : 0];
        const bubbleTail = hovered ? "0px" : "12px";
        const bubbleVisible = hovered || card.pinned;
        const bubbleScale = clamp(
          numberOr(propsRef.current.bubbleScale, 1),
          0.5,
          1.5,
        );

        // Entrance variants: values held while phase === "pile"; the layer
        // transitions (560ms overshoot + stagger) animate to the idle fan.
        const isPile = phase === "pile" && !reduceMotionRef.current;
        const entrance = props.entrance ?? "deal";
        const pileX =
          entrance === "sweep" ? x - 3 : entrance === "deal" ? 0 : x;
        const pileArcY =
          entrance === "deal"
            ? 0.7
            : entrance === "rise"
              ? arcY + 0.45
              : arcY;
        const pileOpacity =
          entrance === "rise" || entrance === "sweep" ? 0 : 1;
        const pileTilt =
          entrance === "deal" ? ((i % 5) - 2) * 1.6 : perspTilt;
        const pileScale = entrance === "deal" ? 0.6 : perspScale;

        const media =
          card.isVideo && card.videoSrc ? (
            <video
              src={card.videoSrc}
              muted
              loop
              playsInline
              autoPlay
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                userSelect: "none",
              }}
            />
          ) : card.src ? (
            <img
              src={card.src}
              alt={card.alt}
              draggable={false}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                userSelect: "none",
              }}
            />
          ) : null;

        const interactiveProps = {
          tabIndex: 0,
          "aria-label": card.label || card.alt || `Card ${i + 1}`,
          onPointerEnter: (event: React.PointerEvent) => {
            // Mouse hover activates; touch activation happens on tap so the
            // first tap never navigates.
            if (event.pointerType === "mouse") setActive(i);
          },
          onPointerLeave: (event: React.PointerEvent) => {
            if (event.pointerType === "mouse")
              setActive((current) => (current === i ? null : current));
          },
          onFocus: () => setActive(i),
          onBlur: () => setActive((current) => (current === i ? null : current)),
          onClick: (event: React.MouseEvent) => {
            if (!card.link) return;
            // Touch: first tap activates, second tap follows the link.
            if (active !== i) {
              event.preventDefault();
              setActive(i);
            }
          },
          onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, i),
          style: {
            position: "absolute",
            inset: 0,
            display: "block",
            cursor: card.link ? "pointer" : "default",
            outline: props.outline ? undefined : "none",
            WebkitTapHighlightColor: "transparent",
            textDecoration: "none",
            transformStyle: "preserve-3d",
          } as React.CSSProperties,
        };

        return (
          <div
            key={`${i}-${key.slice(0, 40) || i}`}
            role="listitem"
            style={{
              position: "absolute",
              left: "50%",
              top: "46%",
              width: "var(--s)",
              height: "calc(var(--s) * 1.02)",
              marginLeft: "calc(var(--s) * -0.5)",
              marginTop: "calc(var(--s) * -0.51)",
              zIndex: hovered ? 999 : z,
              opacity: isPile ? pileOpacity : 1,
              transform: `translate3d(calc(var(--s) * ${(isPile ? pileX : x).toFixed(4)}), 0, 0)`,
              transition: withDelay(
                ITEM_TRANSITION,
                entering ? i * ENTRANCE_STAGGER_MS : null,
              ),
            }}
          >
            {/* Arc offset + hover lift (live: "- 18px" while hovered) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate3d(0, calc(var(--s) * ${(isPile ? pileArcY : arcY).toFixed(4)} - ${lift}px), 0)`,
                transition: withDelay(
                  ARC_TRANSITION,
                  entering ? i * ENTRANCE_STAGGER_MS : null,
                ),
              }}
            >
              <div style={{ position: "absolute", inset: 0, ["--hop" as string]: `calc(var(--s) * ${hop.toFixed(3)})` }}>
                {/* Bob */}
                <div
                  className={props.bob === false || reduceMotionRef.current ? undefined : "fanned-deck-bob-layer"}
                  style={{
                    position: "absolute",
                    inset: 0,
                    ["--bob" as string]: "5px",
                    animation:
                      props.bob === false || reduceMotionRef.current
                        ? undefined
                        : `${bobDuration}s ease-in-out ${bobDelay}s infinite normal none running fanned-deck-bob`,
                  }}
                >
                  {/* Perspective + tilt/scale */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      perspective: `calc(var(--s) * ${depth.toFixed(2)})`,
                      transform: `rotate(${(isPile ? pileTilt : perspTilt).toFixed(3)}deg) scale(${(isPile ? pileScale : perspScale).toFixed(4)})`,
                      transformOrigin: "50% 50%",
                      transition: withDelay(
                        PERSP_TRANSITION,
                        entering ? i * ENTRANCE_STAGGER_MS : null,
                      ),
                    }}
                  >
                    {/* 3D container (Flip entrance rotates this) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transformStyle: "preserve-3d",
                        transform: `rotateY(${phase === "pile" && props.entrance === "flip" && !reduceMotionRef.current ? 180 : 0}deg)`,
                        transition: withDelay(
                          THREED_TRANSITION,
                          entering ? i * ENTRANCE_STAGGER_MS : null,
                        ),
                      }}
                    >
                      {card.link ? (
                        <a
                          {...interactiveProps}
                          href={card.link}
                          target={card.newTab ? "_blank" : undefined}
                          rel={card.newTab ? "noopener noreferrer" : undefined}
                        >
                          <Face
                            index={i}
                            radius={radius}
                            card={card}
                            media={media}
                            dimmed={dimmed}
                            hovered={hovered}
                            dimOthers={dimOthers}
                            shadow={props.shadow !== false}
                            uncurled={hovered && props.hoverUncurl !== false}
                            sliceTransform={sliceTransform}
                            faceRef={(node) => {
                              faceRefs.current[i] = node;
                            }}
                            onPointerMove={handleFacePointerMove}
                            onPointerLeave={handleFacePointerLeave}
                          />
                        </a>
                      ) : (
                        <div {...interactiveProps}>
                          <Face
                            index={i}
                            radius={radius}
                            card={card}
                            media={media}
                            dimmed={dimmed}
                            hovered={hovered}
                            dimOthers={dimOthers}
                            shadow={props.shadow !== false}
                            uncurled={hovered && props.hoverUncurl !== false}
                            sliceTransform={sliceTransform}
                            faceRef={(node) => {
                              faceRefs.current[i] = node;
                            }}
                            onPointerMove={handleFacePointerMove}
                            onPointerLeave={handleFacePointerLeave}
                          />
                        </div>
                      )}
                      {/* Back face (Flip entrance) */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: `${radius}px`,
                          backgroundColor: "rgb(22, 22, 22)",
                          backgroundImage:
                            "radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1.4px)",
                          backgroundSize: "12px 12px",
                          transform: "rotateY(180deg) translateZ(1px)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          pointerEvents: "none",
                        }}
                      />
                    </div>
                  </div>
                  {/* Bubble */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 12px)",
                      left: "6%",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        transformOrigin: "20px 100%",
                        transform: `translate(0, calc(var(--s) * ${bubbleY.toFixed(4)} + ${bubbleTail})) scale(${(bubbleVisible ? bubbleScale : bubbleScale * 0.5).toFixed(3)})`,
                        opacity: bubbleVisible ? 1 : 0,
                        transition: POP_TRANSITION,
                        filter: "drop-shadow(rgba(0, 0, 0, 0.18) 0px 8px 14px)",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          background: card.color,
                          color: "rgb(255, 255, 255)",
                          padding: "10px 16px",
                          borderRadius: 16,
                          whiteSpace: "nowrap",
                          fontFamily:
                            '"Inter", "Inter Placeholder", sans-serif',
                          fontSize: 17,
                          fontStyle: "normal",
                          fontWeight: 400,
                          letterSpacing: "-0.01em",
                          lineHeight: "1em",
                        }}
                      >
                        {card.label || `@card${i + 1}`}
                        <svg
                          width={14}
                          height={10}
                          viewBox="0 0 14 10"
                          style={{
                            position: "absolute",
                            top: "100%",
                            marginTop: -1,
                            left: 14,
                            display: "block",
                          }}
                        >
                          <path
                            d="M0 0H14L5.2 8.9C4.3 9.8 3 9.2 3 7.9V0Z"
                            fill={card.color}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* =============================================================================
 * 5. FACE (shadow + 14 curved slices)
 * ===========================================================================*/

interface FaceProps {
  index: number;
  radius: number;
  card: ResolvedCard;
  media: React.ReactNode;
  dimmed: boolean;
  hovered: boolean;
  dimOthers: number;
  shadow: boolean;
  uncurled: boolean;
  sliceTransform: (j: number, uncurled: boolean) => string;
  faceRef: (node: HTMLDivElement | null) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => void;
}

function Face({
  radius,
  card,
  media,
  dimmed,
  hovered,
  dimOthers,
  shadow,
  uncurled,
  sliceTransform,
  faceRef,
  onPointerMove,
  onPointerLeave,
}: FaceProps): React.ReactElement {
  // The face transform is written imperatively (pointer tilt); keep it out of
  // the React style object so re-renders never fight the direct writes.
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const node = innerRef.current;
    if (node) node.style.transform = "rotateX(0deg) rotateY(0deg)";
  }, []);
  const setRef = (node: HTMLDivElement | null): void => {
    innerRef.current = node;
    faceRef(node);
  };
  return (
    <div
      ref={setRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        position: "absolute",
        inset: 0,
        transformStyle: "preserve-3d",
        transition: FACE_TRANSITION,
        ["--gx" as string]: "50%",
        ["--gy" as string]: "50%",
      }}
    >
      {/* Drop shadow (deepens on hover) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "3% 4%",
          borderRadius: `${radius}px`,
          boxShadow: shadow ? (hovered ? HOVER_SHADOW : IDLE_SHADOW) : "none",
          transform: "translateZ(calc(var(--s) * 0 - 2px))",
          transition: SHADOW_TRANSITION,
        }}
      />
      {/* 14 curved slices */}
      {Array.from({ length: SLICE_COUNT }, (_, j) => (
        <div
          key={j}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(j * (100 / SLICE_COUNT)).toFixed(5)}%`,
            width: `calc(${(100 / SLICE_COUNT).toFixed(5)}% + 0.8px)`,
            overflow: "hidden",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: sliceTransform(j, uncurled),
            transition: SLICE_TRANSITION,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `calc(var(--s) * ${(-(j / SLICE_COUNT)).toFixed(5)})`,
              width: "var(--s)",
              borderRadius: `${radius}px`,
              overflow: "hidden",
              background: card.gradient,
            }}
          >
            {media}
            {/* Dim overlay (others dim while a card is hovered) */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "#000",
                opacity: hovered ? 0 : dimmed ? dimOthers : 0,
                transition: DIM_TRANSITION,
              }}
            />
            {/* Contrast overlay (constant on the live site) */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "rgb(0, 0, 0)",
                opacity: 0.19,
                transition: SLICE_TRANSITION,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =============================================================================
 * 6. DEFAULTS, PROPERTY CONTROLS, EXPORT
 * ===========================================================================*/

const DEFAULT_PROPS = {
  items: [] as FannedDeckItem[],
  background: "#efefef",
  overlap: 0.6,
  arc: 0.31,
  tilt: 4.3333,
  curve: SLICE_STEP_DEG,
  sag: SLICE_SAG,
  depth: 2.8,
  cardRadius: 22,
  shadow: true,
  outline: false,
  hoverLift: 18,
  hoverScale: 1.06,
  hoverSpread: 0.16,
  hoverStraighten: true,
  hoverUncurl: true,
  dimOthers: 0.12,
  entrance: "deal" as FannedDeckEntrance,
  bob: true,
  stackingOrder: "right-on-top" as const,
};

// @types/react 19 dropped defaultProps from FunctionComponent, and React 19
// ignores it at runtime (props merge DEFAULT_PROPS manually, so behaviour is
// unchanged). Set it anyway for older runtimes that still read it.
const FannedDeckWithDefaults =
  FannedDeck as React.FC<FannedDeckProps> & {
    defaultProps?: Partial<FannedDeckProps>;
  };
FannedDeckWithDefaults.defaultProps = DEFAULT_PROPS;

addPropertyControls(FannedDeck, {
  items: {
    type: ControlType.Array,
    title: "Items",
    defaultValue: [],
    control: {
      type: ControlType.Object,
      controls: {
        image: {
          type: ControlType.ResponsiveImage,
          title: "Image",
          hidden: (item: { type?: string }) => item.type === "video",
        },
        video: {
          type: ControlType.File,
          title: "Video",
          allowedFileTypes: ["mp4", "webm", "mov"],
          hidden: (item: { type?: string }) => item.type !== "video",
        },
        type: {
          type: ControlType.Enum,
          title: "Type",
          options: ["image", "video"],
          optionTitles: ["Image", "Video"],
          displaySegmentedControl: true,
          defaultValue: "image",
        },
        alt: {
          type: ControlType.String,
          title: "Alt",
        },
        label: {
          type: ControlType.String,
          title: "Label",
          placeholder: "@username",
        },
        color: {
          type: ControlType.Color,
          title: "Bubble",
          defaultValue: "#2f6bff",
        },
        link: {
          type: ControlType.Link,
          title: "Link",
        },
        newTab: {
          type: ControlType.Boolean,
          title: "New Tab",
          defaultValue: true,
          hidden: (item: { link?: unknown }) => !item.link,
        },
        pinned: {
          type: ControlType.Boolean,
          title: "Pinned",
          defaultValue: false,
        },
      },
    },
  },
  background: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "#efefef",
  },
  overlap: {
    type: ControlType.Number,
    title: "Overlap",
    min: 0.2,
    max: 1.2,
    step: 0.05,
    defaultValue: 0.6,
  },
  arc: {
    type: ControlType.Number,
    title: "Arc",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.31,
  },
  tilt: {
    type: ControlType.Number,
    title: "Tilt / card",
    min: 0,
    max: 10,
    step: 0.05,
    unit: "°",
    defaultValue: 4.3333,
  },
  curve: {
    type: ControlType.Number,
    title: "Curve",
    min: 0,
    max: 8,
    step: 0.01,
    unit: "°/slice",
    defaultValue: SLICE_STEP_DEG,
  },
  sag: {
    type: ControlType.Number,
    title: "Sag",
    min: 0,
    max: 0.3,
    step: 0.001,
    defaultValue: SLICE_SAG,
  },
  depth: {
    type: ControlType.Number,
    title: "Depth",
    min: 1,
    max: 6,
    step: 0.1,
    unit: "×s",
    defaultValue: 2.8,
  },
  cardRadius: {
    type: ControlType.Number,
    title: "Card Radius",
    min: 0,
    max: 60,
    step: 1,
    unit: "px",
    defaultValue: 22,
  },
  shadow: {
    type: ControlType.Boolean,
    title: "Shadow",
    defaultValue: true,
  },
  outline: {
    type: ControlType.Boolean,
    title: "Focus Ring",
    defaultValue: false,
  },
  hoverLift: {
    type: ControlType.Number,
    title: "Hover Lift",
    min: 0,
    max: 60,
    step: 1,
    unit: "px",
    defaultValue: 18,
  },
  hoverScale: {
    type: ControlType.Number,
    title: "Hover Scale",
    min: 1,
    max: 1.3,
    step: 0.01,
    defaultValue: 1.06,
  },
  hoverSpread: {
    type: ControlType.Number,
    title: "Hover Spread",
    min: 0,
    max: 0.5,
    step: 0.01,
    defaultValue: 0.16,
  },
  hoverStraighten: {
    type: ControlType.Boolean,
    title: "Straighten",
    defaultValue: true,
  },
  hoverUncurl: {
    type: ControlType.Boolean,
    title: "Uncurl",
    defaultValue: true,
  },
  edgeScale: {
    type: ControlType.Number,
    title: "Edge Scale",
    min: 0.84,
    max: 1.3,
    step: 0.01,
    defaultValue: 1,
  },
  bubbleScale: {
    type: ControlType.Number,
    title: "Bubble Scale",
    min: 0.5,
    max: 1.5,
    step: 0.05,
    defaultValue: 1,
  },
  dimOthers: {
    type: ControlType.Number,
    title: "Dim Others",
    min: 0,
    max: 0.5,
    step: 0.01,
    defaultValue: 0.12,
  },
  entrance: {
    type: ControlType.Enum,
    title: "Entrance",
    options: ["deal", "flip", "rise", "sweep"],
    optionTitles: ["Deal", "Flip", "Rise", "Sweep"],
    defaultValue: "deal",
  },
  bob: {
    type: ControlType.Boolean,
    title: "Bob",
    defaultValue: true,
  },
  stackingOrder: {
    type: ControlType.Enum,
    title: "Stacking",
    options: ["right-on-top", "left-on-top"],
    optionTitles: ["Right on top", "Left on top"],
    defaultValue: "right-on-top",
  },
});

export default FannedDeck;
