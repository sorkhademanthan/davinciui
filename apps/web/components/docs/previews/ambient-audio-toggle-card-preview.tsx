"use client";

import { useEffect, useRef, useState } from "react";
import { AmbientAudioToggle } from "@workspace/ui/components/ambient-audio-toggle";

export function AmbientAudioToggleCardPreview() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const dismiss = () => setHint(false);
    host.addEventListener("pointerdown", dismiss);
    return () => host.removeEventListener("pointerdown", dismiss);
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#eef4f0] dark:bg-[#101815]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(4,120,87,0.12),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_50%_42%,rgba(54,111,89,0.3),transparent_68%)]" />
      <AmbientAudioToggle
        src="/audio/ambient-toggle-demo.wav"
        persistenceKey="davinciui-ambient-audio-card"
        hideLabel
        waveformWidth={136}
        waveformHeight={42}
        className="relative min-h-[64px] rounded-2xl px-5 py-3"
      />
      {hint && (
        <span className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-zinc-600 backdrop-blur-md dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-300">
          Tap to play
        </span>
      )}
    </div>
  );
}
