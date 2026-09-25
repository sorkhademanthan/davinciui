"use client";

import { AudioSpectrum } from "@workspace/ui/components/audio-spectrum";

export function AudioSpectrumPreview() {
  return <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#e8ecde] p-6 dark:bg-[#090a0e] sm:p-10"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(199,255,61,.18),transparent_40%)] dark:bg-[radial-gradient(circle_at_50%_45%,rgba(199,255,61,.14),transparent_42%)]" /><AudioSpectrum src="/audio/strangerthings/strangerthingsbg.mp3" title="Other Side FM" artist="Frequency analysis · live input" duration={168.15} accentColor="var(--spectrum-preview-accent)" className="relative [--spectrum-preview-accent:#c7ff3d]" /></section>;
}
