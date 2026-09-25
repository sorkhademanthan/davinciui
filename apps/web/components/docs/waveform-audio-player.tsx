import { DocsPageLayout } from "@/components/docs-page-layout";
import { WaveformAudioPlayerPreview } from "@/components/docs/previews/waveform-audio-player-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { WaveformAudioPlayer } from "@/components/ui/waveform-audio-player"

<WaveformAudioPlayer
  src="/audio/track.wav"
  title="Signal Fracture"
  artist="DavinciUI sound study"
  duration={15.39}
  accentColor="#0f766e"
/>`;

export async function WaveformAudioPlayerDocs() {
  const sourceCode = (await readComponentSource("waveform-audio-player")) || "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Waveform Audio Player"
      description="A polished audio player with tactile waveform scrubbing, accurate playback time, and user-initiated sound."
      preview={<WaveformAudioPlayerPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="waveform-audio-player"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/waveform-audio-player.tsx"
      fullWidthPreview
      unstyledPreview
      props={[
        { name: "src", type: "string", description: "MP3, WAV, OGG, or M4A source URL." },
        { name: "title", type: "string", default: '"Untitled audio"', description: "Primary track label." },
        { name: "artist", type: "string", default: '"Audio preview"', description: "Secondary track label." },
        { name: "waveform", type: "number[]", description: "Optional normalized waveform bar heights." },
        { name: "duration", type: "number", description: "Known duration in seconds shown before metadata is ready." },
        { name: "accentColor", type: "string", default: '"var(--waveform-accent)"', description: "Elapsed waveform and focus accent." },
        { name: "volume", type: "number", default: "0.75", description: "Playback volume from 0 to 1." },
        { name: "compact", type: "boolean", default: "false", description: "Reduces metadata and spacing for denser layouts." },
      ]}
    />
  );
}
