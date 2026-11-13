"use client";

import * as React from "react";
import {
  PreloaderProV4,
  type PreloaderProV4Exit,
  type PreloaderProV4Mode,
} from "@workspace/ui/components/preloader-pro-v4";

export default function PreloaderProV4DemoPage() {
  const [exit] = React.useState<PreloaderProV4Exit>(() => {
    if (typeof window === "undefined") return "fade";
    return new URLSearchParams(window.location.search).get("exit") ===
      "slide-up"
      ? "slide-up"
      : "fade";
  });
  const [mode] = React.useState<PreloaderProV4Mode>(() => {
    if (typeof window === "undefined") return "timed";
    return new URLSearchParams(window.location.search).get("mode") ===
      "pageLoad"
      ? "pageLoad"
      : "timed";
  });

  return (
    <div className="relative min-h-dvh bg-[#F3EFE7] dark:bg-[#0F0F0F]">
      <PreloaderProV4 exit={exit} mode={mode} />
      <main className="grid min-h-dvh place-items-center bg-[#F3EFE7] dark:bg-[#0F0F0F]">
        <h1 className="sr-only">DaVinci UI</h1>
      </main>
    </div>
  );
}
