import { DocsPageLayout } from "@/components/docs-page-layout";
import { VoiceRecorderPreview } from "@/components/docs/previews/voice-recorder-preview";
import { readComponentSource } from "@/lib/source-code";
const usageCode = `import { VoiceRecorder } from "@/components/ui/voice-recorder"

<VoiceRecorder maxDuration={60} onRecordingComplete={(blob) => upload(blob)} />`;
export async function VoiceRecorderDocs() { const sourceCode = (await readComponentSource("voice-recorder")) || "// Unable to load source code"; return <DocsPageLayout title="Voice Recorder" description="Browser microphone capture with a recording timer, live waveform treatment, and playback." preview={<VoiceRecorderPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="voice-recorder" installSourceCode={sourceCode} installSourceFilename="components/ui/voice-recorder.tsx" fullWidthPreview unstyledPreview props={[{ name: "maxDuration", type: "number", default: "60", description: "Maximum recording duration in seconds." }, { name: "onRecordingComplete", type: "(blob) => void", description: "Receives the captured audio blob." }]} />; }
