import { DocsPageLayout } from "@/components/docs-page-layout";
import { KeyboardCommandSoundsPreview } from "@/components/docs/previews/keyboard-command-sounds-preview";
import { readComponentSource } from "@/lib/source-code";
const usageCode = `import { KeyboardCommandSounds } from "@/components/ui/keyboard-command-sounds"

<KeyboardCommandSounds volume={0.16} />`;
export async function KeyboardCommandSoundsDocs() { const sourceCode = (await readComponentSource("keyboard-command-sounds")) || "// Unable to load source code"; return <DocsPageLayout title="Keyboard & Command Sounds" description="Optional keyboard and command feedback for focused productivity interfaces." preview={<KeyboardCommandSoundsPreview />} previewCode={usageCode} usageCode={usageCode} installPackageName="keyboard-command-sounds" installSourceCode={sourceCode} installSourceFilename="components/ui/keyboard-command-sounds.tsx" fullWidthPreview unstyledPreview props={[{ name: "volume", type: "number", default: "0.16", description: "Generated feedback volume from 0 to 1." }, { name: "compact", type: "boolean", default: "false", description: "Uses a compact card-safe layout." }]} />; }
