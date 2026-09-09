import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AvatarBadgeIconPreview,
  AvatarBadgePreview,
  AvatarDropdownPreview,
  AvatarFallbackPreview,
  AvatarGroupCountPreview,
  AvatarGroupIconPreview,
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
  <AvatarFallback name="Aarav Sharma" />
</Avatar>`;

export async function AvatarDocs() {
  const sourceCode = (await readComponentSource("avatar")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Avatar"
      description="Identity in a circle — Base UI loading states, five sizes, presence badges, generative fallbacks, and groups that collapse themselves."
      preview={<AvatarPreview />}
      previewCode={defaultCode}
      installPackageName="avatar"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/avatar.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Pass a <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">name</code> to the fallback
            and it renders initials on a stable generative tint — no two teammates share a color by accident, and no
            image request is needed. Sizes cascade: badge, fallback type, and group count all scale with the avatar.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Avatar
├── AvatarImage
├── AvatarFallback
└── AvatarBadge

AvatarGroup
├── Avatar × n
└── AvatarGroupCount (or max={n})`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Fallback",
          preview: <AvatarFallbackPreview />,
          code: `import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// name → initials + deterministic tint. Children win when provided.
<Avatar>
  <AvatarFallback name="Aarav Sharma" />
</Avatar>`,
        },
        {
          title: "Badge",
          preview: <AvatarBadgePreview />,
          code: `import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar"

// online · busy · away · offline — scales with size, mirrors in RTL.
<Avatar>
  <AvatarFallback name="Aarav Sharma" />
  <AvatarBadge status="online" />
</Avatar>`,
        },
        {
          title: "Badge with Icon",
          preview: <AvatarBadgeIconPreview />,
          code: `import { AvatarBadge } from "@/components/ui/avatar"

<AvatarBadge className="flex size-4 items-center justify-center bg-primary text-primary-foreground">
  <PlusIcon />
</AvatarBadge>`,
        },
        {
          title: "Group",
          preview: <AvatarGroupPreview />,
          code: `import { AvatarGroup } from "@/components/ui/avatar"

// Overlapping stack with hairline rings — fans out on hover.
<AvatarGroup>
  <Avatar>{/* … */}</Avatar>
  <Avatar>{/* … */}</Avatar>
  <Avatar>{/* … */}</Avatar>
</AvatarGroup>`,
        },
        {
          title: "Group Count",
          preview: <AvatarGroupCountPreview />,
          code: `import { AvatarGroup } from "@/components/ui/avatar"

// max collapses the rest into +N automatically.
<AvatarGroup max={3}>
  <Avatar>{/* … */}</Avatar>
  <Avatar>{/* … */}</Avatar>
  <Avatar>{/* … */}</Avatar>
  <Avatar>{/* … */}</Avatar>
</AvatarGroup>`,
        },
        {
          title: "Group Icon",
          preview: <AvatarGroupIconPreview />,
          code: `import { AvatarGroup } from "@/components/ui/avatar"

// Any avatar can carry an action face.
<AvatarGroup max={2}>
  <Avatar>{/* … */}</Avatar>
  <Avatar>{/* … */}</Avatar>
  <Avatar>
    <AvatarFallback className="bg-primary text-primary-foreground">
      <PlusIcon />
    </AvatarFallback>
  </Avatar>
</AvatarGroup>`,
        },
        {
          title: "Sizes",
          preview: <AvatarSizesPreview />,
          code: `import { Avatar } from "@/components/ui/avatar"

// xs · sm · default · lg · xl — badge and fallback type follow.
<Avatar size="xs" />
<Avatar size="sm" />
<Avatar size="default" />
<Avatar size="lg" />
<Avatar size="xl" />`,
        },
        {
          title: "Dropdown",
          preview: <AvatarDropdownPreview />,
          code: `import { Avatar } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Avatar>{/* … */}</Avatar>
  </DropdownMenuTrigger>
  {/* menu content */}
</DropdownMenu>`,
        },
        {
          title: "RTL",
          preview: <AvatarRtlPreview />,
          code: `<div dir="rtl">
  <AvatarGroup max={3}>{/* … */}</AvatarGroup>
</div>`,
        },
      ]}
      props={[
        { name: "size", type: '"xs" | "sm" | "default" | "lg" | "xl"', default: '"default"', description: "Diameter. Badge, fallback type, and count inherit it." },
        { name: "name", type: "string", default: "—", description: "Fallback full name → initials plus stable tint." },
        { name: "status", type: '"online" | "busy" | "away" | "offline"', default: '"online"', description: "Presence tone (AvatarBadge)." },
        { name: "max", type: "number", default: "—", description: "Auto-collapse group beyond N avatars into +N (AvatarGroup)." },
        { name: "src", type: "string", default: "—", description: "Image source with Base UI loading states (AvatarImage)." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
