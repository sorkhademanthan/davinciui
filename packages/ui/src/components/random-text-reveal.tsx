"use client";

import { cn } from "@workspace/ui/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as React from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/*                                                                     */
/* Randomized per-character text reveal, GSAP-driven with ONE          */
/* ScrollTrigger and ONE timeline per component instance. Words stay   */
/* grouped so wrapping never breaks mid-word; spaces are plain text    */
/* nodes (never animated) so layout is identical before/during/after.  */
/* Only opacity (+ optional transform) animate — no layout shift.      */
/* ------------------------------------------------------------------ */

export type RandomTextRevealEase =
  | "Linear"
  | "Power1 Out"
  | "Power2 Out"
  | "Power3 Out"
  | "Power4 Out"
  | "Sine Out"
  | "Expo Out"
  | "Circ Out"
  | "Back Out";

export type RandomTextRevealMode =
  | "random"
  | "forward"
  | "reverse"
  | "center-out"
  | "edges-in";

export type RandomTextRevealTrigger = "top" | "center" | "bottom";
export type RandomTextRevealAlign = "left" | "center" | "right" | "justify";

export interface RandomTextRevealProps {
  /** Text content. Words wrap naturally; characters reveal independently. */
  text?: string;
  /** Font family applied to the text. */
  fontFamily?: string;
  /** Font size. Numbers become px; strings pass through (e.g. clamp()). */
  fontSize?: number | string;
  /** Font weight applied to the text. */
  fontWeight?: number | string;
  /** Font style applied to the text. */
  fontStyle?: "normal" | "italic";
  /** Line height. Numbers are unitless multipliers. */
  lineHeight?: number | string;
  /** Tracking. Numbers become px; strings pass through (e.g. "-0.03em"). */
  letterSpacing?: number | string;
  /** Final revealed character color (opacity animates, color stays). */
  color?: string;
  /** Text alignment. */
  textAlign?: RandomTextRevealAlign;
  /** Starting opacity of unrevealed characters. */
  fromOpacity?: number;
  /** Final opacity of revealed characters. */
  toOpacity?: number;
  /** Per-character transition duration, in seconds. */
  duration?: number;
  /** Earliest per-character reveal delay, in seconds. */
  minDelay?: number;
  /** Latest per-character reveal delay, in seconds. */
  maxDelay?: number;
  /** GSAP easing for each character transition. */
  ease?: RandomTextRevealEase;
  /** Reveal order. `random` (default) scatters across the whole text. */
  animationMode?: RandomTextRevealMode;
  /** Viewport position that starts the reveal. */
  triggerPosition?: RandomTextRevealTrigger;
  /** Fine-tune trigger point in px (positive = later, negative = earlier). */
  triggerOffset?: number;
  /** Re-arm when leaving the viewport so re-entering replays the reveal. */
  replay?: boolean;
  /** Generate a fresh random distribution on every replay. */
  randomizeEachReplay?: boolean;
  /** Auto-replay on a timer after each completion (keeps looping in view). */
  loop?: boolean;
  /** Pause between loop iterations, in seconds. */
  loopDelay?: number;
  /** Fixed seed for a stable random order across renders/reloads. */
  seed?: number;
  /** Optional horizontal motion offset in px (0 = pure opacity reveal). */
  motionX?: number;
  /** Optional vertical motion offset in px (0 = pure opacity reveal). */
  motionY?: number;
  /** Optional starting scale (1 = pure opacity reveal). */
  motionScale?: number;
  /** Optional starting rotation in degrees (0 = pure opacity reveal). */
  motionRotation?: number;
  /** Additional classes for the outer element. */
  className?: string;
  /** Additional inline styles for the outer element. */
  style?: React.CSSProperties;
}

export const RANDOM_TEXT_REVEAL_EASES: Record<
  RandomTextRevealEase,
  string
> = {
  Linear: "none",
  "Power1 Out": "power1.out",
  "Power2 Out": "power2.out",
  "Power3 Out": "power3.out",
  "Power4 Out": "power4.out",
  "Sine Out": "sine.out",
  "Expo Out": "expo.out",
  "Circ Out": "circ.out",
  "Back Out": "back.out",
};

const TRIGGER_START: Record<RandomTextRevealTrigger, string> = {
  top: "top top",
  center: "top center",
  bottom: "top bottom",
};

export const RANDOM_TEXT_REVEAL_DEFAULT_TEXT =
  "DavinciUI gives you production-ready components with crafted details, buttery motion, and beautiful defaults — copy, paste, and make them yours. Every component is open code you own, built to drop into any project and feel instantly at home.";

/** Deterministic PRNG (mulberry32) for seeded shuffles. */
export function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RevealPlan {
  /** Per-character delay in seconds, indexed by document order. */
  delays: number[];
}

/**
 * Compute per-character reveal delays for `count` characters.
 * Pure + exported for testability. `random` scatters across the whole
 * text; other modes map rank → delay across [minDelay, maxDelay].
 */
export function buildRevealPlan(
  count: number,
  opts: {
    mode: RandomTextRevealMode;
    minDelay: number;
    maxDelay: number;
    random?: () => number;
  },
): RevealPlan {
  const { mode, minDelay, maxDelay } = opts;
  const rand = opts.random ?? Math.random;
  const delays = new Array<number>(count).fill(minDelay);
  if (count === 0) return { delays };
  if (count === 1) {
    delays[0] = minDelay;
    return { delays };
  }

  if (mode === "random") {
    for (let i = 0; i < count; i++) {
      delays[i] = minDelay + rand() * (maxDelay - minDelay);
    }
    return { delays };
  }

  // Deterministic modes: rank each character, then spread over the range.
  const rank = new Array<number>(count).fill(0);
  if (mode === "forward") {
    for (let i = 0; i < count; i++) rank[i] = i;
  } else if (mode === "reverse") {
    for (let i = 0; i < count; i++) rank[i] = count - 1 - i;
  } else if (mode === "center-out") {
    const center = (count - 1) / 2;
    for (let i = 0; i < count; i++) rank[i] = Math.abs(i - center);
  } else {
    // edges-in: edges reveal first, middle last.
    for (let i = 0; i < count; i++) rank[i] = Math.min(i, count - 1 - i);
  }
  const order = [...Array(count).keys()].sort((a, b) => {
    const d = rank[a]! - rank[b]!;
    return d !== 0 ? d : a - b;
  });
  order.forEach((charIndex, position) => {
    delays[charIndex] =
      minDelay + (maxDelay - minDelay) * (position / (count - 1));
  });
  return { delays };
}

let scrollTriggerRegistered = false;
function ensureScrollTrigger(): void {
  if (!scrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

/** Split into alternating word / whitespace tokens, preserving spacing. */
function tokenize(text: string): { value: string; isWord: boolean }[] {
  return text
    .split(/(\s+)/)
    .filter((part) => part.length > 0)
    .map((part) => ({ value: part, isWord: !/^\s+$/.test(part) }));
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function RandomTextReveal({
  text = RANDOM_TEXT_REVEAL_DEFAULT_TEXT,
  fontFamily,
  fontSize = 64,
  fontWeight = 600,
  fontStyle = "normal",
  lineHeight = 1.1,
  letterSpacing = "-0.03em",
  color = "#000000",
  textAlign = "center",
  fromOpacity = 0.12,
  toOpacity = 1,
  duration = 0.35,
  minDelay = 0,
  maxDelay = 1.5,
  ease = "Power2 Out",
  animationMode = "random",
  triggerPosition = "center",
  triggerOffset = 0,
  replay = true,
  randomizeEachReplay = true,
  loop = false,
  loopDelay = 2,
  seed,
  motionX = 0,
  motionY = 0,
  motionScale = 1,
  motionRotation = 0,
  className,
  style,
}: RandomTextRevealProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const charsRef = React.useRef<HTMLSpanElement[]>([]);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const tokens = React.useMemo(() => tokenize(text), [text]);
  const charCount = React.useMemo(
    () =>
      tokens.reduce(
        (sum, token) =>
          sum + (token.isWord ? Array.from(token.value).length : 0),
        0,
      ),
    [tokens],
  );

  const hasMotion =
    motionX !== 0 || motionY !== 0 || motionScale !== 1 || motionRotation !== 0;

  // --- Reduced-motion subscription: render final state, never animate. ---
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent): void =>
      setReducedMotion(e.matches);
    setReducedMotion(mq.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  // --- GSAP lifecycle: ONE timeline + ONE ScrollTrigger per instance. ---
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || charCount === 0 || reducedMotion) return;
    ensureScrollTrigger();

    const chars = charsRef.current.filter(Boolean);
    if (chars.length === 0) return;

    const makeRandom =
      seed !== undefined ? () => createSeededRandom(seed) : undefined;

    const setFromState = (): void => {
      gsap.set(chars, {
        opacity: fromOpacity,
        x: motionX,
        y: motionY,
        scale: motionScale,
        rotation: motionRotation,
      });
    };
    const setToState = (): void => {
      gsap.set(chars, {
        opacity: toOpacity,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
      });
    };

    let timeline: gsap.core.Timeline | null = null;
    let loopCall: gsap.core.Tween | null = null;
    let cancelled = false;
    let hasPlayed = false;
    let inView = true;
    let io: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        const visible = entries[0]?.isIntersecting ?? true;
        const wasHidden = !inView && visible;
        inView = visible;
        // A loop beat that fired while offscreen is skipped without
        // re-arming — resume here so the text never sits stuck in the
        // from-state with no animation running.
        if (visible && wasHidden && loop && !cancelled && hasPlayed) {
          if (randomizeEachReplay) buildTimeline();
          else setFromState();
          timeline?.play(0);
        }
      });
      io.observe(root);
    }

    const buildTimeline = (): void => {
      timeline?.kill();
      loopCall?.kill();
      loopCall = null;
      const random = makeRandom ? makeRandom() : undefined;
      const { delays } = buildRevealPlan(chars.length, {
        mode: animationMode,
        minDelay,
        maxDelay,
        random,
      });
      setFromState();
      timeline = gsap.timeline({ paused: true });
      timeline.eventCallback("onComplete", () => {
        if (!loop || cancelled) return;
        // Pause between iterations, then replay. Offscreen iterations
        // reset to the from-state and wait for onEnter instead of
        // playing invisibly.
        loopCall?.kill();
        loopCall = gsap.delayedCall(loopDelay, () => {
          if (cancelled) return;
          if (randomizeEachReplay) buildTimeline();
          else {
            loopCall = null;
            setFromState();
          }
          hasPlayed = true;
          if (inView) timeline?.play(0);
        });
      });
      chars.forEach((char, i) => {
        timeline!.to(
          char,
          {
            opacity: toOpacity,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            duration,
            ease: RANDOM_TEXT_REVEAL_EASES[ease],
            overwrite: "auto",
          },
          delays[i],
        );
      });
    };

    buildTimeline();

    const start = `${TRIGGER_START[triggerPosition]}${triggerOffset !== 0 ? `${triggerOffset >= 0 ? "+=" : "-="}${Math.abs(triggerOffset)}` : ""}`;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: root,
        start,
        once: !replay,
        onEnter: () => {
          if (randomizeEachReplay && hasPlayed) buildTimeline();
          hasPlayed = true;
          timeline?.play(0);
        },
        onLeaveBack: () => {
          if (!replay) return;
          timeline?.pause(0);
          setFromState();
        },
        onLeave: () => {
          if (!replay) return;
          // Scrolled past: re-arm so coming back replays (both directions).
          timeline?.pause(0);
          setFromState();
        },
      });
      // Evaluate immediately: if the element is already in view at mount
      // (no scroll ever crosses `start`), creation alone may never fire
      // onEnter. Scoped to this instance only.
      trigger.refresh();
      // Already past `start` (e.g. visible on load): play now instead of
      // waiting for a scroll crossing that never comes.
      if (trigger.progress > 0) {
        hasPlayed = true;
        timeline?.play(0);
      }
    }, root);

    return () => {
      // Reverts ONLY this instance's timeline + trigger + loop timer.
      cancelled = true;
      loopCall?.kill();
      loopCall = null;
      io?.disconnect();
      io = null;
      ctx.revert();
      timeline = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    text,
    fromOpacity,
    toOpacity,
    duration,
    minDelay,
    maxDelay,
    ease,
    animationMode,
    triggerPosition,
    triggerOffset,
    replay,
    randomizeEachReplay,
    loop,
    loopDelay,
    seed,
    motionX,
    motionY,
    motionScale,
    motionRotation,
    charCount,
    reducedMotion,
  ]);

  // Keep the ref array aligned with the current token render.
  charsRef.current = [];
  let charIndex = 0;

  return (
    <div
      ref={rootRef}
      className={cn("w-full", className)}
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        fontStyle,
        lineHeight,
        letterSpacing,
        color,
        textAlign,
        ...style,
      }}
    >
      {/* Screen-reader text (not a visual layer). */}
      <span className="sr-only">{text}</span>

      {/* Animated tree — hidden from assistive tech (no per-char chatter). */}
      <span aria-hidden="true">
        {tokens.map((token, tokenIndex) =>
          token.isWord ? (
            <span
              key={tokenIndex}
              style={{ display: "inline-block", wordBreak: "keep-all" }}
            >
              {Array.from(token.value).map((char) => {
                const i = charIndex++;
                return (
                  <span
                    key={i}
                    ref={(el) => {
                      if (el) charsRef.current[i] = el;
                    }}
                    style={{
                      display: "inline-block",
                      opacity: reducedMotion ? toOpacity : fromOpacity,
                      ...(hasMotion
                        ? { willChange: "opacity, transform" }
                        : undefined),
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ) : (
            <span key={tokenIndex}>{token.value}</span>
          ),
        )}
      </span>
    </div>
  );
}

export default RandomTextReveal;
