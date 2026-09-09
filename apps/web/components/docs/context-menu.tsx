import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BasicContextMenuDemo,
  CheckboxesDemo,
  ComposedSubmenuDemo,
  DestructiveDemo,
  DisabledDemo,
  GroupsDemo,
  IconsDemo,
  LongListDemo,
  MultiContextDemo,
  RadioDemo,
  RichItemsDemo,
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
        type-ahead, keyboard flow, flipping, and dismissal. Right-click, Ctrl+click, long-press,
        or Shift+F10 all open it; arrows move, Enter selects, Esc closes.
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
      description="A cursor-anchored right-click menu with type-ahead, submenus, checkable states, and viewport-aware flipping. Opens on right-click, Ctrl+click, long-press, or Shift+F10."
      preview={
        <div className="flex flex-col items-center justify-center">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-40 w-64 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground select-none">
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem shortcut="⌘X">Cut</ContextMenuItem>
              <ContextMenuItem shortcut="⌘C">Copy</ContextMenuItem>
              <ContextMenuItem shortcut="⌘V">Paste</ContextMenuItem>
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
  <ContextMenuItem onClick={cut}>Cut</ContextMenuItem>
  <ContextMenuItem onClick={copy}>Copy</ContextMenuItem>
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
          title: "Composed submenu",
          preview: <ComposedSubmenuDemo />,
          code: `import { ContextMenuSubRoot, ContextMenuSubTrigger, ContextMenuSubContent } from "@/components/ui/context-menu"

// Full control over trigger and content composition.
<ContextMenuSubRoot>
  <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
  <ContextMenuSubContent>
    <ContextMenuLabel>Collaborate</ContextMenuLabel>
    <ContextMenuItem>Email</ContextMenuItem>
  </ContextMenuSubContent>
</ContextMenuSubRoot>`,
        },
        {
          title: "Rich items",
          preview: <RichItemsDemo />,
          code: `import { ContextMenuItem } from "@/components/ui/context-menu"

<ContextMenuItem icon={<FilePenLine />} description="Open in the editor" kbd={["↵"]}>
  Open
</ContextMenuItem>
<ContextMenuItem icon={<Star />} badge="Pro">
  Add to favorites
</ContextMenuItem>`,
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
          title: "Long lists + type-ahead",
          preview: <LongListDemo />,
          code: `import { ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu"

// Tall menus scroll (max 28rem). Press any letter
// to jump to the next matching item.
<ContextMenuContent>
  {teammates.map((name) => (
    <ContextMenuItem key={name}>{name}</ContextMenuItem>
  ))}
</ContextMenuContent>`,
        },
        {
          title: "Disabled",
          preview: <DisabledDemo />,
          code: `import { ContextMenuItem, ContextMenuSub } from "@/components/ui/context-menu"

<ContextMenuItem disabled shortcut="Empty">Paste</ContextMenuItem>
<ContextMenuSub label="More actions" disabled>
  <ContextMenuItem>Never reachable</ContextMenuItem>
</ContextMenuSub>`,
        },
        {
          title: "Multiple contexts",
          preview: <MultiContextDemo />,
          code: `// One component, three surfaces: table rows,
// canvas objects, and editor selections —
// each with a menu tuned to its context.`,
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
        { name: "onOpenChange", type: "(open: boolean, details: { reason?: string }) => void", description: "Fires when the menu opens or closes." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Mirrors submenu sides and chevrons." },
        { name: "ContextMenuContent · sideOffset", type: "number", default: "4", description: "Offset from the cursor along the opening axis." },
        { name: "ContextMenuContent · collisionPadding", type: "number", default: "8", description: "Safe-area padding for viewport flipping." },
        { name: "ContextMenuItem · icon", type: "React.ReactNode", description: "Leading icon." },
        { name: "ContextMenuItem · description", type: "React.ReactNode", description: "Second line of muted detail text." },
        { name: "ContextMenuItem · shortcut", type: "string", description: "Right-aligned shortcut hint." },
        { name: "ContextMenuItem · kbd", type: "string[]", description: "Keycap-style shortcut, e.g. [⌘, C]." },
        { name: "ContextMenuItem · badge", type: "React.ReactNode", description: "Trailing badge / count pill." },
        { name: "ContextMenuItem · destructive", type: "boolean", default: "false", description: "Destructive styling." },
        { name: "ContextMenuItem · inset", type: "boolean", default: "false", description: "Indent to align with checkable items." },
        { name: "ContextMenuItem · closeOnClick", type: "boolean", default: "true", description: "Close the menu after selection." },
        { name: "ContextMenuCheckboxItem · checked", type: "boolean", default: "—", description: "Controlled checked state." },
        { name: "ContextMenuCheckboxItem · onCheckedChange", type: "(checked: boolean) => void", description: "Fires on toggle." },
        { name: "ContextMenuRadioGroup · value", type: "string", default: "—", description: "Controlled selected value." },
        { name: "ContextMenuRadioGroup · onValueChange", type: "(value: string) => void", description: "Fires on select." },
        { name: "ContextMenuSub · label", type: "React.ReactNode", description: "Submenu trigger label." },
        { name: "ContextMenuSub · icon", type: "React.ReactNode", description: "Leading icon on the trigger." },
        { name: "ContextMenuSub · disabled", type: "boolean", default: "false", description: "Disables the submenu trigger." },
      ]}
    />
  );
}
