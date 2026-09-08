import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  EmptyAvatarGroupPreview,
  EmptyAvatarPreview,
  EmptyBackgroundPreview,
  EmptyBasicPreview,
  EmptyInputGroupPreview,
  EmptyOutlinePreview,
  EmptyRtlPreview,
} from "@/components/docs/previews/empty-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"`;
const defaultCode = `<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon />
    </EmptyMedia>
    <EmptyTitle>No data</EmptyTitle>
    <EmptyDescription>No data found</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add data</Button>
  </EmptyContent>
</Empty>`;

export async function EmptyDocs() {
  const sourceCode =
    (await readComponentSource("empty")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Empty"
      description="Empty states with media, title, description, and actions. For lists, searches, and error pages with nothing to show yet."
      preview={<EmptyBasicPreview />}
      previewCode={defaultCode}
      installPackageName="empty"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/empty.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Empty is layout only — it centers and spaces your content. Bring your own icon, avatar, buttons, or
            inputs; the parts only own alignment and rhythm.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Empty
├── EmptyHeader
│   ├── EmptyMedia
│   ├── EmptyTitle
│   └── EmptyDescription
└── EmptyContent`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Outline",
          preview: <EmptyOutlinePreview />,
          code: `import { Empty } from "@/components/ui/empty"

// The border utility turns it into a drop-zone card.
<Empty className="border border-dashed">
  <EmptyHeader>{/* media + title + description */}</EmptyHeader>
  <EmptyContent>
    <Button size="sm">Upload Files</Button>
  </EmptyContent>
</Empty>`,
        },
        {
          title: "Background",
          preview: <EmptyBackgroundPreview />,
          code: `import { Empty } from "@/components/ui/empty"

// bg-* and bg-gradient-* utilities layer behind the content.
<Empty className="bg-muted/40 bg-[radial-gradient(circle_at_50%_0%,var(--primary)/8%,transparent_60%)]">
  {/* header + content */}
</Empty>`,
        },
        {
          title: "Avatar",
          preview: <EmptyAvatarPreview />,
          code: `import { Empty, EmptyMedia } from "@/components/ui/empty"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Default media hosts anything — avatars included.
<EmptyMedia>
  <Avatar>
    <AvatarFallback>LR</AvatarFallback>
  </Avatar>
</EmptyMedia>`,
        },
        {
          title: "Avatar Group",
          preview: <EmptyAvatarGroupPreview />,
          code: `import { Empty, EmptyMedia } from "@/components/ui/empty"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"

<EmptyMedia>
  <AvatarGroup>
    <Avatar>
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>LR</AvatarFallback>
    </Avatar>
  </AvatarGroup>
</EmptyMedia>`,
        },
        {
          title: "InputGroup",
          preview: <EmptyInputGroupPreview />,
          code: `import { Empty, EmptyContent } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

// Actions host inputs too — search from the empty state.
<EmptyContent>
  <InputGroup>
    <InputGroupAddon align="inline-start">
      <SearchIcon />
    </InputGroupAddon>
    <InputGroupInput placeholder="Search docs…" aria-label="Search docs" />
    <InputGroupButton type="submit">Search</InputGroupButton>
  </InputGroup>
</EmptyContent>`,
        },
        {
          title: "RTL",
          preview: <EmptyRtlPreview />,
          code: `import { Empty } from "@/components/ui/empty"

<div dir="rtl">
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <FolderCodeIcon />
      </EmptyMedia>
      <EmptyTitle>لا توجد مشاريع بعد</EmptyTitle>
      <EmptyDescription>لم تقم بإنشاء أي مشاريع بعد.</EmptyDescription>
    </EmptyHeader>
  </Empty>
</div>`,
        },
      ]}
      props={[
        { name: "variant", type: '"default" | "icon"', default: '"default"', description: "Icon tile treatment (EmptyMedia)." },
        { name: "className", type: "string", description: "Additional classes on any part. Border and bg utilities restyle the card." },
      ]}
    />
  );
}
