"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { LandingContent } from "@/components/landing/landing-frame";
import posthog from "posthog-js";

const emailAddress = "sorkhademanthan@gmail.com";
const emailHref = `mailto:${emailAddress}?subject=Custom%20design%20work`;

function XIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function CustomWorkCta() {
  return (
    <LandingContent>
      <section className="py-20 sm:py-28" aria-labelledby="custom-work-heading">
        <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-[#f7f7f6] px-6 py-8 dark:border-white/[0.08] dark:bg-[#141414] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-28 -top-44 size-[430px] rounded-full bg-white/75 blur-3xl dark:bg-white/[0.025]" aria-hidden="true" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                Custom work
              </p>
              <h2 id="custom-work-heading" className="max-w-[580px] text-[clamp(2.25rem,4.2vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.055em] text-zinc-950 dark:text-white">
                Have an idea that needs its own motion?
              </h2>
              <p className="mt-5 max-w-[520px] text-base leading-7 text-zinc-600 dark:text-zinc-400">
                From a tailored component to a full landing page, tell me what you are building. I will reply personally.
              </p>

              <a
                href={emailHref}
                onClick={() => posthog.capture("custom_work_contact_started")}
                className="group mt-8 inline-flex min-h-11 items-center justify-center gap-3 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f7f6] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-[#141414]"
              >
                Tell me about it
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-[0_14px_35px_-28px_rgba(0,0,0,0.24)] dark:border-white/[0.09] dark:bg-[#1b1b1b]">
              <div className="grid grid-cols-[44px_minmax(0,1fr)_36px] items-center gap-x-3 gap-y-3 border-b border-zinc-100 px-5 py-6 dark:border-white/[0.07] sm:flex sm:gap-4 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 dark:bg-white/[0.08] dark:text-zinc-100">
                  <Mail className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">For projects and detailed ideas</p>
                  <a href={emailHref} className="mt-1 hidden truncate text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline focus-visible:underline dark:text-white sm:block sm:text-base">
                    {emailAddress}
                  </a>
                </div>
                <CopyButton
                  code={emailAddress}
                  absolute={false}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 p-0 text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:border-white/[0.12] dark:text-zinc-400 dark:hover:border-white/30 dark:hover:text-white"
                />
                <a href={emailHref} className="col-span-3 break-all text-[13px] font-semibold text-zinc-900 underline-offset-4 hover:underline focus-visible:underline dark:text-white sm:hidden">
                  {emailAddress}
                </a>
              </div>

              <a
                href="https://x.com/ManthanSorkhade"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[92px] items-center gap-4 px-5 py-6 transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset dark:hover:bg-white/[0.04] dark:focus-visible:bg-white/[0.04] sm:px-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 dark:bg-white/[0.08] dark:text-zinc-100">
                  <XIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">For a quick hello</span>
                  <span className="mt-1 block truncate text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">@ManthanSorkhade</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </LandingContent>
  );
}
