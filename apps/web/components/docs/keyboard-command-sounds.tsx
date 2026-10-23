import { KeyboardCommandSounds } from "@workspace/ui/components/keyboard-command-sounds";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { KeyboardCommandSoundsPreview } from "@/components/docs/previews/keyboard-command-sounds-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { KeyboardCommandSounds } from "@/components/ui/keyboard-command-sounds"

<KeyboardCommandSounds />`;

export async function KeyboardCommandSoundsDocs() {
  const sourceCode =
    (await readComponentSource("keyboard-command-sounds")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Keyboard & Command Sounds"
      description="Optional keyboard and command feedback for focused productivity interfaces."
      preview={<KeyboardCommandSoundsPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="keyboard-command-sounds"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/keyboard-command-sounds.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Keyboard feedback card",
          preview: (
            <div className="flex w-full items-center justify-center rounded-xl bg-slate-100 p-8 dark:bg-slate-900">
              <KeyboardCommandSounds />
            </div>
          ),
          code: `import { KeyboardCommandSounds } from "@/components/ui/keyboard-command-sounds"

<KeyboardCommandSounds />`,
        },
        {
          title: "Compact, quieter",
          preview: (
            <div className="flex w-full items-center justify-center rounded-xl bg-slate-100 p-8 dark:bg-slate-900">
              <KeyboardCommandSounds compact volume={0.1} />
            </div>
          ),
          code: `import { KeyboardCommandSounds } from "@/components/ui/keyboard-command-sounds"

<KeyboardCommandSounds compact volume={0.1} />`,
        },
      ]}
      props={[
        {
          name: "volume",
          type: "number",
          default: "0.16",
          description: "Generated feedback volume from 0 to 1.",
        },
        {
          name: "compact",
          type: "boolean",
          default: "false",
          description: "Uses a compact card-safe layout.",
        },
      ]}
    />
  );
}
