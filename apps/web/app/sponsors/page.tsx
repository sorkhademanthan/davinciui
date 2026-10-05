"use client"

import type React from "react"
import Link from "next/link"
import { ArrowUpRight, Check } from "lucide-react"
import posthog from "posthog-js"

import { Footer } from "@/components/footer"
import {
  LandingContent,
  LandingGutter,
  LandingGuideLines,
} from "@/components/landing/landing-frame"
import { SiteHeader } from "@/components/site-header"
import { cn } from "@/lib/utils"

const sponsorHref =
  "https://github.com/sponsors/sorkhademanthan?utm_source=davinciui&utm_medium=sponsor&utm_campaign=sponsors_page"

const pricingTiers = [
  {
    name: "Main",
    price: "$150",
    description: "Maximum visibility across DavinciUI.",
    features: [
      "Top sponsor placement",
      "Header visibility",
      "Product note and link",
    ],
    featured: true,
  },
  {
    name: "Supporter",
    price: "$100",
    description: "A lasting presence for teams backing the library.",
    features: [
      "Sponsor page placement",
      "Linked product logo",
      "Active sponsor listing",
    ],
  },
  {
    name: "Backer",
    price: "$59",
    description: "A simple way to support the work publicly.",
    features: [
      "Backer page placement",
      "Name or product link",
      "Public support signal",
    ],
  },
]

function SponsorLink({
  children,
  className,
  tier,
  featured = false,
}: {
  children: React.ReactNode
  className?: string
  tier?: string
  featured?: boolean
}) {
  return (
    <Link
      href={sponsorHref}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        posthog.capture("sponsor_checkout_started", {
          ...(tier ? { sponsorship_tier: tier.toLowerCase() } : {}),
        })
      }
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transform-none",
        featured
          ? "bg-white text-zinc-950 hover:bg-zinc-200 focus-visible:ring-offset-zinc-950 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-white"
          : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-[#080808]",
        className
      )}
    >
      {children}
      <ArrowUpRight
        className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
        aria-hidden="true"
      />
    </Link>
  )
}

export default function SponsorsPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafafa] text-zinc-950 selection:bg-zinc-200 dark:bg-[#080808] dark:text-white dark:selection:bg-zinc-800">
      <LandingGuideLines />
      <SiteHeader landingGutter />

      <main className="relative z-10 overflow-x-clip pt-18">
        <LandingGutter>
          <LandingContent>
            <section className="flex min-h-[620px] flex-col items-center justify-center border-b border-black/[0.08] py-20 text-center dark:border-white/[0.08] sm:py-24">
              <h1 className="max-w-[850px] text-balance text-[clamp(3.25rem,8vw,7.25rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                Help keep DavinciUI independent.
              </h1>
              <p className="mt-7 max-w-[650px] text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-8">
                Sponsorship funds new components, thoughtful documentation, and the maintenance that keeps DavinciUI free for everyone.
              </p>
              <SponsorLink className="mt-8">Sponsor on GitHub</SponsorLink>
            </section>
          </LandingContent>

          <LandingContent>
            <section id="tiers" className="scroll-mt-20 py-16 md:py-24">
              <div className="mx-auto max-w-[720px] text-center">
                <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Choose how you show up.</h2>
                <p className="mx-auto mt-4 max-w-[560px] text-pretty text-sm leading-6 text-zinc-500 sm:text-base">
                  Every level supports the same work. Pick the visibility that makes sense for your product.
                </p>
              </div>

              <div className="mt-10 grid overflow-hidden rounded-[28px] border border-black/10 bg-white dark:border-white/10 dark:bg-[#101011] lg:grid-cols-3">
                {pricingTiers.map((tier, index) => (
                  <article
                    key={tier.name}
                    className={cn(
                      "flex min-h-[430px] flex-col p-6 sm:p-8",
                      index > 0 && "border-t border-black/10 dark:border-white/10 lg:border-l lg:border-t-0",
                      tier.featured && "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-semibold">{tier.name}</h3>
                      {tier.featured ? (
                        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium text-zinc-300 dark:border-black/10 dark:text-zinc-600">
                          Most visible
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-7 flex items-end gap-1.5">
                      <span className="text-5xl font-semibold tracking-[-0.06em]">{tier.price}</span>
                      <span className={cn("pb-1 text-xs", tier.featured ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500")}>/ month</span>
                    </div>

                    <p className={cn("mt-5 min-h-12 text-sm leading-6", tier.featured ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400")}>
                      {tier.description}
                    </p>

                    <ul className="mt-7 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm">
                          <Check className={cn("size-3.5 shrink-0", tier.featured ? "text-blue-400 dark:text-blue-600" : "text-blue-500")} aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <SponsorLink
                      tier={tier.name}
                      featured={tier.featured}
                      className="mt-auto w-full"
                    >
                      Choose {tier.name}
                    </SponsorLink>
                  </article>
                ))}
              </div>
            </section>
          </LandingContent>

          <LandingContent>
            <section className="border-y border-black/[0.08] py-14 dark:border-white/[0.08] md:py-16">
              <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-20">
                <h2 className="max-w-xs text-3xl font-semibold tracking-[-0.04em]">Where your support goes.</h2>
                <div className="grid gap-8 sm:grid-cols-3">
                  <div>
                    <p className="font-semibold">New components</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">More production-ready interactions and visual effects.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Better guidance</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">Clearer documentation, examples, and implementation notes.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Long-term care</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">Accessibility improvements, fixes, and dependency updates.</p>
                  </div>
                </div>
              </div>
            </section>
          </LandingContent>

          <LandingContent>
            <section className="flex flex-col items-center py-20 text-center md:py-28">
              <h2 className="max-w-[720px] text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Support the next thoughtful detail.</h2>
              <p className="mt-4 max-w-[520px] text-pretty text-base leading-7 text-zinc-500">Your sponsorship keeps DavinciUI open, maintained, and moving forward.</p>
              <SponsorLink className="mt-7">Become a sponsor</SponsorLink>
            </section>
          </LandingContent>
        </LandingGutter>
      </main>

      <Footer />
    </div>
  )
}
