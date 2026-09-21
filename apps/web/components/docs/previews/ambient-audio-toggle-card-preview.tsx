"use client";

import { AmbientAudioToggle } from "@workspace/ui/components/ambient-audio-toggle";

export function AmbientAudioToggleCardPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#eef4f0] dark:bg-[#101815]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(4,120,87,0.12),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_50%_42%,rgba(54,111,89,0.3),transparent_68%)]" />
      <AmbientAudioToggle
        src="/audio/ambient-toggle-demo.wav"
        persistenceKey="davinciui-ambient-audio-card"
        hideLabel
        waveformWidth={136}
        waveformHeight={42}
        className="relative min-h-[64px] rounded-2xl px-5 py-3"
      />
    </div>
  );
}
