import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ButtonPreview,
  ButtonCursorPreview,
  ButtonSizesPreview,
  ButtonPremiumPreview,
  ButtonLoadingPreview,
  ButtonDefaultPreview,
  ButtonOutlinePreview,
  ButtonSecondaryPreview,
  ButtonGhostPreview,
  ButtonDestructivePreview,
  ButtonLinkPreview,
  ButtonIconPreview,
  ButtonWithIconPreview,
  ButtonRoundedPreview,
  ButtonSpinnerPreview,
  ButtonGroupPreview,
  ButtonAsLinkPreview,
  ButtonRtlPreview,
} from "@/components/docs/previews/button-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Button } from "@/components/ui/button"`;
const defaultCode = `<Button>Default Button</Button>`;

export async function ButtonDocs() {
  const sourceCode = (await readComponentSource("button")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Button"
      description="A tactile, award-grade button with press physics, cursor-tracked spotlight, hover sheen, loading state, and premium gradient / glass / success variants."
      preview={<ButtonPreview />}
      previewCode={defaultCode}
      installPackageName="button"
      installDependencies="class-variance-authority clsx tailwind-merge"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/button.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        {
          title: "Premium",
          preview: <ButtonPremiumPreview />,
          code: `<Button variant="gradient">Gradient</Button>
<Button variant="glass">Glass</Button>
<Button variant="success">Success</Button>`,
        },
        {
          title: "Loading",
          preview: <ButtonLoadingPreview />,
          code: `<Button loading>Submitting</Button>
<Button variant="outline" loading>Saving</Button>`,
        },
        {
          title: "Cursor",
          preview: <ButtonCursorPreview />,
          code: `<Button>Pointer</Button>
<Button disabled>Disabled</Button>`,
        },
        {
          title: "Size",
          preview: <ButtonSizesPreview />,
          code: `<Button size="xs">Extra small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra large</Button>
<Button size="icon">★</Button>`,
        },
        {
          title: "Default",
          preview: <ButtonDefaultPreview />,
          code: `<Button>Default</Button>`,
        },
        {
          title: "Outline",
          preview: <ButtonOutlinePreview />,
          code: `<Button variant="outline">Outline</Button>`,
        },
        {
          title: "Secondary",
          preview: <ButtonSecondaryPreview />,
          code: `<Button variant="secondary">Secondary</Button>`,
        },
        {
          title: "Ghost",
          preview: <ButtonGhostPreview />,
          code: `<Button variant="ghost">Ghost</Button>`,
        },
        {
          title: "Destructive",
          preview: <ButtonDestructivePreview />,
          code: `<Button variant="destructive">Destructive</Button>`,
        },
        {
          title: "Link",
          preview: <ButtonLinkPreview />,
          code: `<Button variant="link">Link</Button>`,
        },
        {
          title: "Icon",
          preview: <ButtonIconPreview />,
          code: `<Button size="icon" aria-label="Star">
  <Star className="size-4" />
</Button>`,
        },
        {
          title: "With Icon",
          preview: <ButtonWithIconPreview />,
          code: `<Button>
  <Star className="size-4" />
  With Icon
</Button>`,
        },
        {
          title: "Rounded",
          preview: <ButtonRoundedPreview />,
          code: `<Button className="rounded-full">Rounded</Button>`,
        },
        {
          title: "Spinner",
          preview: <ButtonSpinnerPreview />,
          code: `<Button disabled>
  <Loader2 className="size-4 animate-spin" />
  Loading
</Button>`,
        },
        {
          title: "Button Group",
          preview: <ButtonGroupPreview />,
          code: `<div className="inline-flex -space-x-px rounded-md shadow-sm">
  <Button variant="outline" className="rounded-r-none">Left</Button>
  <Button variant="outline" className="rounded-none border-l-0">Middle</Button>
  <Button variant="outline" className="rounded-l-none border-l-0">Right</Button>
</div>`,
        },
        {
          title: "As Link",
          preview: <ButtonAsLinkPreview />,
          code: `<Button asChild>
  <a href="#">As Link</a>
</Button>`,
        },
        {
          title: "RTL",
          preview: <ButtonRtlPreview />,
          code: `<div dir="rtl">
  <Button>RTL</Button>
</div>`,
        },
      ]}
      props={[
        {
          name: "variant",
          type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "gradient" | "glass"',
          default: '"default"',
          description: "Visual style of the button.",
        },
        {
          name: "size",
          type: '"xs" | "sm" | "default" | "lg" | "xl" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
          default: '"default"',
          description: "Size of the button.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          description:
            "Shows a spinner, announces via aria-busy, and blocks re-clicks.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render as child via Radix Slot (e.g., as link).",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes.",
        },
        {
          name: "style",
          type: "CSSProperties",
          description: "Additional inline styles.",
        },
      ]}
    />
  );
}
