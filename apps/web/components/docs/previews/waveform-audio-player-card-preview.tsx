"use client";

import { WaveformAudioPlayer } from "@workspace/ui/components/waveform-audio-player";

export function WaveformAudioPlayerCardPreview() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#e7f0ed] p-5 dark:bg-[#0c1514]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,118,110,.16),transparent_56%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(82,185,164,.16),transparent_56%)]" />
      <WaveformAudioPlayer compact src="/audio/strangerthings/vecnaattack.mp3" title="Signal Fracture" duration={15.39} className="relative max-w-[17rem] [--waveform-accent:#0f766e] dark:[--waveform-accent:#7ee7cf]" />
    </div>
  );
}
