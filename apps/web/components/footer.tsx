"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowUp } from "lucide-react"
import { LandingContent, landingGutterClass } from "@/components/landing/landing-frame"
import { DavinciUILogomark } from "@/components/logos/davinciui-logomark"

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
] as const

export function Footer() {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" })
  }

  return (
    <footer className="relative isolate w-full overflow-hidden border-t border-zinc-200 bg-[#f4f4f1] text-zinc-950 dark:border-white/10 dark:bg-[#111214] dark:text-zinc-50">
      <div className={`relative mx-auto w-full ${landingGutterClass}`}>
        <LandingContent>
          <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
            <div className="lg:col-span-5">
              <Link href="/" className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1]">
                <DavinciUILogomark className="size-8 transition-transform duration-300 group-hover:rotate-[-8deg]" />
                <span className="text-lg font-semibold tracking-[-0.055em]">DavinciUI</span>
              </Link>
              <p className="mt-5 max-w-[21rem] text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                An open-source collection of animated React components. Made to be used, remixed, and made your own.
              </p>
            </div>

            <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:col-span-7 lg:gap-8">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.19em] text-zinc-500 dark:text-zinc-400 sm:text-xs">
                    {group.title}
                  </h3>
                  <ul className="mt-5 space-y-3.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          {...("external" in link ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="group inline-flex min-h-6 items-center gap-1.5 rounded-sm text-sm font-medium text-zinc-700 transition-colors hover:text-[#4f46e5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1] dark:text-zinc-300 dark:hover:text-[#a5b4fc] sm:text-[15px]"
                        >
                          {link.label}
                          {"external" in link && <ArrowUpRight className="size-3 opacity-45 transition-[transform,opacity] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-zinc-950/15 py-6 text-xs text-zinc-600 dark:border-white/15 dark:text-zinc-400 sm:text-sm">
            <p>© {new Date().getFullYear()} DavinciUI · Crafted by <a href="https://www.manthansorkhade.in/" target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-400/60 underline-offset-4 transition-colors hover:text-zinc-950 dark:hover:text-white">Manthan Sorkhade</a></p>
            <div className="flex items-center gap-5 sm:gap-7">
              <Link href="/privacy-policy" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Privacy</Link>
              <Link href="/terms-of-service" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Terms</Link>
              <button type="button" onClick={scrollToTop} className="group inline-flex items-center gap-1.5 font-medium text-zinc-950 transition-colors hover:text-[#4f46e5] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1] dark:text-zinc-100 dark:hover:text-[#a5b4fc]">
                Back to top <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-950/15 pb-4 pt-5 dark:border-white/15 sm:pb-7 sm:pt-7" aria-hidden="true">
            <div className="flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 sm:text-[10px]">
              <span>Made for the curious</span>
              <span>Designed to move</span>
            </div>
            <p className="mt-5 select-none whitespace-nowrap text-center text-[clamp(3.15rem,13.9vw,13.3rem)] font-semibold leading-[0.8] tracking-[-0.095em] text-zinc-950 dark:text-zinc-50">
              davinciui
            </p>
          </div>
        </LandingContent>
      </div>
    </footer>
  )
}
