"use client";

import * as React from "react";
import { DaVinciPreloader } from "@workspace/ui/components/da-vinci-preloader";

const HERO_IMAGE = "/images/da-vinci-hero.svg";

/** Large hero headline split into per-character fragments for the loader. */
function FragmentedHeadline({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden pb-[0.08em]">
          {line.split("").map((char, ci) =>
            char === " " ? (
              <span key={ci} className="inline-block w-[0.28em]">
                &nbsp;
              </span>
            ) : (
              <span
                key={ci}
                data-dv-hero-char
                className="inline-block will-change-transform"
              >
                {char}
              </span>
            ),
          )}
        </span>
      ))}
    </>
  );
}

function DemoHero() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#E7E1D5] text-zinc-950">
      {/* Hero visual — SAME asset as the preloader reveal for a seamless handoff. */}
      <img
        src={HERO_IMAGE}
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center" }}
      />

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-sm font-semibold tracking-[0.22em]">
          DA&nbsp;VINCI
        </span>
        <nav className="hidden items-center gap-8 text-[13px] font-medium tracking-wide md:flex">
          <span>Work</span>
          <span>Studio</span>
          <span>Journal</span>
          <span>Contact</span>
        </nav>
        <button
          type="button"
          className="rounded-full bg-zinc-950 px-5 py-2 text-[13px] font-semibold text-white"
        >
          Start a project
        </button>
      </header>

      {/* Hero statement — DAVINCIUI is written once the preloader is done. */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <h1
          className="font-black leading-none tracking-[-0.04em] select-none"
          style={{ fontSize: "clamp(56px, 13vw, 200px)" }}
        >
          <FragmentedHeadline lines={["DAVINCIUI"]} />
        </h1>
      </div>
    </main>
  );
}

export default function DaVinciPreloaderDemoPage() {
  const [replayCount, setReplayCount] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);

  const replay = React.useCallback(() => {
    setRevealed(false);
    setReplayCount((count) => count + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#E7E1D5]">
      <DaVinciPreloader
        key={replayCount}
        image={HERO_IMAGE}
        onComplete={() => setRevealed(true)}
      >
        <DemoHero />
      </DaVinciPreloader>

      {revealed && (
        <div className="fixed bottom-6 left-6 z-[200]">
          <button
            type="button"
            onClick={replay}
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Replay Preloader
          </button>
        </div>
      )}
    </div>
  );
}
