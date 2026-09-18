"use client";

import * as React from "react";
import { GeometricPreloader } from "@workspace/ui/components/geometric-preloader";

export default function GeometricPreloaderDemoPage() {
  const [replay, setReplay] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  return (
    <main className="min-h-screen bg-[#f5f1e8] text-zinc-950">
      <GeometricPreloader key={replay} onComplete={() => setRevealed(true)} />
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-center text-[clamp(3rem,12vw,10rem)] font-black tracking-[-0.08em]">GEOMETRIC</h1>
      </div>
      {revealed && (
        <button
          type="button"
          onClick={() => { setRevealed(false); setReplay((id) => id + 1); }}
          className="fixed bottom-6 left-6 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          Replay Preloader
        </button>
      )}
    </main>
  );
}
