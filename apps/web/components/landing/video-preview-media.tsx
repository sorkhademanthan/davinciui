"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useInViewport } from "@/hooks/use-in-viewport";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import {
  contentfulPreviewSource,
  homePreviewMedia,
  type HomePreviewOverrides,
  type HomePreviewTheme,
} from "@/lib/home-preview-media";

const PREVIEW_MEDIA_VERSION = "6";

type PreviewMediaContextValue = {
  overrides: HomePreviewOverrides;
  theme: HomePreviewTheme;
  mounted: boolean;
};

const HomePreviewMediaContext = React.createContext<PreviewMediaContextValue>({
  overrides: {},
  theme: "dark",
  mounted: false,
});

export function HomePreviewMediaProvider({
  value,
  children,
}: {
  value: HomePreviewOverrides;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [domTheme, setDomTheme] = React.useState<"dark" | "light" | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const readTheme = () => {
      if (root.classList.contains("dark")) {
        setDomTheme("dark");
      } else if (root.classList.contains("light")) {
        setDomTheme("light");
      } else {
        setDomTheme(
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
        );
      }
    };
    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const theme: HomePreviewTheme =
    mounted && (domTheme ?? resolvedTheme) === "light" ? "light" : "dark";

  return (
    <HomePreviewMediaContext.Provider value={{ overrides: value, theme, mounted }}>
      {children}
    </HomePreviewMediaContext.Provider>
  );
}

export function usePreviewMedia() {
  return React.useContext(HomePreviewMediaContext);
}

export function useContentfulPreviewSource(slug: string) {
  const { overrides, theme } = usePreviewMedia();
  return contentfulPreviewSource(slug, theme, overrides);
}

function withMediaVersion(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}v=${PREVIEW_MEDIA_VERSION}`;
}

export function CmsPreviewVideo({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const source = useContentfulPreviewSource(slug);
  const { ref, inView } = useInViewport({ rootMargin: "160px 0px" });
  if (!source) return <>{children}</>;

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <video
          key={source.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          aria-hidden="true"
        >
          <source src={withMediaVersion(source.src)} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}

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
  const reduceMotion = useHydratedReducedMotion();
  const { overrides, theme, mounted } = usePreviewMedia();
  const { ref, inView } = useInViewport({ rootMargin: "300px 0px" });
  const [live, setLive] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const media = homePreviewMedia(slug, theme, overrides);
  const source = media.sources[0];
  const poster = withMediaVersion(media.poster);
  const showVideo =
    mounted && inView && !reduceMotion && !live && !failed && Boolean(source);

  React.useEffect(() => {
    setFailed(false);
    setPlaying(false);
  }, [source?.src]);

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
              src={poster}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            {showVideo ? (
              <video
                key={`${theme}-${source?.src ?? "none"}-v${PREVIEW_MEDIA_VERSION}`}
                ref={videoRef}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
                  playing ? "opacity-100" : "opacity-0"
                }`}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                poster={poster}
                aria-hidden="true"
                tabIndex={-1}
                onPlaying={() => setPlaying(true)}
                onError={() => setFailed(true)}
              >
                {media.sources.map((source) => (
                  <source
                    key={source.src}
                    src={withMediaVersion(source.src)}
                    type={source.type}
                  />
                ))}
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
