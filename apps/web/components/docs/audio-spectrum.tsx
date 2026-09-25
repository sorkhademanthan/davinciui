import { DocsPageLayout } from "@/components/docs-page-layout";
import { AudioSpectrumPreview } from "@/components/docs/previews/audio-spectrum-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { AudioSpectrum } from "@/components/ui/audio-spectrum"

<AudioSpectrum
  src="/audio/track.mp3"
  title="Other Side FM"
  artist="Frequency analysis · live input"
  duration={168.15}
  accentColor="#c7ff3d"
/>`;

export async function AudioSpectrumDocs() {
  const sourceCode = (await readComponentSource("audio-spectrum")) || "// Unable to load source code";
  return <DocsPageLayout title="Audio Spectrum" description="A live frequency visualizer with real audio analysis, playback, and precise scrubbing." preview={<AudioSpectrumPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="audio-spectrum" installSourceCode={sourceCode} installSourceFilename="components/ui/audio-spectrum.tsx" fullWidthPreview unstyledPreview props={[
    { name: "src", type: "string", description: "MP3, WAV, OGG, or M4A source URL." },
    { name: "title", type: "string", default: '"Audio spectrum"', description: "Track label." },
    { name: "artist", type: "string", default: '"Live frequency view"', description: "Secondary track label." },
    { name: "duration", type: "number", description: "Known duration in seconds shown before metadata loads." },
    { name: "barCount", type: "number", default: "30", description: "Number of live frequency bars." },
    { name: "accentColor", type: "string", default: '"var(--spectrum-accent)"', description: "Active spectrum color." },
  ]} />;
}
