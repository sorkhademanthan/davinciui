"use client";

import * as React from "react";
import {
  PreloaderProV5,
  type PreloaderProV5RevealStyle,
} from "@workspace/ui/components/masked-arc-preloader";

const REVEAL_STYLES: PreloaderProV5RevealStyle[] = ["split", "lift", "iris"];

function readRevealStyle(): PreloaderProV5RevealStyle {
  if (typeof window === "undefined") return "split";
  const value = new URLSearchParams(window.location.search).get("reveal");
  return REVEAL_STYLES.includes(value as PreloaderProV5RevealStyle)
    ? (value as PreloaderProV5RevealStyle)
    : "split";
}

export default function PreloaderProV5DemoPage() {
  const [revealStyle, setRevealStyle] =
    React.useState<PreloaderProV5RevealStyle>("split");

  React.useLayoutEffect(() => {
    setRevealStyle(readRevealStyle());
  }, []);

  return (
    <div className="relative min-h-dvh bg-[#ECECEA] text-[#111111] dark:bg-[#0B0B0A] dark:text-[#F1EEE8]">
      <PreloaderProV5
        brandName="DaVinci UI"
        introText="Every interface, considered."
        revealStyle={revealStyle}
      />
      <main className="grid min-h-dvh place-items-center px-6">
        <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-medium leading-none tracking-[-0.06em]">
          DaVinci UI
        </h1>
      </main>
    </div>
  );
}
