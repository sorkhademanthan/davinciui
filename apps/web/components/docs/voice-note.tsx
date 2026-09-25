import { DocsPageLayout } from "@/components/docs-page-layout";
import { VoiceNotePreview } from "@/components/docs/previews/voice-note-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { VoiceNote } from "@/components/ui/voice-note"

<VoiceNote
  src="/audio/message.wav"
  sender="Mia Rivera"
  timestamp="2 min ago"
  duration={8}
/>`;

export async function VoiceNoteDocs() {
  const sourceCode = (await readComponentSource("voice-note")) || "// Unable to load source code";
  return <DocsPageLayout title="Voice Note" description="A message-style audio player with waveform scrubbing, playback speed, and familiar conversation context." preview={<VoiceNotePreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="voice-note" installSourceCode={sourceCode} installSourceFilename="components/ui/voice-note.tsx" fullWidthPreview unstyledPreview props={[
    { name: "src", type: "string", description: "MP3, WAV, OGG, or M4A source URL." },
    { name: "sender", type: "string", default: '"Avery Lane"', description: "Name displayed with the message." },
    { name: "timestamp", type: "string", default: '"Just now"', description: "Message time label." },
    { name: "duration", type: "number", description: "Known duration in seconds shown before metadata is ready." },
    { name: "showSpeedControl", type: "boolean", default: "true", description: "Shows the 1×, 1.5×, and 2× speed control." },
    { name: "accentColor", type: "string", default: '"var(--voice-note-accent)"', description: "Elapsed waveform color." },
  ]} />;
}
