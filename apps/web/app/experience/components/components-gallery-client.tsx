"use client";

import { Suspense, useEffect, useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpRight, Play } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ComponentCardLivePreview } from "@/components/component-card-live-preview";
import {
  useContentfulPreviewSource,
  usePreviewMedia,
} from "@/components/landing/video-preview-media";
import { homePreviewMedia } from "@/lib/home-preview-media";
import {
  isBasicPreviewSlug,
  type BasicPreviewSlug,
} from "@/components/docs/previews/basic-component-card-slugs";
import { components, sortByFeatured, getFeaturedRank } from "@/registry";
import { BASIC_GROUPS, BASIC_SUBS } from "@/lib/component-groups";
import { TEXT_ANIMATION_ORDER } from "@/lib/text-animation-slugs";
import { useHydratedReducedMotion } from "@/hooks/use-hydrated-reduced-motion";
import { useInViewport } from "@/hooks/use-in-viewport";
import { cn } from "@/lib/utils";
import { isHiddenComponentSlug } from "@/lib/hidden-components";

const BASIC_SLUGS: Record<string, string[]> = BASIC_GROUPS;
const BASIC_ALL = Object.values(BASIC_SLUGS).flat();

// Scroll-driven experiences showcased under Components > Scroll.
const SCROLL_SLUGS = new Set([
  "scroll-media-expand",
  "interactive-media-accordion",
  "stacked-scroll-gallery",
  "scroll-reveal-image",
  "scroll-timeline",
  "wavy-flow-carousel",
]);

// Cards whose grid preview is a still image only: the live component is never
// mounted here, no video/timer/RAF runs, and the preview area ignores pointer
// events. The card itself still links to the component page.
const STATIC_CARD_SLUGS = new Set(["cms-media-bento", "pixel-wipe-carousel"]);

// Fixed design-frame previews that must keep a 16:9 surface so the whole
// composition (label, strip, counter, bar) is visible at every card width.
const WIDE_CARD_SLUGS = new Set([
  "glitch-shred-preloader",
  "editorial-card-arc-preloader",
  "masked-arc-preloader",
]);

const TOP_FILTERS = [
  "All",
  "Basic",
  "Text Animations",
  "Premium Components",
  "Hero Backgrounds",
  "Visual Effects",
  "Preloaders",
  "Interactions",
  "Cursor Effects",
  "Scroll",
] as const;

const BASIC_SUBS_ALL: readonly string[] = BASIC_SUBS;

// Featured-first order for the Text Animations gallery.
// Mirrors the global FEATURED_SLUGS relative order so the shuffled
// mix stays consistent across All + Text tabs.
const TEXT_ANIMATION_RANK = new Map<string, number>(
  TEXT_ANIMATION_ORDER.map((slug, index) => [slug, index]),
);

type TopFilter = (typeof TOP_FILTERS)[number];
type BasicSub = (typeof BASIC_SUBS)[number];

function getPreviewSources(url?: string) {
  if (!url) return null;
  const m = url.match(/^(.*)\.(mov|mp4|webm)(\?.*)?$/i);
  if (!m) return { webm: url, mp4: url };
  return { webm: `${m[1]}.webm${m[3] || ""}`, mp4: `${m[1]}.mp4${m[3] || ""}` };
}

function GalleryCardMedia({
  slug,
  title,
  previewVideo,
  previewImage,
  play,
  onActivate,
  className,
}: {
  slug: string;
  title: string;
  previewVideo?: string;
  previewImage?: string;
  play: boolean;
  onActivate?: () => void;
  className: string;
}) {
  const cms = useContentfulPreviewSource(slug);
  const { theme, overrides } = usePreviewMedia();
  const reduceMotion = useHydratedReducedMotion();
  const sources = getPreviewSources(previewVideo);
  const { ref, inView } = useInViewport({ rootMargin: "160px 0px" });
  const hasVideo = Boolean(cms || sources);
  const poster = hasVideo
    ? homePreviewMedia(slug, theme, overrides).poster
    : undefined;
  const shouldPlay = play && inView && !reduceMotion;
  const [posterFailed, setPosterFailed] = useState(false);
  let media: ReactNode = null;

  useEffect(() => {
    setPosterFailed(false);
  }, [poster]);

  if (STATIC_CARD_SLUGS.has(slug)) {
    // Static still: no live component, no video request, no timers/RAF.
    media = (
      <img
        src={`/preview-stills/${slug}-${theme}.webp`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
        decoding="async"
      />
    );
  } else if (hasVideo) {
    // Poster-first: the video is not requested until the card is hovered,
    // focused, or tapped, so idle cards cost a poster instead of a video.
    media = (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/[0.06] via-transparent to-transparent dark:from-white/[0.06]" />
        {poster && !posterFailed ? (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setPosterFailed(true)}
          />
        ) : null}
        {shouldPlay ? (
          <video
            key={cms?.src ?? sources?.mp4}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={poster}
            className="absolute inset-0 size-full object-cover"
            aria-hidden="true"
          >
            {cms ? (
              <source src={cms.src} type="video/mp4" />
            ) : (
              <>
                <source src={sources!.webm} type="video/webm" />
                <source src={sources!.mp4} type="video/mp4" />
              </>
            )}
          </video>
        ) : null}
        {!shouldPlay && !reduceMotion && onActivate ? (
          <span
            role="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onActivate();
            }}
            className="absolute inset-0 z-10 hidden cursor-pointer items-center justify-center [@media(hover:none)]:flex"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
              <Play className="size-5 fill-current" aria-hidden="true" />
            </span>
          </span>
        ) : null}
      </>
    );
  } else if (previewImage) {
    media = (
      <img
        src={previewImage}
        alt={title}
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
        decoding="async"
      />
    );
  } else if (hasLiveCardPreview(slug) && inView) {
    media = <ComponentCardLivePreview slug={slug} />;
  }

  if (!media) {
    media = (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900/[0.04] via-transparent to-transparent dark:from-white/[0.04]">
        <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 text-xs font-mono text-white shadow-sm dark:bg-white dark:text-zinc-900">
          {title.slice(0, 2).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        className,
        "overflow-hidden",
        STATIC_CARD_SLUGS.has(slug) && "pointer-events-none select-none",
      )}
    >
      {media}
    </div>
  );
}

function hasLiveCardPreview(
  slug: string,
): slug is
  | "gsap-text"
  | "text-morph"
  | "shake-text"
  | "encrypted-text"
  | "fluid-particle-text"
  | "glitch-liquid-text"
  | "ink-flow"
  | "silk-aurora"
  | "soft-fluid-gradient"
  | "media-text-hover"
  | "text-video-mask"
  | "random-text-reveal"
  | "shader-text"
  | "rolling-text"
  | "character-field"
  | "curved-inline-type"
  | "wavy-flow-carousel"
  | "pixel-flow"
  | "pixel-wipe-carousel"
  | "cinematic-card-carousel"
  | "focus-carousel"
  | "ambient-strip"
  | "arc-carousel"
  | "arcwave-carousel"
  | "streamline-carousel"
  | "depth-carousel-3d"
  | "tilt-flip-polaroid"
  | "crumpled-paper-reveal"
  | "radial-fan-deck"
  | "neon-mesh-bg"
  | "spectra-noise"
  | "noiser"
  | "sunlight-effect"
  | "hover-cards"
  | "profile-carousel"
  | "glass-scene-dock"
  | "lens-drift-grid"
  | "orbit-spiral-gallery"
  | "infinite-image-gallery"
  | "circular-gallery"
  | "curve-wall"
  | "spiral-media-gallery"
  | "3d-flow-gallery"
  | "liquid-reveal-button"
  | "animated-metric"
  | "nudge-button"
  | "ambient-audio-toggle"
  | "interaction-sound-kit"
  | "voice-recorder"
  | "keyboard-command-sounds"
  | "upload-sound-status"
  | "motion-hamburger"
  | "liquid-chrome-button"
  | "scroll-reveal-image"
  | "cms-media-bento"
  | "interactive-media-accordion"
  | "stacked-scroll-gallery"
  | "scroll-media-expand"
  | "scroll-timeline"
  | "fill-preloader"
  | "staircase-preloader"
  | "pixel-preloader"
  | "editorial-wipe-preloader"
  | "geometric-preloader"
  | "cinematic-panel-preloader"
  | "glitch-shred-preloader"
  | "editorial-card-arc-preloader"
  | "masked-arc-preloader"
  | "wave-bars-loader"
  | "electric-vijdi-cursor"
  | "circle-cursor"
  | "tubes-cursor"
  | "magic-cursor-pro"
  | "chromatic-cursor"
  | "geometric-trail-cursor"
  | "elastic-blob-cursor"
  | BasicPreviewSlug {
  return (
    slug === "gsap-text" ||
    slug === "text-morph" ||
    slug === "shake-text" ||
    slug === "encrypted-text" ||
    slug === "fluid-particle-text" ||
    slug === "glitch-liquid-text" ||
    slug === "ink-flow" ||
    slug === "silk-aurora" ||
    slug === "soft-fluid-gradient" ||
    slug === "media-text-hover" ||
    slug === "text-video-mask" ||
    slug === "random-text-reveal" ||
    slug === "shader-text" ||
    slug === "text-reveal" ||
    slug === "rolling-text" ||
    slug === "character-field" ||
    slug === "curved-inline-type" ||
    slug === "wavy-flow-carousel" ||
    slug === "pixel-flow" ||
    slug === "pixel-wipe-carousel" ||
    slug === "cinematic-card-carousel" ||
    slug === "focus-carousel" ||
    slug === "ambient-strip" ||
    slug === "arc-carousel" ||
    slug === "arcwave-carousel" ||
    slug === "streamline-carousel" ||
    slug === "depth-carousel-3d" ||
    slug === "tilt-flip-polaroid" ||
    slug === "crumpled-paper-reveal" ||
    slug === "radial-fan-deck" ||
    slug === "neon-mesh-bg" ||
    slug === "spectra-noise" ||
    slug === "noiser" ||
    slug === "sunlight-effect" ||
    slug === "vertical-image-marquee" ||
    slug === "hover-cards" ||
    slug === "profile-carousel" ||
    slug === "services-showcase" ||
    slug === "glass-scene-dock" ||
    slug === "lens-drift-grid" ||
    slug === "orbit-spiral-gallery" ||
    slug === "infinite-image-gallery" ||
    slug === "circular-gallery" ||
    slug === "curve-wall" ||
    slug === "spiral-media-gallery" ||
    slug === "3d-flow-gallery" ||
    slug === "liquid-reveal-button" ||
    slug === "animated-metric" ||
    slug === "nudge-button" ||
    slug === "animated-pill-button" ||
    slug === "burn-plus" ||
    slug === "team-slide-reveal" ||
    slug === "hover-transition" ||
    slug === "ambient-audio-toggle" ||
    slug === "interaction-sound-kit" ||
    slug === "voice-recorder" ||
    slug === "keyboard-command-sounds" ||
    slug === "upload-sound-status" ||
    slug === "motion-hamburger" ||
    slug === "liquid-chrome-button" ||
    slug === "scroll-reveal-image" ||
    slug === "cms-media-bento" ||
    slug === "interactive-media-accordion" ||
    slug === "stacked-scroll-gallery" ||
    slug === "scroll-media-expand" ||
    slug === "scroll-timeline" ||
    slug === "fill-preloader" ||
    slug === "staircase-preloader" ||
    slug === "pixel-preloader" ||
    slug === "editorial-wipe-preloader" ||
    slug === "geometric-preloader" ||
    slug === "cinematic-panel-preloader" ||
    slug === "glitch-shred-preloader" ||
    slug === "editorial-card-arc-preloader" ||
    slug === "masked-arc-preloader" ||
    slug === "editorial-curtain-preloader" ||
    slug === "wave-bars-loader" ||
    slug === "electric-vijdi-cursor" ||
    slug === "circle-cursor" ||
    slug === "tubes-cursor" ||
    slug === "magic-cursor-pro" ||
    slug === "chromatic-cursor" ||
    slug === "geometric-trail-cursor" ||
    slug === "elastic-blob-cursor" ||
    isBasicPreviewSlug(slug)
  );
}
function validTop(value: string | null): TopFilter | null {
  if (!value) return null;
  return (TOP_FILTERS as readonly string[]).includes(value)
    ? (value as TopFilter)
    : null;
}

function validSub(value: string | null): BasicSub | null {
  if (!value) return null;
  return (BASIC_SUBS_ALL as readonly string[]).includes(value)
    ? (value as BasicSub)
    : null;
}

export default function ComponentsGalleryPage() {
  return (
    <Suspense>
      <ComponentsGallery />
    </Suspense>
  );
}

function ComponentsGallery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [activeTop, setActiveTop] = useState<TopFilter>(
    () => validTop(searchParams.get("tab")) ?? "All",
  );
  const [activeSub, setActiveSub] = useState<BasicSub>(
    () => validSub(searchParams.get("sub")) ?? "All",
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Keep the active tabs in the URL so browser-back, reloads and shared
  // links restore the exact filtered view.
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTop !== "All") params.set("tab", activeTop);
    if (activeTop === "Basic" && activeSub !== "All")
      params.set("sub", activeSub);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [activeTop, activeSub, pathname, router]);

  const all = useMemo(() => sortByFeatured(Object.values(components)), []);

  // Slugs hidden from the gallery grid. The components themselves (docs,
  // registry, source) stay intact — they just don't get a card here.
  // Categories that are no longer part of the website's component IA. Their
  // members must not leak into the "All" tab (or search), matching the
  // sidebar, which no longer lists these categories.
  const HIDDEN_CATEGORIES = useMemo(() => new Set(["Motion", "Sound"]), []);

  const filtered = useMemo(() => {
    const matches = all.filter((c) => {
      if (isHiddenComponentSlug(c.slug)) return false;
      if (HIDDEN_CATEGORIES.has(c.category)) return false;
      const matchesSearch =
        !q.trim() ||
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        c.description.toLowerCase().includes(q.toLowerCase());
      if (!matchesSearch) return false;
      // "All" showcases non-Basic work — Basics live under the Basic tab.
      // A search query still spans everything so nothing is undiscoverable.
      if (activeTop === "All") {
        if (BASIC_ALL.includes(c.slug)) return q.trim() !== "";
        return true;
      }
      if (activeTop === "Basic") {
        if (activeSub === "All") return BASIC_ALL.includes(c.slug);
        return (BASIC_SLUGS[activeSub] || []).includes(c.slug);
      }
      if (activeTop === "Text Animations")
        return c.category === "Text Animations" || c.extraCategories?.includes("Text Animations");
      if (activeTop === "Premium Components")
        return c.category === "Premium Components" || c.extraCategories?.includes("Premium Components");
      if (activeTop === "Hero Backgrounds")
        return c.category === "Hero Backgrounds" || c.extraCategories?.includes("Hero Backgrounds");
      if (activeTop === "Visual Effects")
        return c.category === "Visual Effects" || c.extraCategories?.includes("Visual Effects");
      if (activeTop === "Preloaders") return c.category === "Preloaders" || c.extraCategories?.includes("Preloaders");
      if (activeTop === "Interactions") return c.category === "Interactions" || c.extraCategories?.includes("Interactions");
      if (activeTop === "Cursor Effects")
        return c.category === "Cursor Effects" || c.extraCategories?.includes("Cursor Effects");
      if (activeTop === "Scroll") return SCROLL_SLUGS.has(c.slug);
      return false;
    });

    if (activeTop === "Text Animations") {
      return matches.sort((a, b) => {
        const aRank =
          TEXT_ANIMATION_RANK.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
        const bRank =
          TEXT_ANIMATION_RANK.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
        return aRank - bRank || a.title.localeCompare(b.title);
      });
    }

    // Every other tab (including "All") leads with the featured best,
    // then falls back to alphabetical — so your top 27 always show first.
    return [...matches].sort((a, b) => {
      const rankDiff = getFeaturedRank(a.slug) - getFeaturedRank(b.slug);
      if (rankDiff !== 0) return rankDiff;
      return a.title.localeCompare(b.title);
    });
  }, [q, activeTop, activeSub, all, HIDDEN_CATEGORIES]);

  const handleTopChange = (t: TopFilter) => {
    setActiveTop(t);
    if (t !== "Basic") setActiveSub("All");
  };

  return (
    <div className="w-full max-w-[1280px] px-6 lg:px-8 py-6">
      <Breadcrumbs className="mb-4" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Components</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Production-ready components — click a card to open docs with live
            preview on the right.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search components…"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-white dark:bg-zinc-900 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TOP_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => handleTopChange(cat)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
              activeTop === cat
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                : "bg-white hover:bg-zinc-50 border-border text-muted-foreground hover:text-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeTop === "Basic" && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/40 pt-3">
          {BASIC_SUBS.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSub(sub)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
                activeSub === sub
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                  : "bg-zinc-50 hover:bg-zinc-100 border-border text-muted-foreground hover:text-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800",
              )}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const cardClassName =
            "group relative flex flex-col rounded-2xl border border-border bg-white dark:bg-zinc-900/50 overflow-hidden hover:border-input hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300";
          const cardContent = (
            <>
              <div className="p-1.5">
                <div
                  className={cn(
                    "relative rounded-xl border border-border bg-zinc-100 dark:bg-zinc-900 overflow-hidden",
                    WIDE_CARD_SLUGS.has(c.slug) ? "aspect-video" : "h-48",
                  )}
                >
                  <GalleryCardMedia
                    slug={c.slug}
                    title={c.title}
                    previewVideo={c.previewVideo}
                    previewImage={c.previewImage}
                    play={activeSlug === c.slug}
                    onActivate={() => setActiveSlug(c.slug)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {!STATIC_CARD_SLUGS.has(c.slug) && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                  {c.slug !== "ambient-audio-toggle" && (
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/90 dark:bg-black/50 border border-border backdrop-blur">
                      {c.category || "component"}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4 pt-1">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  {c.title}{" "}
                  <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {c.description}
                </p>
              </div>
            </>
          );
          return (
            <Link
              key={c.slug}
              href={`/experience/components/${c.slug}`}
              className={cardClassName}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActiveSlug(c.slug);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "mouse") return;
                setActiveSlug((current) =>
                  current === c.slug ? null : current,
                );
              }}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) {
                  setActiveSlug(c.slug);
                }
              }}
              onBlur={() =>
                setActiveSlug((current) =>
                  current === c.slug ? null : current,
                )
              }
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No components match “{q}” in {activeTop}
            {activeTop === "Basic" && activeSub !== "All"
              ? ` › ${activeSub}`
              : ""}
            .
          </p>
          {activeTop === "Scroll" && (
            <div className="flex justify-center gap-2 text-xs">
              <Link
                href="/experience/components?tab=Scroll"
                className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900"
              >
                Go to Scroll →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
