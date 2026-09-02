import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AvatarPreview,
  AvatarBadgePreview,
  AvatarBadgeIconPreview,
  AvatarGroupPreview,
  AvatarGroupCountPreview,
  AvatarGroupIconPreview,
  AvatarSizesPreview,
  AvatarDropdownPreview,
  AvatarRtlPreview,
} from "@/components/docs/previews/avatar-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"`;
const defaultCode = `<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`;

export async function AvatarDocs() {
  const sourceCode = (await readComponentSource("avatar")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Avatar"
      description="An image element with a fallback for representing the user."
      preview={<AvatarPreview />}
      previewCode={defaultCode}
      installPackageName="avatar"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/avatar.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Avatar</code> → <code className="font-mono text-xs">AvatarImage</code> + <code className="font-mono text-xs">AvatarFallback</code>. Use <code className="font-mono text-xs">AvatarBadge</code> for status and <code className="font-mono text-xs">AvatarGroup</code> for stacking.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <AvatarPreview />, code: defaultCode },
        { title: "Basic", preview: <AvatarPreview />, code: defaultCode },
        { title: "Badge", preview: <AvatarBadgePreview />, code: `<Avatar>\n  <AvatarImage src="..." />\n  <AvatarBadge />\n</Avatar>` },
        { title: "Badge with Icon", preview: <AvatarBadgeIconPreview />, code: `<Avatar>\n  <AvatarBadge>✓</AvatarBadge>\n</Avatar>` },
        { title: "Avatar Group", preview: <AvatarGroupPreview />, code: `<AvatarGroup>\n  <Avatar><AvatarImage src="..." /></Avatar>\n  <Avatar><AvatarImage src="..." /></Avatar>\n</AvatarGroup>` },
        { title: "Avatar Group Count", preview: <AvatarGroupCountPreview />, code: `<AvatarGroup>\n  <Avatar /><Avatar />\n  <AvatarGroupCount>+5</AvatarGroupCount>\n</AvatarGroup>` },
        { title: "Avatar Group with Icon", preview: <AvatarGroupIconPreview />, code: `<AvatarGroup>\n  <Avatar /><Avatar />\n  <Avatar><AvatarFallback>+</AvatarFallback></Avatar>\n</AvatarGroup>` },
        { title: "Sizes", preview: <AvatarSizesPreview />, code: `<Avatar className="size-6">S</Avatar>\n<Avatar className="size-10">M</Avatar>\n<Avatar className="size-14">L</Avatar>` },
        { title: "Dropdown", preview: <AvatarDropdownPreview />, code: `<Avatar className="cursor-pointer ring-2 ring-primary">\n  <AvatarImage src="..." />\n</Avatar>` },
        { title: "RTL", preview: <AvatarRtlPreview />, code: `<div dir="rtl">\n  <AvatarGroup>...</AvatarGroup>\n</div>` },
      ]}
      props={[
        { name: "Avatar", type: "Component", description: "Root container." },
        { name: "AvatarImage", type: "Component", description: "Image element." },
        { name: "AvatarFallback", type: "Component", description: "Fallback when image fails." },
        { name: "AvatarBadge", type: "Component", description: "Status badge positioned at corner." },
        { name: "AvatarGroup", type: "Component", description: "Stacked group container." },
        { name: "AvatarGroupCount", type: "Component", description: "Count badge for overflow." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
