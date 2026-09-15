"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface ScrollRevealImageItem {
  src: string;
  revealSrc?: string;
  alt: string;
  title?: string;
  accent?: string;
}

export interface ScrollRevealImageProps {
  images: readonly ScrollRevealImageItem[];
  className?: string;
  sectionHeight?: string;
  imageWidth?: string;
  imageHeight?: string;
  borderRadius?: string;
  backgroundScale?: number;
  imageScale?: number;
  scrub?: number;
}

function RevealLayer({
  image,
  index,
  count,
  progress,
  imageWidth,
  imageHeight,
  borderRadius,
  backgroundScale,
  imageScale,
  reduceMotion,
}: {
  image: ScrollRevealImageItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
  imageWidth: string;
  imageHeight: string;
  borderRadius: string;
  backgroundScale: number;
  imageScale: number;
  reduceMotion: boolean;
}) {
  const step = count > 1 ? 1 / (count - 1) : 1;
  const revealStart = Math.max(0, (index - 1) * step);
  const revealEnd = index * step;
  const clipPath = useTransform(
    progress,
    [revealStart, revealEnd || 1],
    index === 0
      ? ["inset(0% 0 0 0)", "inset(0% 0 0 0)"]
      : ["inset(100% 0 0 0)", "inset(0% 0 0 0)"],
  );
  const titleX = useTransform(
    progress,
    [revealStart, revealEnd || 1],
    ["7vw", "-7vw"],
  );
  const accent = image.accent ?? "#d7ff39";

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ clipPath, zIndex: index + 1 }}
    >
      <img
        src={image.src}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
        style={{
          transform: `scale(${backgroundScale})`,
          filter: "brightness(0.62) saturate(0.9)",
        }}
      />
      <div className="absolute inset-0 bg-black/18" />
      {image.title ? (
        <motion.div
          className="absolute left-1/2 top-[60%] z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(3.25rem,10vw,9rem)] font-bold uppercase leading-none tracking-[0.025em]"
          style={reduceMotion ? { color: accent } : { color: accent, x: titleX }}
        >
          {image.title}
        </motion.div>
      ) : null}
      <div
        className="absolute left-1/2 top-1/2 z-10 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.42)]"
        style={{ width: imageWidth, height: imageHeight, borderRadius }}
      >
        <img
          src={image.revealSrc ?? image.src}
          alt={image.alt}
          className="h-full w-full object-cover"
          draggable={false}
          loading={index === 0 ? "eager" : "lazy"}
          style={{
            transform: `scale(${imageScale})`,
            filter: "brightness(1.16) saturate(1.08)",
          }}
        />
      </div>
    </motion.div>
  );
}

export function ScrollRevealImage({
  images,
  className,
  sectionHeight = "300vh",
  imageWidth = "clamp(15rem, 30vw, 38rem)",
  imageHeight = "clamp(22rem, 78vh, 52rem)",
  borderRadius = "0rem",
  backgroundScale = 1.08,
  imageScale = 1.04,
  scrub = 0.18,
}: ScrollRevealImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 1000 : 180,
    damping: reduceMotion ? 100 : 30,
    mass: scrub,
    restDelta: 0.0005,
  });

  if (images.length === 0) return null;

  if (reduceMotion) {
    const image = images[images.length - 1]!;
    return (
      <section
        ref={containerRef}
        className={cn("relative w-full", className)}
        style={{ minHeight: sectionHeight }}
        aria-label="Scroll reveal image gallery"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className={cn("relative w-full", className)}
      style={{ minHeight: sectionHeight }}
      aria-label="Scroll reveal image gallery"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {images.map((image, index) => (
          <RevealLayer
            key={`${image.src}-${index}`}
            image={image}
            index={index}
            count={images.length}
            progress={progress}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            borderRadius={borderRadius}
            backgroundScale={backgroundScale}
            imageScale={imageScale}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}
