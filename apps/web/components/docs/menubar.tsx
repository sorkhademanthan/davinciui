import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  MenubarBasicPreview,
  MenubarCheckboxPreview,
  MenubarIconsPreview,
  MenubarRadioPreview,
  MenubarRtlPreview,
  MenubarSubmenuPreview,
} from "@/components/docs/previews/menubar-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"`;
const defaultCode = `import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

export function Example() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}`;

export async function MenubarDocs() {
  const sourceCode =
    (await readComponentSource("menubar")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Menubar"
      description="A horizontal bar of dropdown menus with checkbox, radio, submenu, and shortcut support. Built for app-style menu bars."
      preview={<MenubarBasicPreview />}
      previewCode={defaultCode}
      installPackageName="menubar"
      installDependencies="@base-ui/react lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/menubar.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Each top-level trigger owns a <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">MenubarMenu</code> with
            its own content. Once a menu is open, hovering or arrow-keying across triggers switches menus without
            extra clicks.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Menubar
└── MenubarMenu
    ├── MenubarTrigger
    └── MenubarContent
        ├── MenubarItem (+ MenubarShortcut)
        ├── MenubarCheckboxItem
        ├── MenubarRadioGroup + MenubarRadioItem
        └── MenubarSub → MenubarSubTrigger + MenubarSubContent`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Checkbox",
          preview: <MenubarCheckboxPreview />,
          code: `import { MenubarCheckboxItem, MenubarLabel } from "@/components/ui/menubar"

<MenubarContent>
  <MenubarLabel>Appearance</MenubarLabel>
  <MenubarCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
    Show Bookmarks Bar
  </MenubarCheckboxItem>
  <MenubarCheckboxItem checked={urls} onCheckedChange={setUrls}>
    Show Full URLs
  </MenubarCheckboxItem>
</MenubarContent>`,
        },
        {
          title: "Radio",
          preview: <MenubarRadioPreview />,
          code: `import { MenubarRadioGroup, MenubarRadioItem } from "@/components/ui/menubar"

<MenubarContent>
  <MenubarLabel>Switch profile</MenubarLabel>
  <MenubarRadioGroup value={profile} onValueChange={setProfile}>
    <MenubarRadioItem value="personal">Personal</MenubarRadioItem>
    <MenubarRadioItem value="work">Work</MenubarRadioItem>
    <MenubarRadioItem value="school">School</MenubarRadioItem>
  </MenubarRadioGroup>
</MenubarContent>`,
        },
        {
          title: "Submenu",
          preview: <MenubarSubmenuPreview />,
          code: `import { MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@/components/ui/menubar"

<MenubarSub>
  <MenubarSubTrigger>Share</MenubarSubTrigger>
  <MenubarSubContent>
    <MenubarItem>Email</MenubarItem>
    <MenubarItem>Message</MenubarItem>
    <MenubarItem>Notes</MenubarItem>
  </MenubarSubContent>
</MenubarSub>`,
        },
        {
          title: "With Icons",
          preview: <MenubarIconsPreview />,
          code: `import { MenubarItem, MenubarShortcut } from "@/components/ui/menubar"

// Leading icons size automatically; pair destructive
// actions with variant="destructive".
<MenubarItem>
  <UserIcon /> Profile <MenubarShortcut>⇧⌘P</MenubarShortcut>
</MenubarItem>
<MenubarItem variant="destructive">
  <LogOutIcon /> Log out <MenubarShortcut>⇧⌘Q</MenubarShortcut>
</MenubarItem>`,
        },
        {
          title: "RTL",
          preview: <MenubarRtlPreview />,
          code: `import { Menubar } from "@/components/ui/menubar"

<div dir="rtl">
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>ملف</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>مستند جديد</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</div>`,
        },
      ]}
      props={[
        { name: "modal", type: "boolean", default: "true", description: "Whether the menubar takes over pointer interaction while open." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole bar, a menu trigger, or an item." },
        { name: "checked", type: "boolean", default: "—", description: "Controlled state (MenubarCheckboxItem)." },
        { name: "value", type: "string", default: "—", description: "Radio group value or radio item value." },
        { name: "onValueChange", type: "(value: string) => void", default: "—", description: "Radio group change handler." },
        { name: "inset", type: "boolean", default: "—", description: "Indent label-less items to align with checkable rows." },
        { name: "variant", type: '"default" | "destructive"', default: '"default"', description: "Item tone (MenubarItem)." },
        { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Content alignment to its trigger." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
