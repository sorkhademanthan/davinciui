"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useInViewport } from "@/hooks/use-in-viewport";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { homePreviewMedia } from "@/lib/home-preview-media";

/**
 * Lightweight card media: a muted looping video (light/dark variants) that
 * only mounts while near the viewport, with the real interactive component
 * mounted on click. Falls back to the poster if video can't play.
 */
export function VideoPreviewMedia({
  slug,
  title,
  tag,
  heightClass,
  children,
}: {
  slug: string;
  title: string;
  tag: string;
  heightClass?: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const reduceMotion = useHydratedReducedMotion();
  const { ref, inView } = useInViewport({ rootMargin: "300px 0px" });
  const [live, setLive] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  const theme = mounted && resolvedTheme === "light" ? "light" : "dark";
  const media = homePreviewMedia(slug, theme);
  const showVideo = mounted && inView && !reduceMotion && !live && !failed;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView) {
      const attempt = video.play();
      if (attempt) attempt.catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, showVideo]);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-[14px] bg-zinc-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.045)] dark:bg-background dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)] ${heightClass ?? "h-[240px] sm:h-[260px]"}`}
    >
      <div className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]">
        {live ? (
          <div className="absolute inset-0">{children}</div>
        ) : (
          <div className="absolute inset-0">
            <img
              src={media.poster}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
              onError={() => setFailed(true)}
            />
            {showVideo ? (
              <video
                key={theme}
                ref={videoRef}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
                  playing ? "opacity-100" : "opacity-0"
                }`}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={media.poster}
                aria-hidden="true"
                tabIndex={-1}
                onPlaying={() => setPlaying(true)}
                onError={() => setFailed(true)}
              >
                <source src={media.webm} type="video/webm" />
                <source src={media.mp4} type="video/mp4" />
              </video>
            ) : null}
          </div>
        )}
      </div>

      {live ? (
        <>
          <span className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-zinc-700 backdrop-blur-md dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-200">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Live
          </span>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setLive(false);
            }}
            className="absolute bottom-3 right-3 z-30 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-zinc-700 backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-200 dark:hover:bg-black/70"
            aria-label={`Switch ${title} back to video preview`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
            </svg>
            Watch video
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setLive(true)}
          className="absolute inset-0 z-20 cursor-pointer rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset"
          aria-label={`Play ${title} live preview`}
        >
          <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-zinc-700 backdrop-blur-md transition-colors group-hover:bg-white dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-200 dark:group-hover:bg-black/70">
            <svg
              viewBox="0 0 24 24"
              className="size-3 fill-current"
              aria-hidden="true"
            >
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
            </svg>
            Live preview
          </span>
        </button>
      )}

      <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[11px] font-semibold tracking-tight text-zinc-700 backdrop-blur-md dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-200">
        {tag}
      </span>
      <span className="pointer-events-none absolute inset-0 z-10 rounded-[14px] ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]" />
    </div>
  );
}
