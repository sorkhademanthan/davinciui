"use client";

import * as React from "react";
import {
  DEFAULT_LINES,
  DEFAULT_PROPS,
  computeLineState,
  type CurvedInlineLine,
} from "@workspace/ui/components/curved-inline-type";

const LIFT = 64;
const REACH = 150;
const ROT = 1.15;

function LineRow({ line }: { line: CurvedInlineLine }) {
  return (
    <span className="flex items-center gap-[0.08em] whitespace-nowrap">
      <span>{line.before}</span>
      {line.media?.type === "image" ? (
        <img
          src={line.media.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block shrink-0 rounded-[3px] object-cover"
          style={{ width: "1.05em", height: "0.92em" }}
        />
      ) : null}
      {line.after ? <span>{line.after}</span> : null}
    </span>
  );
}

export function CurvedInlineTypeCardPreview() {
  const lineRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const base = reduced
        ? 120.714
        : 120.714 + 46 * Math.sin(t * 0.55);
      for (let index = 0; index < DEFAULT_LINES.length; index += 1) {
        const node = lineRefs.current[index];
        if (!node) continue;
        const state = computeLineState(base, index, {
          count: DEFAULT_LINES.length,
          sweepDeg: DEFAULT_PROPS.sweepDeg,
          textRotation: ROT,
          fadeExponent: DEFAULT_PROPS.fadeExponent,
          minOpacity: DEFAULT_PROPS.minOpacity,
          blurAmount: 0,
        });
        node.style.transform = `translate3d(-50%, calc(-50% + ${(
          state.y * LIFT
        ).toFixed(2)}px), ${(state.z * REACH).toFixed(2)}px) rotateX(${(
          -ROT * state.theta
        ).toFixed(2)}deg)`;
        node.style.opacity = state.opacity.toFixed(3);
      }
      if (!reduced) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-background"
      style={{ perspective: "700px", perspectiveOrigin: "50% 50%" }}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {DEFAULT_LINES.map((line, index) => (
          <div
            key={index}
            ref={(node) => {
              lineRefs.current[index] = node;
            }}
            className="absolute left-1/2 top-1/2 text-[18px] leading-none tracking-[-0.04em] text-foreground"
            style={{
              fontFamily:
                '"Funnel Display", "Funnel Display Placeholder", sans-serif',
              backfaceVisibility: "hidden",
              willChange: "transform, opacity",
              transformStyle: "preserve-3d",
            }}
          >
            <LineRow line={line} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[14px] text-center text-[7px] uppercase tracking-[0.28em] text-muted-foreground">
        Scroll scroll scroll...
      </div>
    </div>
  );
}
