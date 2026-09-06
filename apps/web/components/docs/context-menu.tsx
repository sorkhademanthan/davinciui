import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BasicContextMenuDemo,
  CheckboxesDemo,
  DestructiveDemo,
  GroupsDemo,
  IconsDemo,
  RadioDemo,
  RtlContextMenuDemo,
  ShortcutsDemo,
  SidesDemo,
  SubmenuDemo,
} from "@/components/docs/previews/context-menu-preview";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu"

export function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>Right-click here</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Cut</ContextMenuItem>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}`;

const compositionNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        A trigger area opens a floating panel at the cursor. Items, labels, separators, checkbox
        and radio states, and nested submenus compose declaratively — the menu owns focus,
        keyboard flow, flipping, and dismissal.
      </p>
    </div>
  </div>
);

export async function ContextMenuDocs() {
  const sourceCode =
    (await readComponentSource("context-menu")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Context Menu"
      description="A right-click menu with submenus, shortcuts, checkbox and radio states, destructive actions, viewport flipping, and RTL."
      preview={
        <div className="flex flex-col items-center justify-center">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-40 w-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground select-none">
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Cut</ContextMenuItem>
              <ContextMenuItem>Copy</ContextMenuItem>
              <ContextMenuItem>Paste</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="context-menu"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/context-menu.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Basic",
          preview: <BasicContextMenuDemo />,
          code: `import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu"

<ContextMenu>
  <ContextMenuTrigger>
    <div>Right-click here</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={cut}>Cut</ContextMenuItem>
    <ContextMenuItem onSelect={copy}>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
        },
        {
          title: "Submenu",
          preview: <SubmenuDemo />,
          code: `import { ContextMenuSub } from "@/components/ui/context-menu"

<ContextMenuSub label="Share" icon={<Share2 />}>
  <ContextMenuItem>Email</ContextMenuItem>
  <ContextMenuItem>Copy link</ContextMenuItem>
</ContextMenuSub>`,
        },
        {
          title: "Shortcuts",
          preview: <ShortcutsDemo />,
          code: `import { ContextMenuItem } from "@/components/ui/context-menu"

<ContextMenuItem shortcut="⌘C">Copy</ContextMenuItem>`,
        },
        {
          title: "Groups",
          preview: <GroupsDemo />,
          code: `import { ContextMenuLabel, ContextMenuSeparator } from "@/components/ui/context-menu"

<ContextMenuLabel>Edit</ContextMenuLabel>
<ContextMenuItem>Undo</ContextMenuItem>
<ContextMenuSeparator />
<ContextMenuLabel>View</ContextMenuLabel>`,
        },
        {
          title: "Icons",
          preview: <IconsDemo />,
          code: `import { ContextMenuItem } from "@/components/ui/context-menu"

<ContextMenuItem icon={<Copy />}>Copy</ContextMenuItem>`,
        },
        {
          title: "Checkboxes",
          preview: <CheckboxesDemo />,
          code: `import { ContextMenuCheckboxItem } from "@/components/ui/context-menu"

<ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
  Show bookmarks bar
</ContextMenuCheckboxItem>`,
        },
        {
          title: "Radio",
          preview: <RadioDemo />,
          code: `import { ContextMenuRadioGroup, ContextMenuRadioItem } from "@/components/ui/context-menu"

<ContextMenuRadioGroup value={sort} onValueChange={setSort}>
  <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
  <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
</ContextMenuRadioGroup>`,
        },
        {
          title: "Destructive",
          preview: <DestructiveDemo />,
          code: `import { ContextMenuItem } from "@/components/ui/context-menu"

<ContextMenuItem destructive icon={<Trash2 />}>
  Delete
</ContextMenuItem>`,
        },
        {
          title: "Sides",
          preview: <SidesDemo />,
          code: `import { ContextMenu } from "@/components/ui/context-menu"

// The panel measures itself and flips to stay inside
// the viewport — no placement props needed.`,
        },
        {
          title: "RTL",
          preview: <RtlContextMenuDemo />,
          code: `import { ContextMenu } from "@/components/ui/context-menu"

<ContextMenu dir="rtl">
  <ContextMenuTrigger>…</ContextMenuTrigger>
  <ContextMenuContent>…</ContextMenuContent>
</ContextMenu>`,
        },
      ]}
      props={[
        { name: "open", type: "boolean", default: "—", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Uncontrolled initial open state." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Fires when the menu opens or closes." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Mirrors submenu sides and chevrons." },
        { name: "ContextMenuItem · shortcut", type: "string", description: "Right-aligned shortcut hint." },
        { name: "ContextMenuItem · icon", type: "React.ReactNode", description: "Leading icon." },
        { name: "ContextMenuItem · destructive", type: "boolean", default: "false", description: "Destructive styling." },
        { name: "ContextMenuItem · onSelect", type: "() => void", description: "Called on select; closes the menu." },
        { name: "ContextMenuCheckboxItem · checked", type: "boolean", default: "—", description: "Controlled checked state." },
        { name: "ContextMenuCheckboxItem · onCheckedChange", type: "(checked: boolean) => void", description: "Fires on toggle." },
        { name: "ContextMenuRadioGroup · value", type: "string", default: "—", description: "Controlled selected value." },
        { name: "ContextMenuRadioGroup · onValueChange", type: "(value: string) => void", description: "Fires on select." },
        { name: "ContextMenuSub · label", type: "React.ReactNode", description: "Submenu trigger label." },
      ]}
    />
  );
}
