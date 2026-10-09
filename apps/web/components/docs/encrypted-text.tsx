import { DocsPageLayout } from "@/components/docs-page-layout";
import { LiveCodeBlock } from "@/components/live-code-block";
import {
  EncryptedTextPersonalizePanel,
  EncryptedTextPlayground,
} from "@/components/docs/previews/encrypted-text-preview";
import { readComponentSource } from "@/lib/source-code";

const basicUsageCode = `import { EncryptedText } from "@/components/ui/encrypted-text"

<EncryptedText
  text="DAVINCIUI"
  fontSize="clamp(2rem, 7vw, 5.25rem)"
/>`;

export async function EncryptedTextDocs() {
  const sourceCode =
    (await readComponentSource("encrypted-text")) ||
    "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Encrypted Text"
      description="A continuously scrambling cipher that decrypts from left to right into a readable message while keeping every character locked in place."
      preview={<EncryptedTextPlayground />}
      personalizeContent={<EncryptedTextPersonalizePanel />}
      previewCode={basicUsageCode}
      installPackageName="encrypted-text"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/encrypted-text.tsx"
      usageCode={<LiveCodeBlock slug="encrypted-text" defaultCode={basicUsageCode} />}
      fullWidthPreview
      props={[
        {
          name: "text",
          type: "string",
          default: '"DAVINCIUI"',
          description: "The readable value revealed at the end of each cycle.",
        },
        {
          name: "characters",
          type: "string",
          default: '"A-Z, 0-9 and symbols"',
          description: "Characters sampled while the value is encrypted.",
        },
        {
          name: "scrambleDuration",
          type: "number",
          default: "520",
          description:
            "Time spent fully encrypted before decryption starts, in milliseconds.",
        },
        {
          name: "revealDuration",
          type: "number",
          default: "1100",
          description:
            "Duration of the left-to-right decryption, in milliseconds.",
        },
        {
          name: "holdDuration",
          type: "number",
          default: "1500",
          description:
            "Time the readable value remains visible, in milliseconds.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description: "Repeat the encryption and decryption sequence.",
        },
        {
          name: "encryptedColor",
          type: "string",
          default: '"#5f845c"',
          description: "Color of unresolved cipher characters.",
        },
        {
          name: "revealedColor",
          type: "string",
          default: '"currentColor"',
          description: "Color of resolved characters.",
        },
        {
          name: "fontSize",
          type: "number | string",
          default: "80",
          description: "Font size. Numbers become px; strings pass through.",
        },
        {
          name: "fontWeight",
          type: "number",
          default: "700",
          description: "Font weight applied to every character.",
        },
        {
          name: "letterSpacing",
          type: "number | string",
          default: '"0.08em"',
          description: "Spacing between cipher characters.",
        },
        {
          name: "fontFamily",
          type: "string",
          default: '"ui-monospace, ..."',
          description: "Font family applied to every character.",
        },
        {
          name: "className",
          type: "string",
          description: "Additional classes for the outer element.",
        },
      ]}
    />
  );
}
