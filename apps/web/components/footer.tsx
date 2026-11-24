"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowUp } from "lucide-react"
import { LandingContent, landingGutterClass } from "@/components/landing/landing-frame"
import { DavinciUILogo } from "@/components/logos/davinci-ui-logo"

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.303 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.388-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.305 3.493.998.108-.776.418-1.305.762-1.605-2.666-.304-5.467-1.333-5.467-5.93 0-1.312.469-2.382 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.009-.323 3.301 1.23A11.52 11.52 0 0 1 12 5.8c1.02.005 2.047.139 3.006.404 2.291-1.553 3.298-1.23 3.298-1.23.652 1.653.241 2.874.117 3.176.769.839 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.48 5.921.431.371.824 1.103.824 2.222v3.293c0 .319.192.688.802.576C20.566 21.795 24 17.298 24 12 24 5.372 18.627 0 12 0Z" />
    </svg>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  )
}

const socials = [
  { label: "GitHub", href: "https://github.com/sorkhademanthan/davinciui", Icon: GitHubIcon },
  { label: "X / Twitter", href: "https://x.com/ManthanSorkhade", Icon: XIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sorkhademanthan/", Icon: LinkedInIcon },
] as const

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Components", href: "/experience/components" },
      { label: "Blocks", href: "/blocks" },
      { label: "Design system", href: "/design-system" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "MCP server", href: "/docs/mcp" },
      { label: "Sponsor the project", href: "/sponsors" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "GitHub", href: "https://github.com/sorkhademanthan/davinciui", external: true },
      { label: "X / Twitter", href: "https://x.com/ManthanSorkhade", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/sorkhademanthan/", external: true },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Report a bug", href: "https://github.com/sorkhademanthan/davinciui/issues/new", external: true },
      { label: "Request a feature", href: "https://github.com/sorkhademanthan/davinciui/issues/new", external: true },
      { label: "Email us", href: "mailto:sorkhademanthan@gmail.com", external: true },
    ],
  },
] as const

function SpotlightWordmark({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={containerRef} aria-hidden="true" className="relative select-none">
      {/* Outlined base — reads as texture */}
      <p className="whitespace-nowrap text-center text-[clamp(3.5rem,12.5vw,12rem)] font-semibold leading-[0.85] tracking-[-0.09em] text-transparent [-webkit-text-stroke:1px_rgb(9_9_11/0.22)] dark:[-webkit-text-stroke:1px_rgb(255_255_255/0.22)]">
        davinciui
      </p>
      {/* Pointer-tracked fill, clipped to the same glyphs. Tight spotlight
          for nearby cursor, wide faint sheen so distant cursor still reads. */}
      <p
        aria-hidden="true"
        className="footer-spotlight pointer-events-none absolute inset-0 whitespace-nowrap text-center text-[clamp(3.5rem,12.5vw,12rem)] font-semibold leading-[0.85] tracking-[-0.09em] text-transparent opacity-90"
      >
        davinciui
      </p>
    </div>
  )
}

export function Footer() {
  const markRef = React.useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const lenis = (window as Window & { __lenis?: { scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean; force?: boolean }) => void; stop: () => void; start: () => void } }).__lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: reduceMotion, force: true })
      return
    }
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" })
  }

  // Spotlight follows the cursor anywhere inside the footer — not just over
  // the wordmark. Coordinates are resolved against the wordmark box at event
  // time, so scroll position never skews them.
  const trackSpotlight = (e: React.PointerEvent<HTMLElement>) => {
    const el = markRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }

  return (
    <footer
      onPointerMove={trackSpotlight}
      className="relative isolate w-full overflow-hidden border-t border-zinc-200 bg-[#f4f4f1] text-zinc-950 dark:border-white/10 dark:bg-[#0a0a0b] dark:text-zinc-50"
    >
      <style>{`.footer-spotlight {
  background-image:
    radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgb(9 9 11 / 0.9), transparent 70%),
    radial-gradient(900px circle at var(--mx, 50%) var(--my, 50%), rgb(9 9 11 / 0.35), transparent 85%);
  -webkit-background-clip: text;
  background-clip: text;
}
.dark .footer-spotlight {
  background-image:
    radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.95), transparent 70%),
    radial-gradient(900px circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / 0.35), transparent 85%);
}`}</style>
      {/* Ambient aurora — dark-first, barely-there in light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-indigo-500/[0.07] blur-[120px] dark:bg-indigo-500/[0.14]" />
        <div className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/[0.05] blur-[100px] dark:bg-fuchsia-500/[0.1]" />
        <div className="absolute -right-40 top-1/2 h-80 w-80 rounded-full bg-cyan-400/[0.05] blur-[100px] dark:bg-cyan-400/[0.09]" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-950/25 to-transparent dark:via-white/25"
      />

      <div className={`relative mx-auto w-full ${landingGutterClass}`}>
        <LandingContent>
          {/* Link grid */}
          <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-16">
            <div className="lg:col-span-5">
              <Link href="/" prefetch={false} className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1]">
                <DavinciUILogo className="size-8 transition-transform duration-300 group-hover:rotate-[-8deg]" />
                <span className="text-lg font-semibold tracking-[-0.055em]">DavinciUI</span>
              </Link>
              <p className="mt-5 max-w-[21rem] text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                An open-source collection of animated React components. Made to be used, remixed, and made your own.
              </p>
              <div className="mt-6 flex items-center gap-2">
                {socials.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-9 place-items-center rounded-full border border-zinc-950/10 text-zinc-500 transition-all hover:-translate-y-0.5 hover:border-zinc-950/20 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1] dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/25 dark:hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4 lg:col-span-7 lg:gap-6">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.19em] text-zinc-500 dark:text-zinc-500 sm:text-xs">
                    {group.title}
                  </h3>
                  <ul className="mt-5 space-y-1">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          prefetch={false}
                          {...("external" in link ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="group inline-flex min-h-8 items-center gap-1.5 rounded-sm text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1] dark:text-zinc-400 dark:hover:text-white sm:text-[15px]"
                        >
                          <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                            {link.label}
                          </span>
                          {"external" in link && <ArrowUpRight className="size-3 opacity-45 transition-[transform,opacity] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Interactive wordmark */}
          <div className="border-t border-zinc-950/10 py-10 dark:border-white/10 sm:py-12">
            <SpotlightWordmark containerRef={markRef} />
          </div>

          {/* Legal bar */}
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-zinc-950/10 py-6 text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-500 sm:text-sm">
            <p>© {new Date().getFullYear()} DavinciUI · <span className="rounded-full border border-zinc-950/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest dark:border-white/15">v0.1.0</span> · Crafted by <a href="https://www.manthansorkhade.in/" target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-400/60 underline-offset-4 transition-colors hover:text-zinc-950 dark:hover:text-white">Manthan Sorkhade</a></p>
            <div className="flex items-center gap-5 sm:gap-7">
              <Link href="/sitemap" prefetch={false} className="transition-colors hover:text-zinc-950 dark:hover:text-white">Sitemap</Link>
              <Link href="/privacy-policy" prefetch={false} className="transition-colors hover:text-zinc-950 dark:hover:text-white">Privacy</Link>
              <Link href="/terms-of-service" prefetch={false} className="transition-colors hover:text-zinc-950 dark:hover:text-white">Terms</Link>
              <button type="button" onClick={scrollToTop} className="group inline-flex items-center gap-1.5 font-medium text-zinc-950 transition-colors hover:text-[#4f46e5] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1] dark:text-zinc-100 dark:hover:text-white">
                Back to top <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </LandingContent>
      </div>
    </footer>
  )
}
