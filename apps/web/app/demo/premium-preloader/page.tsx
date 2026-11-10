"use client";

import * as React from "react";
import {
  PremiumPreloader,
  type PremiumPreloaderHandle,
  type PremiumPreloaderSequence,
} from "@workspace/ui/components/premium-preloader";

const SEQUENCES: Array<{
  id: PremiumPreloaderSequence;
  label: string;
  hint: string;
}> = [
  { id: "logo-images", label: "Logo → Images", hint: "Mark first" },
  { id: "images-logo", label: "Images → Logo", hint: "Streams first" },
];

export default function PremiumPreloaderDemoPage() {
  const [selected, setSelected] =
    React.useState<PremiumPreloaderSequence>("logo-images");
  const preloaderRef = React.useRef<PremiumPreloaderHandle>(null);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#F2EFEA] text-[#171717] dark:bg-[#0B0B0C] dark:text-[#F5F5F4]">
      <PremiumPreloader ref={preloaderRef} sequence={selected} theme="auto" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.9), transparent 42%), linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)",
          backgroundSize: "auto, 64px 64px, 64px 64px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.075), transparent 42%), linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "auto, 64px 64px, 64px 64px",
        }}
      />

      <main className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="text-center font-sans text-[clamp(46px,11.5vw,176px)] font-bold leading-none tracking-[-0.04em]">
            DAVINCIUI
          </h1>
        </div>

        <div className="absolute bottom-6 left-6 right-6 w-auto max-w-[430px] rounded-[14px] border border-black/10 bg-white/65 p-5 text-[#171717] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-auto dark:border-white/15 dark:bg-white/[0.055] dark:text-[#F5F5F4] dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-black/45 dark:text-white/45">
                Preloader
              </p>
            </div>
            <span className="rounded-full border border-black/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-black/40 dark:border-white/15 dark:text-white/45">
              02
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {SEQUENCES.map((option) => {
              const active = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected(option.id)}
                  aria-pressed={active}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-transparent bg-[#171717] text-[#F5F3F1] dark:bg-[#F5F5F4] dark:text-[#101012]"
                      : "border-black/10 bg-black/[0.02] text-[#171717] hover:bg-black/[0.05] dark:border-white/15 dark:bg-white/[0.035] dark:text-[#F5F5F4] dark:hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="block text-[11px] font-medium leading-tight">
                    {option.label}
                  </span>
                  <span
                    className={`mt-1 block text-[9px] uppercase tracking-[0.16em] ${
                      active
                        ? "text-[#F5F3F1]/55 dark:text-[#101012]/55"
                        : "text-black/35 dark:text-white/35"
                    }`}
                  >
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => preloaderRef.current?.replay(selected)}
            className="mt-3 flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/[0.035] px-4 py-3 text-left text-[12px] font-medium tracking-[-0.01em] transition-colors hover:bg-black/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/35 dark:border-white/15 dark:bg-white/[0.045] dark:hover:bg-white/[0.09] dark:focus-visible:outline-white/60"
          >
            Replay selected
            <span aria-hidden="true" className="text-base leading-none">
              →
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
