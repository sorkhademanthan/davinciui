import { VoiceRecorder } from "@workspace/ui/components/voice-recorder";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { VoiceRecorderPreview } from "@/components/docs/previews/voice-recorder-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { VoiceRecorder } from "@/components/ui/voice-recorder"

<VoiceRecorder maxDuration={60} onRecordingComplete={(blob) => upload(blob)} />`;

export async function VoiceRecorderDocs() {
  const sourceCode =
    (await readComponentSource("voice-recorder")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      hideExamples
      title="Voice Recorder"
      description="Browser microphone capture with a recording timer, live waveform treatment, and playback."
      preview={<VoiceRecorderPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="voice-recorder"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/voice-recorder.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Sixty-second recorder",
          preview: (
            <div className="flex w-full items-center justify-center rounded-xl bg-[#f0edf7] p-8 dark:bg-[#100d15]">
              <VoiceRecorder />
            </div>
          ),
          code: `import { VoiceRecorder } from "@/components/ui/voice-recorder"

<VoiceRecorder maxDuration={60} onRecordingComplete={(blob) => upload(blob)} />`,
        },
        {
          title: "Short memo",
          preview: (
            <div className="flex w-full items-center justify-center rounded-xl bg-[#f0edf7] p-8 dark:bg-[#100d15]">
              <VoiceRecorder maxDuration={15} />
            </div>
          ),
          code: `import { VoiceRecorder } from "@/components/ui/voice-recorder"

<VoiceRecorder maxDuration={15} />`,
        },
      ]}
      props={[
        {
          name: "maxDuration",
          type: "number",
          default: "60",
          description: "Maximum recording duration in seconds.",
        },
        {
          name: "onRecordingComplete",
          type: "(blob) => void",
          description: "Receives the captured audio blob.",
        },
      ]}
    />
  );
}
