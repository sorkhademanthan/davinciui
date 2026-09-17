"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ScrollBlurOverlay } from "@workspace/ui/components/scroll-blur-overlay";
import { cn } from "@/lib/utils";

function ScrollMark({
  variant = "orb",
}: {
  variant?: "orb" | "frame" | "play";
}) {
  if (variant === "play")
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="h-11 w-11 fill-none stroke-current stroke-[1.15]"
      >
        <path d="M15 10.5v27L37 24 15 10.5Z" />
        <path d="M20 15.5 33 24 20 32.5" className="opacity-40" />
      </svg>
    );
  if (variant === "frame")
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="h-11 w-11 fill-none stroke-current stroke-[1.15]"
      >
        <rect x="9" y="8" width="30" height="32" rx="1" />
        <path
          d="M16 8c8 8 8 24 0 32M32 8c-8 8-8 24 0 32"
          className="opacity-60"
        />
      </svg>
    );
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-11 w-11 fill-none stroke-current stroke-[1.15]"
    >
      <circle cx="24" cy="24" r="15" />
      <path d="M13.5 34.5 34.5 13.5" className="opacity-70" />
    </svg>
  );
}

function usePreviewWheel(
  ref: React.RefObject<HTMLDivElement | null>,
  reduceMotion: boolean,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
      const maxScroll = element.scrollHeight - element.clientHeight;
      const atTop = element.scrollTop <= 0;
      const atBottom = element.scrollTop >= maxScroll - 1;
      if (delta !== 0 && ((delta > 0 && !atBottom) || (delta < 0 && !atTop))) {
        event.preventDefault();
        event.stopPropagation();
        element.scrollTop += delta;
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [ref, reduceMotion]);
}

/** A faithful, self-contained version of the supplied scroll-blur reference. */
export function ScrollBlurOverlayInteractivePreview({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [stageH, setStageH] = useState(600);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const update = () =>
      element.clientHeight > 0 && setStageH(element.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  usePreviewWheel(containerRef, reduceMotion);
  const panelStyle = { minHeight: stageH };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#171816] text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      style={{ overscrollBehaviorY: "contain" }}
    >
      <section
        className="relative flex items-center justify-center overflow-hidden bg-[#050611] px-6 text-center"
        style={panelStyle}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-95 [background:radial-gradient(ellipse_42%_55%_at_-2%_87%,#3525c8_0%,#1d155f_40%,transparent_72%),radial-gradient(ellipse_27%_43%_at_84%_25%,#3927cc_0%,#181050_47%,transparent_75%),radial-gradient(ellipse_17%_22%_at_78%_15%,#c97a37_0%,transparent_70%),linear-gradient(125deg,#060611_20%,#090718_72%,#03040b)]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-20 h-64 w-[56%] rotate-[18deg] rounded-[50%] border-[10px] border-[#7d5cff]/45 blur-[2px]"
        />
        <div className="relative z-[5] flex max-w-xl flex-col items-center">
          <h2 className="text-3xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
            Scroll Blur Overlay
          </h2>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/70 sm:text-sm">
            Create stunning iOS-inspired scroll-based blur effects that respond
            to user interaction.
          </p>
          <span className="mt-12 flex flex-col items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-white/65">
            <span className="h-5 border-l border-dashed border-white/65" />
            SCROLL DOWN
          </span>
        </div>
      </section>
      <section
        className="relative flex items-center justify-center bg-[#3627c4] px-6 text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          maxBlur={36}
          startLine={80}
          threshold={380}
          backgroundColor="#3627c4"
          opacity={0.02}
          extendAbove
          easing="ease-out"
          zIndex={10}
        />
        <div className="relative z-[15] flex max-w-md flex-col items-center text-white">
          <span className="text-white/30">
            <ScrollMark variant="frame" />
          </span>
          <h2 className="mt-4 text-2xl font-medium tracking-[-0.045em] sm:text-3xl">
            About
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-white/70 sm:text-sm">
            This component applies a dynamic backdrop blur that gradually
            increases as users scroll down the page, mimicking the elegant
            frosted glass effect found throughout iOS interfaces.
          </p>
        </div>
      </section>
      <section
        className="relative flex items-center justify-center bg-[#171816] px-6 text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          maxBlur={36}
          startLine={80}
          threshold={380}
          backgroundColor="#171816"
          opacity={0.02}
          extendAbove
          easing="ease-out"
          zIndex={20}
        />
        <div className="relative z-[25] flex max-w-md flex-col items-center text-white">
          <span className="text-white/25">
            <ScrollMark variant="play" />
          </span>
          <h2 className="mt-4 text-2xl font-medium tracking-[-0.045em] sm:text-3xl">
            How It Works?
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-white/60 sm:text-sm">
            Place the component over your content and it will automatically
            track scroll position. The blur effect starts at your defined offset
            and gradually increases until reaching your specified threshold,
            creating a smooth professional transition.
          </p>
        </div>
      </section>
      <section
        className="relative flex items-center justify-center bg-[#cc7438] px-6 text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          maxBlur={36}
          startLine={80}
          threshold={380}
          backgroundColor="#cc7438"
          opacity={0.02}
          extendAbove
          easing="ease-out"
          zIndex={30}
        />
        <div className="relative z-[35] flex max-w-md flex-col items-center text-white">
          <span className="text-white/35">
            <ScrollMark />
          </span>
          <h2 className="mt-4 text-2xl font-medium tracking-[-0.045em] sm:text-3xl">
            What You Get?
          </h2>
          <p className="mt-3 text-left text-xs leading-relaxed text-white/80 sm:text-sm">
            <strong>Remix Link:</strong> To a page with the following:
            <br />
            <strong>Scroll Blur Overlay Component:</strong> Unlimited usage in
            your projects
            <br />
            <strong>Detailed Instruction:</strong> See exactly how the example
            is set up
          </p>
        </div>
      </section>
    </div>
  );
}
