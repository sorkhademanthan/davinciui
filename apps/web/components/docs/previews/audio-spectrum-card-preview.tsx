"use client";

import { AudioSpectrum } from "@workspace/ui/components/audio-spectrum";

export function AudioSpectrumCardPreview() {
  return <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#e8ecde] p-5 dark:bg-[#090a0e]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(199,255,61,.18),transparent_55%)]" /><AudioSpectrum compact src="/audio/strangerthings/strangerthingsbg.mp3" title="Other Side FM" duration={168.15} className="relative max-w-[17rem]" /></div>;
}
