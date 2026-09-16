"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ComponentCardLivePreview } from "@/components/component-card-live-preview";
import { components } from "@/registry";

// Scroll-driven experiences showcased on this page.
// scroll-reveal-image is featured first.
const SCROLL_ANIMATION_ORDER = [
  "scroll-reveal-image",
  "stacked-scroll-gallery",
  "cms-scroll-gallery",
  "scroll-choreography",
  "scroll-tilted-grid",
  "scroll-split-card",
  "sticky-scroll-cards",
] as const;

const LIVE_CARD_SLUGS = new Set<string>([
  "scroll-reveal-image",
  "cms-scroll-gallery",
  "stacked-scroll-gallery",
]);

function getSources(url?: string) {
  if (!url) return null;
  const m = url.match(/^(.*)\.(mov|mp4|webm)(\?.*)?$/i);
  if (!m) return { webm: url, mp4: url };
  const base = m[1];
  const q = m[3] || "";
  return { webm: `${base}.webm${q}`, mp4: `${base}.mp4${q}` };
}

export default function ScrollAnimationsPage() {
  const cards = SCROLL_ANIMATION_ORDER.map((slug) => components[slug]).filter(
    (c): c is (typeof components)[string] => Boolean(c),
  );

  return (
    <div className="w-full max-w-[1280px] px-6 lg:px-8 py-6">
      <Breadcrumbs className="mb-4" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Scroll Animations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scroll-driven showcases — pin, scrub and reveal as you scroll.
            Click a card to open docs with live preview.
          </p>
        </div>
        <Link
          href="/experience/components?tab=Scroll"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          All scroll components <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const sources = getSources(c.previewVideo);
          return (
            <Link
              key={c.slug}
              href={`/experience/components/${c.slug}`}
              className="group relative flex flex-col rounded-2xl border border-border bg-white dark:bg-zinc-900/50 overflow-hidden hover:border-input hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="p-1.5">
                <div className="relative h-48 rounded-xl border border-border bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  {sources ? (
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full object-cover"
                    >
                      <source src={sources.webm} type="video/webm" />
                      <source src={sources.mp4} type="video/mp4" />
                    </video>
                  ) : c.previewImage ? (
                    <img
                      src={c.previewImage}
                      alt={c.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : LIVE_CARD_SLUGS.has(c.slug) ? (
                    <ComponentCardLivePreview
                      slug={c.slug as "scroll-reveal-image" | "cms-scroll-gallery" | "stacked-scroll-gallery"}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/[0.04] via-transparent to-transparent dark:from-white/[0.04] flex items-center justify-center">
                      <div className="size-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center text-xs font-mono shadow-sm">
                        {c.title.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/90 dark:bg-black/50 border border-border backdrop-blur">
                    {c.category || "component"}
                  </span>
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
