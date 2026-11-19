"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface TextMorphProps {
  /** Words or phrases displayed by the morph sequence. */
  words?: string[];
  /** Time each word rests before the next morph begins, in milliseconds. */
  interval?: number;
  /** Duration of the fluid morph itself, in milliseconds. */
  morphDuration?: number;
  /** Additional classes applied to the component. */
  className?: string;
}

const DEFAULT_WORDS = ["DESIGN", "ANIMATE", "DELIGHT"];
const MORPH_BLUR = 12;
const MORPH_THRESHOLD = 18;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function setLayerStyles(
  element: HTMLSpanElement,
  opacity: number,
  blur: number,
  scale: number,
) {
  element.style.opacity = opacity.toFixed(4);
  element.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
  element.style.transform = `translateX(-50%) scale(${scale.toFixed(4)})`;
}

export function TextMorph({
  words = DEFAULT_WORDS,
  interval = 2600,
  morphDuration = 680,
  className,
}: TextMorphProps) {
  const values = useMemo(() => {
    const filtered = words.filter((word) => word.trim().length > 0);
    return filtered.length > 0 ? filtered : DEFAULT_WORDS;
  }, [words]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentLayerRef = useRef<HTMLSpanElement>(null);
  const nextLayerRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const holdTimerRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);
  const morphingRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const reactId = useId().replace(/:/g, "");
  const filterId = `text-morph-threshold-${reactId}`;
  const measureLayerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [fontNonce, setFontNonce] = useState(0);

  const safeIndex = currentIndex % values.length;
  const nextIndex = (safeIndex + 1) % values.length;
  const currentWord = values[safeIndex]!;
  const nextWord = values[nextIndex]!;
  const thresholdOffset = -MORPH_THRESHOLD * 0.46;

  const measureStage = useCallback(() => {
    const layers = measureLayerRefs.current.filter(
      (layer): layer is HTMLSpanElement => layer !== null,
    );
    if (layers.length === 0) return;
    const width = Math.ceil(
      Math.max(...layers.map((layer) => layer.offsetWidth)),
    );
    const height = Math.ceil(
      Math.max(...layers.map((layer) => layer.offsetHeight)),
    );
    setStageSize((previous) =>
      previous.width === width && previous.height === height
        ? previous
        : { width, height },
    );
  }, []);

  useLayoutEffect(() => {
    const currentLayer = currentLayerRef.current;
    const nextLayer = nextLayerRef.current;
    const stage = stageRef.current;
    if (!currentLayer || !nextLayer || !stage) return;

    setLayerStyles(currentLayer, 1, 0, 1);
    setLayerStyles(nextLayer, 0, reducedMotion ? 0 : MORPH_BLUR, 0.992);
    currentLayer.style.willChange = "auto";
    nextLayer.style.willChange = "auto";
    stage.style.filter = "none";
  }, [currentIndex, morphDuration, reducedMotion, values]);

  useEffect(() => {
    measureStage();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measureStage);
    measureLayerRefs.current.forEach((layer) => {
      if (layer) observer?.observe(layer);
    });
    return () => observer?.disconnect();
  }, [measureStage, values]);

  useEffect(() => {
    if (!("fonts" in document)) return;
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      setFontNonce((value) => value + 1);
      measureStage();
    });
    return () => {
      cancelled = true;
    };
  }, [measureStage]);

  useEffect(() => {
    measureStage();
  }, [fontNonce, measureStage]);

  const beginMorph = useCallback(() => {
    const currentLayer = currentLayerRef.current;
    const nextLayer = nextLayerRef.current;
    const stage = stageRef.current;
    if (
      !currentLayer ||
      !nextLayer ||
      !stage ||
      morphingRef.current ||
      values.length < 2
    ) {
      return;
    }

    morphingRef.current = true;
    currentLayer.style.willChange = "opacity, filter, transform";
    nextLayer.style.willChange = "opacity, filter, transform";
    stage.style.filter = reducedMotion ? "none" : `url(#${filterId})`;

    const startedAt = performance.now();
    const resolvedDuration = reducedMotion ? 140 : Math.max(240, morphDuration);

    const renderFrame = (now: number) => {
      const progress = clamp((now - startedAt) / resolvedDuration);
      const eased = smoothstep(progress);

      if (reducedMotion) {
        setLayerStyles(currentLayer, 1 - eased, 0, 1);
        setLayerStyles(nextLayer, eased, 0, 1);
      } else {
        // The incoming layer starts early and the outgoing layer lingers. Their
        // overlap gives the threshold filter enough shared alpha to feel fluid.
        const incoming = smoothstep(clamp(progress / 0.82));
        const outgoing = smoothstep(clamp((progress - 0.18) / 0.82));

        setLayerStyles(
          currentLayer,
          Math.pow(1 - outgoing, 0.55),
          MORPH_BLUR * outgoing,
          1 - outgoing * 0.012,
        );
        setLayerStyles(
          nextLayer,
          Math.pow(incoming, 0.55),
          MORPH_BLUR * (1 - incoming),
          0.988 + incoming * 0.012,
        );
      }

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(renderFrame);
        return;
      }

      stage.style.filter = "none";
      currentLayer.style.willChange = "auto";
      nextLayer.style.willChange = "auto";
      morphingRef.current = false;
      setCurrentIndex(nextIndex);
    };

    frameRef.current = window.requestAnimationFrame(renderFrame);
  }, [filterId, morphDuration, nextIndex, reducedMotion, values.length]);

  useEffect(() => {
    if (values.length < 2) return;

    holdTimerRef.current = window.setTimeout(
      beginMorph,
      Math.max(400, interval),
    );

    return () => {
      if (holdTimerRef.current !== undefined) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, [beginMorph, currentIndex, interval, values.length]);

  useEffect(
    () => () => {
      if (holdTimerRef.current !== undefined) {
        window.clearTimeout(holdTimerRef.current);
      }
      if (frameRef.current !== undefined) {
        window.cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (currentIndex < values.length) return;
    setCurrentIndex(0);
  }, [currentIndex, values.length]);

  return (
    <span
      data-slot="text-morph"
      className={cn(
        "relative inline-block max-w-full align-baseline",
        className,
      )}
      aria-label={currentWord}
      aria-live="off"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 block"
        style={{ visibility: "hidden" }}
      >
        {values.map((word, index) => (
          <span
            key={`${index}-${word}`}
            ref={(node) => {
              measureLayerRefs.current[index] = node;
            }}
            className="block w-max whitespace-pre"
          >
            {word}
          </span>
        ))}
      </span>
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute size-0 overflow-hidden"
      >
        <defs>
          <filter
            id={filterId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${MORPH_THRESHOLD} ${thresholdOffset}`}
              result="thresholded"
            />
            <feComposite in="SourceGraphic" in2="thresholded" operator="atop" />
          </filter>
        </defs>
      </svg>

      <span
        ref={stageRef}
        aria-hidden="true"
        className="relative block min-w-0 max-w-full select-none"
        style={{
          width: stageSize.width ? `${stageSize.width}px` : undefined,
          height: stageSize.height ? `${stageSize.height}px` : undefined,
        }}
      >
        <span
          ref={currentLayerRef}
          className="absolute left-1/2 top-0 block w-max whitespace-pre"
          style={{ transform: "translateX(-50%)", transformOrigin: "center" }}
        >
          {currentWord}
        </span>
        <span
          ref={nextLayerRef}
          className="absolute left-1/2 top-0 block w-max whitespace-pre opacity-0"
          style={{
            filter: `blur(${MORPH_BLUR}px)`,
            transform: "translateX(-50%) scale(0.992)",
            transformOrigin: "center",
          }}
        >
          {nextWord}
        </span>
      </span>
    </span>
  );
}

export default TextMorph;
