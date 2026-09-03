import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AvatarBadgePreview,
  AvatarFallbackPreview,
  AvatarGroupCountPreview,
  AvatarGroupPreview,
  AvatarPreview,
  AvatarRtlPreview,
  AvatarSizesPreview,
} from "@/components/docs/previews/avatar-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"`;

const defaultCode = `import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="Aarav Sharma" />
  <AvatarFallback>AS</AvatarFallback>
</Avatar>`;

export async function AvatarDocs() {
  const sourceCode = (await readComponentSource("avatar")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Avatar"
      description="Circular image with initials fallback, status badge, and stacked group — perfect for teams and user profiles."
      preview={<AvatarPreview />}
      previewCode={defaultCode}
      installPackageName="avatar"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/avatar.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Structure:</strong> <code className="font-mono text-xs">Avatar</code> →{" "}
            <code className="font-mono text-xs">AvatarImage</code> + <code className="font-mono text-xs">AvatarFallback</code>. Add{" "}
            <code className="font-mono text-xs">AvatarBadge</code> for online status and <code className="font-mono text-xs">AvatarGroup</code> for stacking.
          </p>
          <p>
            <strong className="text-foreground">Image:</strong> Falls back to initials when <code className="font-mono text-xs">src</code> fails — no extra handlers needed.
          </p>
        </div>
      }
      examples={[
        {
          title: "Fallback",
          preview: <AvatarFallbackPreview />,
          code: `import { Avatar, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarFallback>AS</AvatarFallback>
</Avatar>`,
        },
        {
          title: "Badge",
          preview: <AvatarBadgePreview />,
          code: `import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/avatars/aarav.jpg" alt="Aarav" />
  <AvatarFallback>AS</AvatarFallback>
  <AvatarBadge />
</Avatar>`,
        },
        {
          title: "Group",
          preview: <AvatarGroupPreview />,
          code: `import { AvatarGroup, Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<AvatarGroup>
  <Avatar><AvatarImage src="/a.jpg" /><AvatarFallback>AS</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/b.jpg" /><AvatarFallback>VP</AvatarFallback></Avatar>
  <Avatar><AvatarImage src="/c.jpg" /><AvatarFallback>AR</AvatarFallback></Avatar>
</AvatarGroup>`,
        },
        {
          title: "Group Count",
          preview: <AvatarGroupCountPreview />,
          code: `import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"

<AvatarGroup>
  <Avatar><AvatarImage src="/a.jpg" /></Avatar>
  <Avatar><AvatarImage src="/b.jpg" /></Avatar>
  <AvatarGroupCount>+5</AvatarGroupCount>
</AvatarGroup>`,
        },
        {
          title: "Sizes",
          preview: <AvatarSizesPreview />,
          code: `import { Avatar, AvatarFallback } from "@/components/ui/avatar"

<Avatar className="size-8"><AvatarFallback>S</AvatarFallback></Avatar>
<Avatar className="size-12"><AvatarFallback>M</AvatarFallback></Avatar>
<Avatar className="size-16"><AvatarFallback>L</AvatarFallback></Avatar>`,
        },
        {
          title: "RTL",
          preview: <AvatarRtlPreview />,
          code: `div dir="rtl"

<AvatarGroup>
  <Avatar><AvatarImage src="/a.jpg" /></Avatar>
  <Avatar><AvatarFallback>٣</AvatarFallback></Avatar>
</AvatarGroup>`,
        },
      ]}
      props={[
        { name: "Avatar", type: "Component", description: "Root — relative flex, rounded-full, overflow-hidden." },
        { name: "AvatarImage", type: "Component", description: "Absolute image with auto fallback on error." },
        { name: "AvatarFallback", type: "Component", description: "Centered initials shown when image fails." },
        { name: "AvatarBadge", type: "Component", description: "Status dot — absolute bottom-right, emerald by default." },
        { name: "AvatarGroup", type: "Component", description: "Stacked flex with -space-x-2 and ring." },
        { name: "AvatarGroupCount", type: "Component", description: "Overflow count pill — +5, +99." },
        { name: "className", type: "string", description: "Tailwind classes to resize or theme." },
      ]}
    />
  );
}
