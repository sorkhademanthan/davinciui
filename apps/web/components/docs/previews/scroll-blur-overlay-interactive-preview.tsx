"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollBlurOverlay } from "@workspace/ui/components/scroll-blur-overlay";
import { cn } from "@/lib/utils";

function ScrollMark({
  variant = "about",
}: {
  variant?: "about" | "process" | "result" | "controls";
}) {
  if (variant === "process")
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 96 96"
        className="h-[clamp(3.75rem,6.5cqw,6.75rem)] w-[clamp(3.75rem,6.5cqw,6.75rem)] fill-none stroke-current stroke-[1.15]"
      >
        <path d="M21 17v62l58-31L21 17Z" />
        <circle cx="42" cy="48" r="20" />
      </svg>
    );
  if (variant === "result")
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 96 96"
        className="h-[clamp(3.75rem,6.5cqw,6.75rem)] w-[clamp(3.75rem,6.5cqw,6.75rem)] fill-none stroke-current stroke-[1.15]"
      >
        <path d="M15 23c19 0 27 11 27 25S34 73 15 73" />
        <path d="M81 23c-19 0-27 11-27 25s8 25 27 25" />
        <path d="M42 48h12" />
      </svg>
    );
  if (variant === "controls")
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 96 96"
        className="h-[clamp(3.75rem,6.5cqw,6.75rem)] w-[clamp(3.75rem,6.5cqw,6.75rem)] fill-none stroke-current stroke-[1.15]"
      >
        <circle cx="48" cy="48" r="31" />
        <path d="m48 48 31-31" />
      </svg>
    );
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      className="h-[clamp(3.75rem,6.5cqw,6.75rem)] w-[clamp(3.75rem,6.5cqw,6.75rem)] fill-none stroke-current stroke-[1.15]"
    >
      <rect x="18" y="17" width="60" height="62" />
      <path d="M30 17c0 13 20 20 20 40 0 12-7 22-17 22" />
      <path d="M66 17c0 13-20 20-20 40 0 12 7 22 17 22" />
    </svg>
  );
}

function usePreviewWheel(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
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
  }, [ref]);
}

function LiquidHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#02020f]"
    >
      <div className="absolute inset-0 [background:radial-gradient(ellipse_42%_34%_at_8%_8%,rgba(75,40,255,.34),transparent_70%),radial-gradient(ellipse_40%_36%_at_86%_20%,rgba(96,44,255,.24),transparent_70%),radial-gradient(ellipse_36%_40%_at_28%_90%,rgba(54,34,230,.2),transparent_72%)]" />
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="scroll-blur-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#211697" />
            <stop offset="0.38" stopColor="#5537ff" />
            <stop offset="0.61" stopColor="#d49a4e" />
            <stop offset="1" stopColor="#29125b" />
          </linearGradient>
          <filter
            id="scroll-blur-soft"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter
            id="scroll-blur-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>
        <g fill="none" stroke="url(#scroll-blur-ribbon)" strokeLinecap="round">
          <path
            d="M-150 760C95 515 213 620 372 770s287 85 390 210"
            strokeWidth="210"
            opacity=".63"
            filter="url(#scroll-blur-soft)"
          />
          <path
            d="M-120 735C96 548 228 635 382 776s280 72 397 189"
            strokeWidth="56"
            opacity=".9"
            filter="url(#scroll-blur-glow)"
          />
          <path
            d="M1125-115c260 83 255 232 89 331-133 79-152 188 50 275 130 56 186 137 244 244"
            strokeWidth="190"
            opacity=".5"
            filter="url(#scroll-blur-soft)"
          />
          <path
            d="M1125-95c232 83 224 211 76 307-124 80-134 181 56 265 126 56 188 136 250 248"
            strokeWidth="50"
            opacity=".82"
            filter="url(#scroll-blur-glow)"
          />
          <path
            d="M-80-8C55 112 125 62 225-24"
            strokeWidth="95"
            opacity=".48"
            filter="url(#scroll-blur-soft)"
          />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,12,.42)_100%)]" />
    </div>
  );
}

/** A faithful, self-contained version of the supplied scroll-blur reference. */
export function ScrollBlurOverlayInteractivePreview({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  usePreviewWheel(containerRef);
  const panelStyle = { minHeight: stageH };
  const blurProps = {
    maxBlur: 34,
    startLine: 82,
    threshold: Math.max(320, stageH * 0.54),
    extendAbove: true,
    easing: "ease-out" as const,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "@container absolute inset-0 overflow-y-auto overflow-x-hidden bg-[#181a19] font-sans text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      style={{ overscrollBehaviorY: "contain" }}
    >
      <section
        className="relative flex items-center justify-center overflow-hidden bg-[#02020f] px-[clamp(1.5rem,6cqw,7rem)] text-center"
        style={panelStyle}
      >
        <LiquidHeroBackground />
        <div className="relative z-[5] flex w-full max-w-[82rem] -translate-y-[2%] flex-col items-center">
          <h2 className="text-[clamp(2.75rem,7.2cqw,8rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-white">
            Scroll Blur Overlay
          </h2>
          <p className="mt-[clamp(1.5rem,3.2cqw,3.5rem)] max-w-[46rem] text-[clamp(1rem,1.9cqw,2rem)] leading-[1.25] tracking-[-0.035em] text-white/82">
            Create stunning iOS-inspired scroll-based blur effects that respond
            to user interaction.
          </p>
          <span className="absolute top-[calc(100%+clamp(5rem,11cqh,10rem))] flex flex-col items-center gap-4 text-[clamp(.65rem,.82cqw,.9rem)] tracking-[0.16em] text-white/65">
            <span className="h-12 border-l-2 border-dotted border-white/45" />
            SCROLL DOWN
          </span>
        </div>
      </section>
      <section
        className="relative flex items-center justify-center bg-[#3427c8] px-[clamp(1.5rem,8cqw,9rem)] text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          {...blurProps}
          backgroundColor="#3427c8"
          zIndex={10}
        />
        <div className="relative z-[15] flex max-w-[60rem] flex-col items-center text-white">
          <span className="text-white/25">
            <ScrollMark />
          </span>
          <h2 className="mt-[clamp(1.25rem,2.4cqw,2.5rem)] text-[clamp(2.25rem,4.4cqw,4.75rem)] font-normal leading-none tracking-[-0.055em]">
            About
          </h2>
          <p className="mt-[clamp(1.5rem,3cqw,3.25rem)] text-[clamp(1rem,1.9cqw,2rem)] leading-[1.28] tracking-[-0.035em] text-white/68">
            This component applies a dynamic backdrop blur that gradually
            increases as users scroll down the page, mimicking the elegant
            frosted glass effect found throughout iOS interfaces.
          </p>
        </div>
      </section>
      <section
        className="relative flex items-center justify-center bg-[#181a19] px-[clamp(1.5rem,8cqw,9rem)] text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          {...blurProps}
          backgroundColor="#181a19"
          zIndex={20}
        />
        <div className="relative z-[25] flex max-w-[60rem] flex-col items-center text-white">
          <span className="text-white/18">
            <ScrollMark variant="process" />
          </span>
          <h2 className="mt-[clamp(1.25rem,2.4cqw,2.5rem)] text-[clamp(2.25rem,4.4cqw,4.75rem)] font-normal leading-none tracking-[-0.055em]">
            How It Works?
          </h2>
          <p className="mt-[clamp(1.5rem,3cqw,3.25rem)] text-[clamp(1rem,1.9cqw,2rem)] leading-[1.28] tracking-[-0.035em] text-white/58">
            Place the component over your content and it will automatically
            track scroll position. The blur effect starts at your defined offset
            and gradually increases until reaching your specified threshold,
            creating a smooth professional transition.
          </p>
        </div>
      </section>
      <section
        className="relative flex items-center justify-center bg-[#d97832] px-[clamp(1.5rem,8cqw,9rem)] text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          {...blurProps}
          backgroundColor="#d97832"
          zIndex={30}
        />
        <div className="relative z-[35] flex max-w-[62rem] flex-col items-center text-white">
          <span className="text-white/38">
            <ScrollMark variant="result" />
          </span>
          <h2 className="mt-[clamp(1.25rem,2.4cqw,2.5rem)] text-[clamp(2.25rem,4.4cqw,4.75rem)] font-normal leading-none tracking-[-0.055em]">
            What You Get?
          </h2>
          <p className="mt-[clamp(1.5rem,3cqw,3.25rem)] text-left text-[clamp(.95rem,1.65cqw,1.75rem)] leading-[1.38] tracking-[-0.03em] text-white/86">
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
      <section
        className="relative flex items-center justify-center bg-[#3e405d] px-[clamp(1.5rem,8cqw,9rem)] text-center"
        style={panelStyle}
      >
        <ScrollBlurOverlay
          {...blurProps}
          backgroundColor="#3e405d"
          zIndex={40}
        />
        <div className="relative z-[45] flex max-w-[70rem] flex-col items-center text-white">
          <span className="text-white/30">
            <ScrollMark variant="controls" />
          </span>
          <h2 className="mt-[clamp(1.25rem,2.4cqw,2.5rem)] text-[clamp(2.25rem,4.4cqw,4.75rem)] font-normal leading-none tracking-[-0.055em]">
            Customizable Properties
          </h2>
          <div className="mt-[clamp(1.75rem,3.4cqw,3.75rem)] text-left text-[clamp(.95rem,1.65cqw,1.75rem)] leading-[1.38] tracking-[-0.03em] text-white/88">
            <p>
              <strong>Background Color:</strong> Set the overlay tint color
            </p>
            <p>
              <strong>Opacity:</strong> Control overlay transparency
            </p>
            <p>
              <strong>Max Blur:</strong> Maximum blur intensity in pixels
            </p>
            <p>
              <strong>Start Line:</strong> Viewport point where the blur effect
              begins
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
