"use client";

import { useEffect, useRef, useState } from "react";
import {
  HoverTransition,
  type HoverTransitionDirection,
  type HoverTransitionEffect,
} from "@workspace/ui/components/hover-transition";
import { cn } from "@/lib/utils";

const PORTRAIT = "url('/images/hover-transition-team.jpg')";

interface StripCard {
  id: string;
  name: string;
  role: string;
  bio: string;
  position: string;
  color: string;
  effect: HoverTransitionEffect;
  direction: HoverTransitionDirection;
}

/**
 * Four docs-style team cards (photo → bio panel) showcasing four
 * different effects, directions, and hover colors.
 */
const CARDS: StripCard[] = [
  {
    id: "tom",
    name: "Tom Mathews",
    role: "CEO",
    bio: "Blending creativity with cutting-edge AI automation.",
    position: "0% 0%",
    color: "#dfff5f",
    effect: "morph",
    direction: "center",
  },
  {
    id: "andrew",
    name: "Andrew Michel",
    role: "COO",
    bio: "Turning ideas into focused systems and strong teams.",
    position: "33.333% 0%",
    color: "#ff795f",
    effect: "diagonal",
    direction: "top-left",
  },
  {
    id: "james",
    name: "James Smith",
    role: "CTO",
    bio: "Reliable AI products with human-centered design.",
    position: "66.667% 0%",
    color: "#7c8cff",
    effect: "strips",
    direction: "bottom",
  },
  {
    id: "marlen",
    name: "Marlen",
    role: "CMO",
    bio: "Brand stories that turn attention into relationships.",
    position: "100% 0%",
    color: "#ff9bcb",
    effect: "ripple",
    direction: "center",
  },
];

const LOOP = [...CARDS, ...CARDS];

/**
 * Gallery card preview: a continuously scrolling horizontal strip of
 * live Hover Transition cards. Fully ambient — the reveal tour runs in
 * the background on a timer and deliberately ignores cursor movement,
 * so hovering the preview never pauses, tilts, glares, or opens a card.
 */
export function HoverTransitionCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRunning(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setRunning(entry?.isIntersecting ?? true),
      { threshold: 0.05 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    // Slow ambient tour: each card holds open ~2.6s so the 1.15s reveal
    // fully settles before moving on — calm, smooth, readable.
    // Runs regardless of cursor position; hover never interrupts it.
    const id = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % CARDS.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, [running]);

  const animate = running;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden bg-[#f8f8f5] transition-colors dark:bg-zinc-950"
    >
      <div className="flex h-full w-full items-center overflow-hidden">
        <div
          className="flex w-max items-stretch will-change-transform"
          style={
            animate
              ? { animation: "hover-transition-card-strip 38s linear infinite" }
              : undefined
          }
        >
          {LOOP.map((card, i) => {
            const active = i % CARDS.length === activeIndex;
            return (
              <div
                key={`${card.id}-${i}`}
                className="mr-2 h-[156px] w-[124px] shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/10 dark:ring-white/15"
              >
                <HoverTransition
                  effect={card.effect}
                  direction={card.direction}
                  duration={1.15}
                  easing="cubic-bezier(0.16, 1, 0.3, 1)"
                  tabIndex={-1}
                  label={`${card.name}, ${card.role}`}
                  active={active}
                  interactive={false}
                  defaultComponent={
                    <article
                      className="relative h-full w-full overflow-hidden bg-[#f8f8f5]"
                      style={{
                        backgroundImage: PORTRAIT,
                        backgroundPosition: card.position,
                        backgroundSize: "400% 200%",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 text-[#151515]">
                        <p className="text-[13px] font-medium leading-none tracking-[-0.04em]">
                          {card.name}
                        </p>
                        <p className="mt-1 text-[7px] uppercase leading-none tracking-[0.06em] text-black/65">
                          {card.role}
                        </p>
                      </div>
                      <div className="absolute inset-x-2.5 top-2 flex justify-end font-mono text-[7px] uppercase tracking-[0.08em] text-black/55">
                        <span>{card.effect}</span>
                      </div>
                    </article>
                  }
                  hoverComponent={
                    <article
                      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-2.5 text-[#111]"
                      style={{
                        backgroundColor: card.color,
                        backgroundImage:
                          "radial-gradient(circle at 85% 5%, rgba(255,255,255,.42), transparent 34%), linear-gradient(145deg, rgba(255,255,255,.12), transparent 58%)",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-no-repeat opacity-[0.13] grayscale [mix-blend-mode:multiply] [mask-image:linear-gradient(to_bottom,transparent_8%,black_65%)]"
                        style={{
                          backgroundImage: PORTRAIT,
                          backgroundPosition: card.position,
                          backgroundSize: "400% 200%",
                        }}
                      />
                      <div className="relative">
                        <div className="flex translate-y-1.5 justify-end font-mono text-[6px] uppercase tracking-[0.1em] text-black/55 opacity-0 blur-[2px] transition-[transform,filter,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/hover-card:translate-y-0 group-data-[active=true]/hover-card:opacity-100 group-data-[active=true]/hover-card:blur-none group-data-[active=true]/hover-card:delay-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none">
                          <span>{card.effect}</span>
                        </div>
                        <p className="mt-2 max-w-[20ch] text-[9.5px] font-medium leading-[1.25] tracking-[-0.02em] opacity-0 blur-[3px] transition-[transform,filter,opacity] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/hover-card:opacity-100 group-data-[active=true]/hover-card:blur-none group-data-[active=true]/hover-card:delay-150 motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none">
                          {card.bio}
                        </p>
                      </div>
                      <div className="relative border-t border-black/25 pt-1.5 opacity-0 blur-[2px] transition-[transform,filter,opacity] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/hover-card:opacity-100 group-data-[active=true]/hover-card:blur-none group-data-[active=true]/hover-card:delay-200 motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none">
                        <p className="text-[10px] font-semibold leading-none tracking-[-0.02em]">
                          {card.name}
                        </p>
                        <p className="mt-0.5 text-[6px] uppercase tracking-[0.08em] text-black/55">
                          {card.role}
                        </p>
                      </div>
                    </article>
                  }
                  className={cn(
                    "group/hover-card h-full min-h-0 w-full [container-type:inline-size]",
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Soft edge fades so the loop feels continuous */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f8f8f5] to-transparent dark:from-zinc-950"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f8f8f5] to-transparent dark:from-zinc-950"
      />

      <style>{`@keyframes hover-transition-card-strip { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
