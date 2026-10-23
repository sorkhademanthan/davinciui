import { UploadSoundStatus } from "@workspace/ui/components/upload-sound-status";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { UploadSoundStatusPreview } from "@/components/docs/previews/upload-sound-status-preview";
import { readComponentSource } from "@/lib/source-code";
const usageCode = `import { UploadSoundStatus } from "@/components/ui/upload-sound-status"

<UploadSoundStatus duration={2400} onComplete={() => refreshFiles()} />`;
export async function UploadSoundStatusDocs() {
  const sourceCode =
    (await readComponentSource("upload-sound-status")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Upload Sound Status"
      description="Transfer progress with a subtle completion cue and a reusable upload-state surface."
      preview={<UploadSoundStatusPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="upload-sound-status"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/upload-sound-status.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Compact, silent run",
          preview: (
            <div className="flex min-h-[240px] items-center justify-center px-6">
              <UploadSoundStatus
                compact
                muted
                fileName="brand-assets.zip"
                fileSizeMB={12.4}
                duration={1800}
              />
            </div>
          ),
          code: `import { UploadSoundStatus } from "@/components/ui/upload-sound-status"

<UploadSoundStatus
  compact
  muted
  fileName="brand-assets.zip"
  fileSizeMB={12.4}
  duration={1800}
/>`,
        },
        {
          title: "Non-cancelable larger transfer",
          preview: (
            <div className="flex min-h-[240px] items-center justify-center px-6">
              <UploadSoundStatus
                cancelable={false}
                fileName="export.mp4"
                fileSizeMB={86.2}
                duration={3200}
              />
            </div>
          ),
          code: `import { UploadSoundStatus } from "@/components/ui/upload-sound-status"

<UploadSoundStatus
  cancelable={false}
  fileName="export.mp4"
  fileSizeMB={86.2}
  duration={3200}
/>`,
        },
      ]}
      props={[
        {
          name: "duration",
          type: "number",
          default: "2400",
          description: "Demo transfer duration in milliseconds.",
        },
        {
          name: "fileName",
          type: "string",
          default: '"davinciui-components.zip"',
          description: "File name shown in the transfer row.",
        },
        {
          name: "fileSizeMB",
          type: "number",
          default: "48.6",
          description: "File size driving the live speed and ETA readout.",
        },
        {
          name: "cancelable",
          type: "boolean",
          default: "true",
          description:
            "Shows a Cancel upload action while a transfer is running.",
        },
        {
          name: "muted",
          type: "boolean",
          default: "false",
          description: "Skips the completion cue for silent (preview) runs.",
        },
        {
          name: "onComplete",
          type: "() => void",
          description: "Runs when transfer progress reaches completion.",
        },
      ]}
    />
  );
}
