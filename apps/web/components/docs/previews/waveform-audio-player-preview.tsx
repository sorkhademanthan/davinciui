"use client";

import { WaveformAudioPlayer } from "@workspace/ui/components/waveform-audio-player";

export function WaveformAudioPlayerPreview() {
  return (
    <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#e7f0ed] p-6 dark:bg-[#0c1514] sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(15,118,110,.2),transparent_38%),linear-gradient(145deg,#f8fbfa,#dceae5_70%)] dark:bg-[radial-gradient(circle_at_50%_44%,rgba(82,185,164,.2),transparent_38%),linear-gradient(145deg,#142523,#080c0c_70%)]" />
      <WaveformAudioPlayer
        src="/audio/strangerthings/vecnaattack.mp3"
        title="Signal Fracture"
        artist="DavinciUI sound study"
        duration={15.39}
        accentColor="var(--waveform-preview-accent)"
        className="relative max-w-[34rem] [--waveform-preview-accent:#0f766e] dark:[--waveform-preview-accent:#7ee7cf]"
      />
    </section>
  );
}
