"use client";

import { Suspense, useEffect, useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ComponentCardLivePreview } from "@/components/component-card-live-preview";
import { useContentfulPreviewSource } from "@/components/landing/video-preview-media";
import {
  isBasicPreviewSlug,
  type BasicPreviewSlug,
} from "@/components/docs/previews/basic-component-card-slugs";
import { components, sortByFeatured, getFeaturedRank } from "@/registry";
import { BASIC_GROUPS, BASIC_SUBS } from "@/lib/component-groups";
import { useInViewport } from "@/hooks/use-in-viewport";
import { cn } from "@/lib/utils";

const BASIC_SLUGS: Record<string, string[]> = BASIC_GROUPS;
const BASIC_ALL = Object.values(BASIC_SLUGS).flat();

// Scroll-driven experiences showcased under Components > Scroll.
const SCROLL_SLUGS = new Set([
  "scroll-media-expand",
  "cms-scroll-gallery",
  "interactive-media-accordion",
  "stacked-scroll-gallery",
  "scroll-sync-gallery",
  "scroll-reveal-image",
  "scroll-timeline",
  "wavy-flow-carousel",
]);

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
  "Motion",
  "Scroll",
] as const;

const BASIC_SUBS_ALL: readonly string[] = BASIC_SUBS;

// Featured-first order for the Text Animations gallery.
// Mirrors the global FEATURED_SLUGS relative order so the shuffled
// mix stays consistent across All + Text tabs.
const TEXT_ANIMATION_ORDER = [
  "gsap-text",
  "text-video-mask",
  "curved-inline-type",
  "shake-text",
  "rolling-text",
  "media-text-hover",
  "random-text-reveal",
  "text-morph",
  "text-reveal",
  "shader-text",
  "fluid-particle-text",
  "encrypted-text",
  "glitch-liquid-text",
] as const;
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
  className,
}: {
  slug: string;
  title: string;
  previewVideo?: string;
  previewImage?: string;
  className: string;
}) {
  const cms = useContentfulPreviewSource(slug);
  const sources = getPreviewSources(previewVideo);
  const { ref, inView } = useInViewport({ rootMargin: "160px 0px" });
  let media: ReactNode = null;

  if (cms) {
    if (inView) {
      media = (
        <video
          key={cms.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          aria-hidden="true"
        >
          <source src={cms.src} type="video/mp4" />
        </video>
      );
    }
  } else if (sources && inView) {
    media = (
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      >
        <source src={sources.webm} type="video/webm" />
        <source src={sources.mp4} type="video/mp4" />
      </video>
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
    <div ref={ref} className={cn(className, "overflow-hidden")}>
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
  | "text-reveal"
  | "rolling-text"
  | "character-field"
  | "curved-inline-type"
  | "wavy-flow-carousel"
  | "pixel-flow"
  | "pixel-wipe-carousel"
  | "segmented-image-carousel"
  | "cinematic-card-carousel"
  | "focus-carousel"
  | "ambient-strip"
  | "arc-carousel"
  | "arcwave-carousel"
  | "streamline-carousel"
  | "depth-carousel-3d"
  | "fanned-deck"
  | "tilt-flip-polaroid"
  | "crumpled-paper-reveal"
  | "radial-fan-deck"
  | "neon-mesh-bg"
  | "spectra-noise"
  | "noiser"
  | "sunlight-effect"
  | "vertical-image-marquee"
  | "hover-cards"
  | "profile-carousel"
  | "services-showcase"
  | "glass-scene-dock"
  | "lens-drift-grid"
  | "orbit-spiral-gallery"
  | "infinite-image-gallery"
  | "editorial-image-stack"
  | "circular-gallery"
  | "curve-wall"
  | "spiral-media-gallery"
  | "3d-flow-gallery"
  | "liquid-reveal-button"
  | "animated-metric"
  | "nudge-button"
  | "animated-pill-button"
  | "burn-plus"
  | "bookshelf"
  | "team-slide-reveal"
  | "hover-transition"
  | "ambient-audio-toggle"
  | "interaction-sound-kit"
  | "voice-recorder"
  | "keyboard-command-sounds"
  | "upload-sound-status"
  | "motion-hamburger"
  | "liquid-chrome-button"
  | "scroll-reveal-image"
  | "cms-media-bento"
  | "cms-scroll-gallery"
  | "interactive-media-accordion"
  | "stacked-scroll-gallery"
  | "scroll-sync-gallery"
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
  | "fluid-cursor"
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
    slug === "segmented-image-carousel" ||
    slug === "cinematic-card-carousel" ||
    slug === "focus-carousel" ||
    slug === "ambient-strip" ||
    slug === "arc-carousel" ||
    slug === "arcwave-carousel" ||
    slug === "streamline-carousel" ||
    slug === "depth-carousel-3d" ||
    slug === "fanned-deck" ||
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
    slug === "editorial-image-stack" ||
    slug === "circular-gallery" ||
    slug === "curve-wall" ||
    slug === "spiral-media-gallery" ||
    slug === "3d-flow-gallery" ||
    slug === "liquid-reveal-button" ||
    slug === "animated-metric" ||
    slug === "nudge-button" ||
    slug === "animated-pill-button" ||
    slug === "burn-plus" ||
    slug === "bookshelf" ||
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
    slug === "cms-scroll-gallery" ||
    slug === "interactive-media-accordion" ||
    slug === "stacked-scroll-gallery" ||
    slug === "scroll-sync-gallery" ||
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
    slug === "fluid-cursor" ||
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
  const HIDDEN_SLUGS = useMemo(
    () => new Set(["liquid-chrome", "animated-pill-button", "hover-transition"]),
    [],
  );

  const filtered = useMemo(() => {
    const matches = all.filter((c) => {
      if (HIDDEN_SLUGS.has(c.slug)) return false;
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
      if (activeTop === "Motion") return c.category === "Motion" || c.extraCategories?.includes("Motion");
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
  }, [q, activeTop, activeSub, all, HIDDEN_SLUGS]);

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
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
          {(activeTop === "Motion" || activeTop === "Scroll") && (
            <div className="flex justify-center gap-2 text-xs">
              {activeTop === "Motion" && (
                <Link
                  href="/docs/motion/components"
                  className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900"
                >
                  Go to Motion →
                </Link>
              )}
              {activeTop === "Scroll" && (
                <Link
                  href="/experience/components?tab=Scroll"
                  className="px-3 py-1.5 rounded-full border bg-white hover:bg-zinc-50 dark:bg-zinc-900"
                >
                  Go to Scroll →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
