"use client";

import { useEffect, useRef, useState } from "react";
import { VoiceRecorder } from "@workspace/ui/components/voice-recorder";

export function VoiceRecorderCardPreview() {
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
      className="absolute inset-0 grid place-items-center overflow-hidden bg-[#f0edf7] p-5 dark:bg-[#100d15]"
    >
      <VoiceRecorder compact className="relative max-w-[17rem]" />
      {hint && (
        <span className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-black/[0.06] bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-zinc-600 backdrop-blur-md dark:border-white/[0.1] dark:bg-black/55 dark:text-zinc-300">
          Tap ● to record
        </span>
      )}
    </div>
  );
}
