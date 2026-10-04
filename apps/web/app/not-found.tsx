import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Page not found — DavinciUI",
  description: "The page you're looking for doesn't exist. Head back to DavinciUI components, docs, or home.",
  robots: { index: false, follow: false },
};

const POPULAR_LINKS = [
  { label: "Components", href: "/experience/components" },
  { label: "Installation", href: "/docs/installation" },
  { label: "MCP setup", href: "/docs/mcp" },
  { label: "Design system", href: "/design-system" },
] as const;

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-[#fafafa] text-zinc-950 dark:bg-[#080808] dark:text-white">
      <SiteHeader />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-24 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.09]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 0.7px, transparent 0.8px)",
            backgroundSize: "10px 10px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
        />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 font-mono text-xs text-muted-foreground dark:bg-white/[0.05]">
            <Compass aria-hidden="true" className="size-3.5" />
            404
          </span>
          <h1 className="mt-5 text-balance text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
            Lost in the pixels.
          </h1>
          <p className="mt-4 max-w-md text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            This page doesn&apos;t exist or was moved. The good stuff is one
            click away.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transform-none dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-[#080808]"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back home
            </Link>
            <Link
              href="/experience/components"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transform-none dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
            >
              Browse components
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </Link>
          </div>

          <nav aria-label="Popular pages" className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {POPULAR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-zinc-500 underline-offset-4 transition-colors hover:text-foreground hover:underline dark:text-zinc-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
}
