import { InteractionSoundKit } from "@workspace/ui/components/interaction-sound-kit";

import { DocsPageLayout } from "@/components/docs-page-layout";
import { InteractionSoundKitPreview } from "@/components/docs/previews/interaction-sound-kit-preview";
import { readComponentSource } from "@/lib/source-code";

const usageCode = `import { InteractionSoundKit } from "@/components/ui/interaction-sound-kit"

<InteractionSoundKit
  volume={0.38}
  onSoundPlay={(action) => console.log(action)}
/>`;

export async function InteractionSoundKitDocs() {
  const sourceCode =
    (await readComponentSource("interaction-sound-kit")) ||
    "// Unable to load source code";
  return (
    <DocsPageLayout
      title="Interaction Sound Kit"
      description="System-style sound feedback for trash, drop, confirmation, and warning actions."
      preview={<InteractionSoundKitPreview />}
      previewCode={usageCode}
      usageCode={usageCode}
      installPackageName="interaction-sound-kit"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/interaction-sound-kit.tsx"
      fullWidthPreview
      unstyledPreview
      examples={[
        {
          title: "Full action set",
          preview: (
            <div className="flex w-full items-center justify-center rounded-xl bg-zinc-100 p-8 dark:bg-zinc-900">
              <InteractionSoundKit />
            </div>
          ),
          code: `import { InteractionSoundKit } from "@/components/ui/interaction-sound-kit"

<InteractionSoundKit volume={0.38} />`,
        },
        {
          title: "Compact, muted by default",
          preview: (
            <div className="flex w-full items-center justify-center rounded-xl bg-zinc-100 p-8 dark:bg-zinc-900">
              <InteractionSoundKit compact defaultMuted volume={0.25} />
            </div>
          ),
          code: `import { InteractionSoundKit } from "@/components/ui/interaction-sound-kit"

<InteractionSoundKit compact defaultMuted volume={0.25} />`,
        },
      ]}
      props={[
        {
          name: "volume",
          type: "number",
          default: "0.38",
          description: "Generated sound volume from 0 to 1.",
        },
        {
          name: "defaultMuted",
          type: "boolean",
          default: "false",
          description: "Starts the kit in a muted state.",
        },
        {
          name: "compact",
          type: "boolean",
          default: "false",
          description: "Shows an icon-focused three-action variant.",
        },
        {
          name: "onSoundPlay",
          type: "(action) => void",
          description: "Runs after a user triggers a sound.",
        },
      ]}
    />
  );
}
