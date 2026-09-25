import { DocsPageLayout } from "@/components/docs-page-layout";
import { UploadSoundStatusPreview } from "@/components/docs/previews/upload-sound-status-preview";
import { readComponentSource } from "@/lib/source-code";
const usageCode = `import { UploadSoundStatus } from "@/components/ui/upload-sound-status"

<UploadSoundStatus duration={2400} onComplete={() => refreshFiles()} />`;
export async function UploadSoundStatusDocs() { const sourceCode = (await readComponentSource("upload-sound-status")) || "// Unable to load source code"; return <DocsPageLayout title="Upload Sound Status" description="Transfer progress with a subtle completion cue and a reusable upload-state surface." preview={<UploadSoundStatusPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="upload-sound-status" installSourceCode={sourceCode} installSourceFilename="components/ui/upload-sound-status.tsx" fullWidthPreview unstyledPreview props={[{ name: "duration", type: "number", default: "2400", description: "Demo transfer duration in milliseconds." }, { name: "onComplete", type: "() => void", description: "Runs when transfer progress reaches completion." }]} />; }
