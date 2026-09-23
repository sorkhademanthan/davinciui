"use client";

import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

export interface Profile {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  /** Passed straight to the portrait `object-position` so each face is framed correctly. */
  objectPosition?: string;
  href?: string;
}

export interface ProfileCarouselProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  profiles: Profile[];
  initialIndex?: number;
  loop?: boolean;
  draggable?: boolean;
  transitionDuration?: number;
  /** Optional autoplay. Off by default — pass `true` to opt in. */
  autoplay?: boolean;
  /** Delay between automatic steps in ms. Minimum 2500ms. */
  autoplayInterval?: number;
  className?: string;
  onProfileClick?: (profile: Profile) => void;
  onIndexChange?: (index: number) => void;
}

const GAP = 20;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Drag distance (as a fraction of one card step) required to change slides. */
const DRAG_THRESHOLD = 0.22;

const mod = (n: number, m: number) => ((n % m) + m) % m;

interface Slot {
  key: string;
  profile: Profile;
  /** Index of this slot inside the extended (cloned) track. */
  slot: number;
}

export function ProfileCarousel({
  profiles,
  initialIndex = 0,
  loop = true,
  draggable = true,
  transitionDuration = 600,
  autoplay = false,
  autoplayInterval = 5000,
  className,
  onProfileClick,
  onIndexChange,
  onKeyDown,
  ...props
}: ProfileCarouselProps) {
  const count = profiles.length;
  const canLoop = loop && count > 1;
  const copies = canLoop ? 3 : 1;
  /** First slot of the middle (real) copy inside the extended track. */
  const origin = canLoop ? count : 0;

  const viewportRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const reduceMotionRef = React.useRef(false);
  const [, forceMotion] = React.useState(0);

  const [pos, setPos] = React.useState(() =>
    count === 0 ? 0 : origin + mod(initialIndex, count),
  );
  const [dragging, setDragging] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [metrics, setMetrics] = React.useState({ step: 264, viewportW: 1280 });

  const posRef = React.useRef(pos);
  posRef.current = pos;
  const instantRef = React.useRef(false);
  const dragRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    lastX: number;
    dx: number;
    active: boolean;
    horizontal: boolean | null;
  } | null>(null);

  // Keep the extended position in sync when the dataset changes.
  const initialRef = React.useRef({ count, origin, initialIndex });
  React.useEffect(() => {
    const prev = initialRef.current;
    if (
      prev.count !== count ||
      prev.origin !== origin ||
      prev.initialIndex !== initialIndex
    ) {
      initialRef.current = { count, origin, initialIndex };
      instantRef.current = true;
      setPos(count === 0 ? 0 : origin + mod(initialIndex, count));
    }
  }, [count, origin, initialIndex]);

  // Reduced-motion preference — movement becomes instant.
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduceMotionRef.current = query.matches;
      forceMotion((v) => v + 1);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const reducedMotion = reduceMotionRef.current;
  const duration = reducedMotion ? 0 : transitionDuration;

  // Measure one card slot + viewport so a navigation step is exactly
  // `cardWidth + gap` at any breakpoint.
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const cardW = first ? first.getBoundingClientRect().width : 244;
      setMetrics((prev) => {
        const step = cardW + GAP;
        const viewportW = viewport.clientWidth || prev.viewportW;
        if (
          Math.abs(prev.step - step) < 0.5 &&
          Math.abs(prev.viewportW - viewportW) < 0.5
        ) {
          return prev;
        }
        return { step, viewportW };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [copies, count]);

  const { step, viewportW } = metrics;
  const cardW = step - GAP;
  // Resting inset: the leading card stays ~45% clipped so the viewport
  // always reads partial + full cards + partial (loop mode only).
  const leadPad = canLoop ? 20 - cardW * 0.45 : 20;
  // Slot offset (from the leading slot) that renders as the detail card:
  // centered on wide screens, adjacent on handsets.
  const detailOffset = viewportW / step >= 3.25 ? 2 : 1;

  const xFor = React.useCallback(
    (p: number) => leadPad - p * step,
    [leadPad, step],
  );

  const realIndex = count === 0 ? 0 : mod(posRef.current - origin, count);
  const detailSlot = pos + detailOffset;

  const extended = React.useMemo<Slot[]>(() => {
    if (count === 0) return [];
    return Array.from({ length: count * copies }, (_, i) => {
      const profile = profiles[i % count]!;
      return {
        key: `${profile.id}--${Math.floor(i / count)}`,
        profile,
        slot: i,
      };
    });
  }, [profiles, count, copies]);

  const maxPos = React.useMemo(() => {
    if (canLoop || count === 0) return Number.POSITIVE_INFINITY;
    const visible = Math.max(1, Math.ceil((viewportW - leadPad) / step));
    return Math.max(0, count - visible);
  }, [canLoop, count, viewportW, leadPad, step]);

  const goTo = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      let target = canLoop ? next : Math.min(Math.max(next, 0), maxPos);
      if (canLoop && reduceMotionRef.current) {
        // No animated transition runs in reduced-motion mode, so normalize
        // into the middle copy immediately — visually identical, no drift.
        target = origin + mod(target - origin, count);
      }
      setPos(target);
      const real = mod(target - origin, count);
      onIndexChange?.(real);
    },
    [count, canLoop, maxPos, origin, onIndexChange],
  );

  const stepBy = React.useCallback(
    (dir: 1 | -1) => goTo(posRef.current + dir),
    [goTo],
  );

  // GPU-accelerated positioning — the track only ever moves via transform.
  const prevStepRef = React.useRef(step);
  React.useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || dragRef.current?.active) return;
    const instant = instantRef.current || prevStepRef.current !== step;
    prevStepRef.current = step;
    instantRef.current = false;
    track.style.transition =
      instant || duration === 0
        ? "none"
        : `transform ${duration}ms ${EASE}`;
    track.style.transform = `translate3d(${xFor(posRef.current)}px, 0, 0)`;
  });

  // Seamless loop: after the animated transition lands inside a cloned
  // copy, jump back to the identical real slot with no transition.
  const handleTransitionEnd = React.useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== trackRef.current || !canLoop) return;
      const p = posRef.current;
      const rel = p - origin;
      if (rel < 0 || rel >= count) {
        const shift = Math.floor(rel / count) * count;
        if (shift !== 0) {
          instantRef.current = true;
          setPos(p - shift);
        }
      }
    },
    [canLoop, count, origin],
  );

  // Optional autoplay — paused on hover/focus, interaction, or reduced motion.
  React.useEffect(() => {
    if (!autoplay || paused || reducedMotion || count < 2) return;
    const id = window.setTimeout(
      () => stepBy(1),
      Math.max(autoplayInterval, 2500),
    );
    return () => window.clearTimeout(id);
  }, [autoplay, paused, reducedMotion, count, autoplayInterval, stepBy, pos]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || count < 2 || dragging) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a")) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: xFor(posRef.current),
      lastX: event.clientX,
      dx: 0,
      active: false,
      horizontal: null,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || event.pointerId !== d.pointerId) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;

    if (d.horizontal === null && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!d.horizontal) {
        dragRef.current = null;
        return;
      }
    }
    if (d.horizontal === false) return;
    if (!d.active && Math.abs(dx) > 6) {
      d.active = true;
      setDragging(true);
      try {
        viewportRef.current?.setPointerCapture(d.pointerId);
      } catch {
        /* noop */
      }
    }
    if (!d.active) return;
    d.lastX = event.clientX;
    d.dx = dx;
    const track = trackRef.current;
    if (track) {
      track.style.transition = "none";
      track.style.transform = `translate3d(${d.baseX + dx}px, 0, 0)`;
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || event.pointerId !== d.pointerId) return;
    dragRef.current = null;
    if (!d.active) return;
    setDragging(false);
    const p = posRef.current;
    if (d.dx <= -step * DRAG_THRESHOLD) {
      goTo(p + 1);
    } else if (d.dx >= step * DRAG_THRESHOLD) {
      goTo(p - 1);
    } else {
      // Snap back to the current slot.
      const track = trackRef.current;
      if (track) {
        track.style.transition =
          duration === 0 ? "none" : `transform ${duration}ms ${EASE}`;
        track.style.transform = `translate3d(${xFor(p)}px, 0, 0)`;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepBy(-1);
    }
  };

  if (count === 0) return null;
  const activeProfile = profiles[realIndex];

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Team profiles"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cn(
        "relative w-full overflow-hidden bg-white py-14 transition-colors duration-300 [container-type:inline-size] sm:py-20 lg:py-24 dark:bg-[#0a0a0b]",
        className,
      )}
      {...props}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {activeProfile
          ? `Profile ${realIndex + 1} of ${count}: ${activeProfile.name}`
          : undefined}
      </span>

      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          touchAction: "pan-y",
          cursor: dragging ? "grabbing" : draggable ? "grab" : undefined,
        }}
        className="w-full overflow-hidden"
      >
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{ columnGap: GAP }}
          className="flex w-max flex-nowrap items-stretch will-change-transform"
        >
          {extended.map((slot) =>
            slot.slot === detailSlot ? (
              <DetailCard
                key={slot.key}
                profile={slot.profile}
                onProfileClick={onProfileClick}
              />
            ) : (
              <PortraitCard key={slot.key} profile={slot.profile} />
            ),
          )}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous profile"
            onClick={(event) => {
              event.stopPropagation();
              stepBy(-1);
            }}
            className="absolute left-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-zinc-900 shadow-[0_2px_12px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06] transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 active:scale-95 sm:left-5 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-zinc-800 dark:focus-visible:ring-white/50"
          >
            <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next profile"
            onClick={(event) => {
              event.stopPropagation();
              stepBy(1);
            }}
            className="absolute right-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-zinc-900 shadow-[0_2px_12px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.06] transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 active:scale-95 sm:right-5 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-zinc-800 dark:focus-visible:ring-white/50"
          >
            <ChevronRight
              className="size-4"
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        </>
      )}
    </section>
  );
}

const cardClassName =
  "w-[clamp(200px,32cqw,244px)] shrink-0 grow-0 [aspect-ratio:240/368] select-none overflow-hidden rounded-[14px] bg-zinc-100 dark:bg-zinc-900";

function PortraitCard({ profile }: { profile: Profile }) {
  return (
    <div className={cn(cardClassName, "shadow-[0_8px_24px_rgba(0,0,0,0.07)]")}>
      <img
        src={profile.image}
        alt={profile.name}
        draggable={false}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
        style={{ objectPosition: profile.objectPosition ?? "50% 30%" }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function DetailCard({
  profile,
  onProfileClick,
}: {
  profile: Profile;
  onProfileClick?: (profile: Profile) => void;
}) {
  return (
    <div
      className={cn(
        cardClassName,
        "flex flex-col bg-white shadow-[0_12px_32px_rgba(0,0,0,0.09)] dark:bg-zinc-950 dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
      )}
    >
      <div className="relative h-[57%] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img
          src={profile.image}
          alt={profile.name}
          draggable={false}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          style={{ objectPosition: profile.objectPosition ?? "50% 20%" }}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-3.5 pt-3 text-left">
        <h3 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-zinc-950 dark:text-zinc-50">
          {profile.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12px] font-normal leading-[1.45] text-zinc-600 dark:text-zinc-400">
          {profile.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {profile.category}
          </span>
          {profile.href ? (
            <a
              href={profile.href}
              onClick={(event) => {
                event.stopPropagation();
                onProfileClick?.(profile);
              }}
              className="inline-flex h-8 shrink-0 items-center rounded-full bg-zinc-950 px-4 text-[12px] font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-zinc-950"
            >
              View Profile
            </a>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onProfileClick?.(profile);
              }}
              aria-label={`View profile of ${profile.name}`}
              className="inline-flex h-8 shrink-0 items-center rounded-full bg-zinc-950 px-4 text-[12px] font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/40 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-white/60 dark:focus-visible:ring-offset-zinc-950"
            >
              View Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileCarousel;
