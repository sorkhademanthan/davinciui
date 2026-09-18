"use client";

import * as React from "react";
import gsap from "gsap";
import { cn } from "@workspace/ui/lib/utils";

export type DaVinciPreloaderPhase =
  | "hero"
  | "fragmenting"
  | "assembling"
  | "holding"
  | "revealing"
  | "expanding"
  | "handing-off"
  | "finished";

export interface DaVinciPreloaderProps {
  /** Page / hero content revealed underneath the loader. */
  children: React.ReactNode;
  /** Hero image source — MUST be the same asset used by the hero underneath. */
  image: string;
  /** Wordmark text. Defaults to "DA VINCI". */
  text?: string;
  /** Loader background. Warm off-white matched to the reference. */
  background?: string;
  /** Wordmark ink color. */
  textColor?: string;
  /** Master timeline duration scale. 1 = ~3.2s reference pacing. */
  duration?: number;
  /** Minimum ms to wait for hero asset + fonts before playing. */
  minimumDuration?: number;
  /** Alt text for the reveal image. */
  imageAlt?: string;
  /** Stacking order of the overlay. */
  zIndex?: number;
  /** Additional classes applied to the overlay. */
  className?: string;
  /** Fires on every phase transition. */
  onPhaseChange?: (phase: DaVinciPreloaderPhase) => void;
  /** Fires once the handoff finishes and the overlay unmounts. */
  onComplete?: () => void;
}

/**
 * Deterministic per-character fragmentation offsets (no Math.random —
 * every playback looks intentional). Predominantly horizontal/vertical,
 * zero rotation, varied travel distances.
 */
const FRAGMENT_OFFSETS: ReadonlyArray<{ x: number; y: number }> = [
  { x: -52, y: -10 },
  { x: -38, y: 6 },
  { x: -26, y: -6 },
  { x: -14, y: 10 },
  { x: -6, y: -12 },
  { x: 8, y: 8 },
  { x: 18, y: -8 },
  { x: 30, y: 12 },
  { x: 42, y: -6 },
  { x: 56, y: 8 },
  { x: -64, y: 12 },
  { x: 68, y: -12 },
];

function splitChars(text: string): Array<{ char: string; key: string }> {
  return text.split("").map((char, i) => ({
    char,
    key: `${i}-${char === " " ? "space" : char}`,
  }));
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
    // `decode()` catches-never so a broken asset can't trap the loader.
    if (typeof img.decode === "function") {
      img.decode().then(
        () => resolve(),
        () => resolve(),
      );
    }
  });
}

function waitForFonts(): Promise<void> {
  try {
    if (typeof document !== "undefined" && document.fonts?.ready) {
      return document.fonts.ready.then(
        () => undefined,
        () => undefined,
      );
    }
  } catch {
    /* fonts API unavailable — proceed */
  }
  return Promise.resolve();
}

/**
 * DaVinciPreloader — HERO → typography fragments → off-white screen →
 * DA VINCI assembles → small hero-image window inside the wordmark →
 * window expands (FLIP clip-path, same crop throughout) → seamless hero handoff.
 *
 * The reveal layer is ONE fullscreen image whose clip-path interpolates
 * from a point → small center rect → full viewport, so the crop can never
 * jump. At handoff the overlay fades over an identical hero image.
 *
 * Hero fragmentation targets `[data-dv-hero-char]` descendants of
 * `children` when present; otherwise the overlay wipe still runs.
 *
 * Replay by remounting: `<DaVinciPreloader key={replayCount} … />`.
 */
export function DaVinciPreloader({
  children,
  image,
  text = "DA VINCI",
  background = "#F3F1F1",
  textColor = "#141414",
  duration = 3.2,
  minimumDuration = 400,
  imageAlt = "",
  zIndex = 9999,
  className,
  onPhaseChange,
  onComplete,
}: DaVinciPreloaderProps) {
  const [phase, setPhase] = React.useState<DaVinciPreloaderPhase>("hero");
  const [ready, setReady] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const heroRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const wordmarkRef = React.useRef<HTMLDivElement>(null);
  const revealRef = React.useRef<HTMLDivElement>(null);

  const phaseRef = React.useRef<DaVinciPreloaderPhase>("hero");
  const doneRef = React.useRef(false);
  const onPhaseChangeRef = React.useRef(onPhaseChange);
  const onCompleteRef = React.useRef(onComplete);
  onPhaseChangeRef.current = onPhaseChange;
  onCompleteRef.current = onComplete;

  const chars = React.useMemo(() => splitChars(text), [text]);

  const goToPhase = React.useCallback((next: DaVinciPreloaderPhase) => {
    phaseRef.current = next;
    setPhase(next);
    onPhaseChangeRef.current?.(next);
  }, []);

  // Reduced-motion: brief wordmark, short reveal, immediate hero.
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Gate playback on hero asset + fonts (+ minimum display floor) so the
  // timeline never completes over an unloaded hero.
  React.useEffect(() => {
    let cancelled = false;
    const floor = new Promise<void>((resolve) =>
      window.setTimeout(resolve, Math.max(0, minimumDuration)),
    );
    const timeout = new Promise<void>((resolve) =>
      window.setTimeout(resolve, 4000),
    );
    void Promise.race([
      Promise.all([preloadImage(image), waitForFonts(), floor]),
      timeout,
    ]).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [image, minimumDuration]);

  // Lock body scroll while the sequence is alive.
  React.useEffect(() => {
    if (phase === "finished") return;
    const root = document.documentElement;
    const body = document.body;
    const prevRoot = root.style.overflow;
    const prevBody = body.style.overflow;
    const prevTouch = body.style.touchAction;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    return () => {
      root.style.overflow = prevRoot;
      body.style.overflow = prevBody;
      body.style.touchAction = prevTouch;
    };
  }, [phase]);

  const finish = React.useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    goToPhase("finished");
    onCompleteRef.current?.();
  }, [goToPhase]);

  // ONE master GSAP timeline for the whole cinematic sequence.
  React.useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    const overlay = overlayRef.current;
    const wordmark = wordmarkRef.current;
    const reveal = revealRef.current;
    if (!root || !overlay || !wordmark || !reveal) return;

    const heroChars: HTMLElement[] = heroRef.current
      ? Array.from(
          heroRef.current.querySelectorAll<HTMLElement>(
            "[data-dv-hero-char]",
          ),
        )
      : [];
    const wordChars = Array.from(
      wordmark.querySelectorAll<HTMLElement>("[data-dv-char-inner]"),
    );
    const wordMasks = Array.from(
      wordmark.querySelectorAll<HTMLElement>("[data-dv-char-mask]"),
    );

    const scale = Math.max(0.4, duration / 3.2);
    const ctx = gsap.context(() => {}, root);

    if (reducedMotion) {
      const tl = gsap.timeline({ onComplete: finish });
      tl.set(overlay, { yPercent: 0 })
        .fromTo(
          wordChars,
          { yPercent: 30, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          0,
        )
        .to(overlay, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        }, "+=0.35");
      return () => {
        ctx.revert();
        tl.kill();
      };
    }

    const measureInset = (kind: "point" | "window" | "full"): string => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (kind === "full") return "inset(0px 0px 0px 0px)";
      // NOTE: the wordmark lives inside the overlay, which starts translated
      // 100% below the viewport — so mark.top is off-screen at timeline build
      // time. Only the height/width are meaningful; vertical center is always
      // the viewport center because the wordmark is flex-centered in a
      // fullscreen overlay.
      const mark = wordmark.getBoundingClientRect();
      const h = Math.max(48, mark.height > 0 ? mark.height * 1.02 : vh * 0.11);
      const w =
        kind === "point"
          ? 0
          : Math.min(340, vw * 0.34, mark.width > 0 ? mark.width * 0.42 : vw * 0.34);
      const cx = vw / 2;
      const cy = vh / 2;
      const top = Math.max(0, cy - h / 2);
      const bottom = Math.max(0, vh - (cy + h / 2));
      const left = Math.max(0, cx - w / 2);
      const right = Math.max(0, vw - (cx + w / 2));
      return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px)`;
    };

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: finish,
    });

    // PHASE B — hero typography fragments (deterministic offsets).
    if (heroChars.length > 0) {
      goToPhase("fragmenting");
      tl.to(
        heroChars,
        {
          x: (i: number) =>
            FRAGMENT_OFFSETS[i % FRAGMENT_OFFSETS.length]?.x ?? 0,
          y: (i: number) =>
            FRAGMENT_OFFSETS[i % FRAGMENT_OFFSETS.length]?.y ?? 0,
          opacity: 0,
          duration: 0.5 * scale,
          ease: "power3.in",
          stagger: 0.014,
        },
        0,
      );
    }

    // PHASE C — off-white screen wipes in over the destabilized hero.
    tl.fromTo(
      overlay,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: 0.5 * scale,
        ease: "expo.inOut",
        onStart: () => goToPhase("assembling"),
      },
      heroChars.length > 0 ? 0.35 * scale : 0,
    );

    // PHASE D/E — DA VINCI resolves from clipped slices, then holds.
    tl.fromTo(
      wordChars,
      { yPercent: 112, opacity: 0.35 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.55 * scale,
        ease: "expo.out",
        stagger: 0.032,
      },
      "-=0.12",
    );
    tl.to({}, { duration: 0.45 * scale, onStart: () => goToPhase("holding") });

    // PHASE F/G — image window opens inside the wordmark. Only the
    // clip-path moves; the fullscreen image (and its crop) never does.
    // Function-based values defer measurement until each tween starts,
    // so a resize between timeline build and reveal stays correct.
    tl.fromTo(
      reveal,
      { clipPath: () => measureInset("point") },
      {
        clipPath: () => measureInset("window"),
        duration: 0.45 * scale,
        ease: "expo.out",
        onStart: () => {
          goToPhase("revealing");
        },
      },
    );
    tl.to({}, { duration: 0.32 * scale });

    // PHASE H/I — rectangle expands aggressively into the full hero while
    // the wordmark is consumed (overlapping — never fade-then-expand).
    tl.to(reveal, {
      clipPath: () => measureInset("full"),
      duration: 0.9 * scale,
      ease: "power4.inOut",
      onStart: () => goToPhase("expanding"),
    });
    tl.to(
      wordMasks,
      {
        yPercent: -40,
        opacity: 0,
        duration: 0.5 * scale,
        ease: "power3.in",
        stagger: 0.012,
      },
      "<",
    );

    // PHASE J — seamless handoff: identical crops, so a short fade is invisible.
    tl.to(
      overlay,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        onStart: () => goToPhase("handing-off"),
      },
      "-=0.18",
    );

    return () => {
      tl.kill();
      ctx.revert();
    };
    // Re-run only when readiness / text / asset change (replay = remount via key).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, text, image, reducedMotion, duration]);

  // Safety net: never trap the page if a timeline callback is lost.
  React.useEffect(() => {
    if (!ready || phase === "finished") return;
    const ms = (reducedMotion ? 1.2 : duration + 1.6) * 1000 + 2500;
    const timer = window.setTimeout(() => finish(), ms);
    return () => window.clearTimeout(timer);
  }, [ready, phase, duration, reducedMotion, finish]);

  if (phase === "finished") {
    return <>{children}</>;
  }

  return (
    <div ref={rootRef} data-slot="da-vinci-preloader" data-phase={phase}>
      {/* Underlying page / hero — always mounted so the handoff is seamless. */}
      <div ref={heroRef}>{children}</div>

      {/* Loader overlay. Starts translated below the viewport (hero first
          frame), then wipes in as part of the master timeline. */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className={cn("fixed inset-0 overflow-hidden", className)}
        style={{
          width: "100vw",
          height: "100dvh",
          backgroundColor: background,
          zIndex,
          transform: "translateY(100%)",
          willChange: "transform, opacity",
        }}
      >
        {/* Central DA VINCI wordmark — one line, per-character masks. */}
        <div className="absolute inset-0 flex items-center justify-center px-[4vw]">
          <div
            ref={wordmarkRef}
            className="flex max-w-[94vw] flex-row flex-nowrap items-baseline justify-center whitespace-nowrap"
            style={{
              color: textColor,
              fontSize: "clamp(40px, 8.5vw, 124px)",
              fontWeight: 500,
              letterSpacing: "0.01em",
              lineHeight: 1,
              fontFamily:
                '"Helvetica Neue", Helvetica, Inter, "Neue Haas Grotesk", "Arial Nova", Arial, sans-serif',
            }}
          >
            {chars.map(({ char, key }) =>
              char === " " ? (
                <span
                  key={key}
                  aria-hidden="true"
                  className="inline-block shrink-0"
                  style={{ width: "0.32em" }}
                />
              ) : (
                <span
                  key={key}
                  data-dv-char-mask
                  className="inline-block shrink-0 overflow-hidden pb-[0.06em]"
                  style={{ willChange: "transform, opacity" }}
                >
                  <span
                    data-dv-char-inner
                    className="inline-block"
                    style={{
                      transform: "translateY(112%)",
                      opacity: 0.35,
                      willChange: "transform, opacity",
                    }}
                  >
                    {char}
                  </span>
                </span>
              ),
            )}
          </div>
        </div>

        {/* Reveal layer: ONE fullscreen image, masked by an animated
            clip-path (point → window → full). Same crop at every frame,
            so expansion is pure geometry — never a thumbnail crossfade. */}
        <div
          ref={revealRef}
          className="absolute inset-0"
          style={{
            clipPath: "inset(50% 50% 50% 50%)",
            willChange: "clip-path",
          }}
        >
          <img
            src={image}
            alt={imageAlt}
            draggable={false}
            className="absolute inset-0 h-full w-full"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      </div>
    </div>
  );
}

export default DaVinciPreloader;
