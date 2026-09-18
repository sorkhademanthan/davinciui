import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BellRing } from "lucide-react";

export interface ComingSoonTeaser {
  title: string;
  description: string;
}

export function ComingSoon({
  badge,
  title,
  description,
  teasers,
  browseHref = "/experience/components",
}: {
  badge: string;
  title: string;
  description: string;
  teasers: ComingSoonTeaser[];
  browseHref?: string;
}) {
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-zinc-900/50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.09]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 0.7px, transparent 0.8px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-zinc-100 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-zinc-800/80">
            <BellRing className="size-3.5" aria-hidden="true" />
            {badge}
          </span>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href={browseHref}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Browse components
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/experience/components"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              All galleries
            </Link>
          </div>
        </div>
      </div>

      {/* What's landing first */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Landing first
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {teasers.length}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teasers.map((teaser) => (
            <div
              key={teaser.title}
              className="group relative flex flex-col rounded-2xl border border-border bg-white p-4 transition-all duration-300 dark:bg-zinc-900/50"
            >
              {/* Skeleton preview — a hint of the shape to come */}
              <div
                aria-hidden="true"
                className="relative h-28 overflow-hidden rounded-xl border border-border bg-zinc-100 dark:bg-zinc-900"
              >
                <div className="absolute inset-x-6 top-5 h-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                <div className="absolute inset-x-10 top-10 h-2 rounded-full bg-zinc-300/50 dark:bg-zinc-700/50" />
                <div className="absolute inset-x-6 bottom-5 flex gap-2">
                  <div className="h-6 w-20 rounded-md bg-zinc-900/80 dark:bg-white/80" />
                  <div className="h-6 w-20 rounded-md border border-zinc-300 dark:border-zinc-700" />
                </div>
                <span className="absolute right-2 top-2 rounded bg-white/90 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground backdrop-blur dark:bg-black/50">
                  soon
                </span>
              </div>
              <h3 className="mt-3 px-1 text-sm font-medium">{teaser.title}</h3>
              <p className="mt-1 line-clamp-2 px-1 text-xs text-muted-foreground">
                {teaser.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
