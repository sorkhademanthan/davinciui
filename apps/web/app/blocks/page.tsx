import type { Metadata } from "next";
import { ArrowUpRight, LayoutTemplate } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "DavinciUI Pro Blocks | DavinciUI",
  description:
    "A new library of production-ready blocks is coming soon to DavinciUI Pro.",
};

export default function BlocksPage() {
  return (
    <section className="relative min-h-[calc(100svh-3.5rem)] overflow-hidden bg-[#fafafa] text-zinc-950 dark:bg-[#080808] dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(59,130,246,0.08),transparent_36%)] dark:bg-[radial-gradient(circle_at_72%_42%,rgba(59,130,246,0.16),transparent_42%)]"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-3.5rem)] w-full max-w-[1240px] items-center gap-16 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.88fr_1.12fr] lg:px-12 lg:py-24">
        <div className="max-w-[590px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-300 dark:shadow-none">
            <LayoutTemplate className="size-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            DavinciUI Pro
          </div>

          <h1 className="max-w-[11ch] text-balance text-[clamp(3.3rem,7vw,6.5rem)] font-semibold leading-[0.91] tracking-[-0.07em]">
            A new home for DavinciUI blocks.
          </h1>

          <p className="mt-7 max-w-[540px] text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg sm:leading-8">
            A focused library of polished, production-ready blocks is coming soon to DavinciUI Pro.
          </p>

          <a
            href="https://pro.componentry.dev"
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transform-none dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-[#080808]"
          >
            Visit DavinciUI Pro
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </a>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] lg:mr-0" aria-hidden="true">
          <div className="absolute -inset-10 -z-10 rounded-full bg-blue-500/[0.08] blur-3xl dark:bg-blue-500/20" />

          <div className="overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_34px_90px_-48px_rgba(0,0,0,0.45)] dark:border-white/[0.14] dark:bg-[#131316] dark:shadow-[0_34px_90px_-32px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04)] dark:ring-1 dark:ring-white/[0.06]">
            <div className="flex h-12 items-center justify-between border-b border-black/[0.07] px-4 dark:border-white/[0.12]">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-500" />
                <span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-500" />
                <span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-500" />
              </div>
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-400">blocks / preview</span>
            </div>

            <div className="grid h-[420px] grid-cols-[0.72fr_1.28fr] gap-3 p-3 sm:h-[480px] sm:gap-4 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 rounded-2xl border border-black/[0.07] bg-zinc-50 p-4 dark:border-white/[0.12] dark:bg-white/[0.07]">
                  <div className="size-8 rounded-lg bg-blue-500/15 dark:bg-blue-400/40 dark:ring-1 dark:ring-blue-300/30" />
                  <div className="mt-8 h-2 w-2/3 rounded-full bg-zinc-300 dark:bg-zinc-400" />
                  <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-600" />
                  <div className="mt-2 h-2 w-4/5 rounded-full bg-zinc-200 dark:bg-zinc-600" />
                </div>
                <div className="h-[34%] rounded-2xl bg-zinc-950 p-4 dark:bg-zinc-100 dark:ring-1 dark:ring-white/40">
                  <div className="h-2 w-1/2 rounded-full bg-white/40 dark:bg-zinc-900/30" />
                  <div className="mt-3 h-8 w-8 rounded-full border border-white/20 dark:border-zinc-900/20" />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="h-[54%] rounded-2xl border border-black/[0.07] bg-zinc-50 p-4 dark:border-white/[0.12] dark:bg-white/[0.07] sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-16 rounded-full bg-zinc-300 dark:bg-zinc-400" />
                    <div className="size-7 rounded-full border border-black/10 dark:border-white/25 dark:bg-white/10" />
                  </div>
                  <div className="mt-8 h-3 w-3/4 rounded-full bg-zinc-400 dark:bg-zinc-300" />
                  <div className="mt-3 h-3 w-1/2 rounded-full bg-zinc-300 dark:bg-zinc-500" />
                  <div className="mt-8 flex gap-2">
                    <div className="h-8 w-20 rounded-full bg-zinc-950 dark:bg-white dark:ring-1 dark:ring-white/40" />
                    <div className="h-8 w-20 rounded-full border border-black/10 dark:border-white/25 dark:bg-white/[0.08]" />
                  </div>
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl border border-black/[0.07] bg-white p-3 dark:border-white/[0.12] dark:bg-white/[0.06] sm:p-4">
                    <div className="h-2 w-10 rounded-full bg-blue-500/50 dark:bg-blue-400/80" />
                    <div className="mt-4 h-12 rounded-xl bg-zinc-100 dark:bg-white/[0.12]" />
                  </div>
                  <div className="rounded-2xl border border-black/[0.07] bg-white p-3 dark:border-white/[0.12] dark:bg-white/[0.06] sm:p-4">
                    <div className="h-2 w-14 rounded-full bg-zinc-300 dark:bg-zinc-400" />
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="aspect-square rounded-lg bg-zinc-100 dark:bg-white/[0.12]" />
                      <div className="aspect-square rounded-lg bg-blue-500/10 dark:bg-blue-400/25 dark:ring-1 dark:ring-blue-300/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 left-6 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-lg dark:border-white/15 dark:bg-[#1e1f23] dark:text-zinc-200 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            Built for production
          </div>
        </div>
      </div>
    </section>
  );
}
