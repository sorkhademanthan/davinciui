import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  DropdownMenuAvatarPreview,
  DropdownMenuBasicPreview,
  DropdownMenuCheckboxesIconsPreview,
  DropdownMenuCheckboxesPreview,
  DropdownMenuComplexPreview,
  DropdownMenuDestructivePreview,
  DropdownMenuIconsPreview,
  DropdownMenuPreview,
  DropdownMenuRadioGroupPreview,
  DropdownMenuRadioIconsPreview,
  DropdownMenuRichPreview,
  DropdownMenuRtlPreview,
  DropdownMenuShortcutsPreview,
  DropdownMenuSubmenuPreview,
} from "@/components/docs/previews/dropdown-menu-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"`;

const defaultCode = `<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

export async function DropdownMenuDocs() {
  const sourceCode = (await readComponentSource("dropdown-menu")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Dropdown Menu"
      description="Displays a menu to the user — such as a set of actions or functions — triggered by a button."
      preview={<DropdownMenuPreview />}
      previewCode={defaultCode}
      installPackageName="dropdown-menu"
      installDependencies="@base-ui/react lucide-react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/dropdown-menu.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">DropdownMenu</code> →{" "}
            <code className="font-mono text-xs">DropdownMenuTrigger</code> +{" "}
            <code className="font-mono text-xs">DropdownMenuContent</code> →{" "}
            <code className="font-mono text-xs">DropdownMenuLabel</code> /{" "}
            <code className="font-mono text-xs">DropdownMenuItem</code> /{" "}
            <code className="font-mono text-xs">DropdownMenuSeparator</code>. Submenus via{" "}
            <code className="font-mono text-xs">DropdownMenuSub</code> →{" "}
            <code className="font-mono text-xs">DropdownMenuSubTrigger</code> +{" "}
            <code className="font-mono text-xs">DropdownMenuSubContent</code>.
          </p>
          <p>
            <strong className="text-foreground">State:</strong> Checkboxes use{" "}
            <code className="font-mono text-xs">DropdownMenuCheckboxItem checked onCheckedChange</code>; single-select
            uses <code className="font-mono text-xs">DropdownMenuRadioGroup value onValueChange</code> +{" "}
            <code className="font-mono text-xs">DropdownMenuRadioItem value</code>.
          </p>
          <p>
            <strong className="text-foreground">Styling:</strong> Destructive actions via{" "}
            <code className="font-mono text-xs">DropdownMenuItem variant=&quot;destructive&quot;</code>; hints via{" "}
            <code className="font-mono text-xs">DropdownMenuShortcut</code>; indent labels with{" "}
            <code className="font-mono text-xs">inset</code>.
          </p>
        </div>
      }
      examples={[
        { title: "Basic", preview: <DropdownMenuBasicPreview />, code: `<DropdownMenu>\n  <DropdownMenuTrigger>Basic</DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem>New file</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>` },
        { title: "Submenu", preview: <DropdownMenuSubmenuPreview />, code: `<DropdownMenuSub>\n  <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>\n  <DropdownMenuSubContent>\n    <DropdownMenuItem>Email link</DropdownMenuItem>\n  </DropdownMenuSubContent>\n</DropdownMenuSub>` },
        { title: "Shortcuts", preview: <DropdownMenuShortcutsPreview />, code: `<DropdownMenuItem>\n  Save <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>\n</DropdownMenuItem>` },
        { title: "Icons", preview: <DropdownMenuIconsPreview />, code: `<DropdownMenuItem icon={<User />}>\n  Profile\n</DropdownMenuItem>` },
        { title: "Checkboxes", preview: <DropdownMenuCheckboxesPreview />, code: `<DropdownMenuCheckboxItem checked={show} onCheckedChange={setShow}>\n  Status Bar\n</DropdownMenuCheckboxItem>` },
        { title: "Checkboxes Icons", preview: <DropdownMenuCheckboxesIconsPreview />, code: `<DropdownMenuCheckboxItem checked={bold} onCheckedChange={setBold}>\n  <Bold /> Bold\n</DropdownMenuCheckboxItem>` },
        { title: "Radio Group", preview: <DropdownMenuRadioGroupPreview />, code: `<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>\n  <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>\n</DropdownMenuRadioGroup>` },
        { title: "Radio Icons", preview: <DropdownMenuRadioIconsPreview />, code: `<DropdownMenuRadioGroup value={align} onValueChange={setAlign}>\n  <DropdownMenuRadioItem value="left"><Mail /> Left</DropdownMenuRadioItem>\n</DropdownMenuRadioGroup>` },
        { title: "Destructive", preview: <DropdownMenuDestructivePreview />, code: `<DropdownMenuItem variant="destructive" icon={<Trash2 />}>\n  Delete\n</DropdownMenuItem>` },
        { title: "Rich items", preview: <DropdownMenuRichPreview />, code: `<DropdownMenuItem icon={<User />} description="manthan@example.com" badge="Owner">\n  Manthan Sorkhade\n</DropdownMenuItem>\n<DropdownMenuItem icon={<Copy />} kbd={["⌘", "L"]}>\n  Copy link\n</DropdownMenuItem>` },
        { title: "Avatar", preview: <DropdownMenuAvatarPreview />, code: `<DropdownMenuLabel>...user card...</DropdownMenuLabel>\n<DropdownMenuGroup>\n  <DropdownMenuItem><UserPlus /> Invite</DropdownMenuItem>\n</DropdownMenuGroup>` },
        { title: "Complex", preview: <DropdownMenuComplexPreview />, code: `<DropdownMenuContent>\n  <DropdownMenuLabel>My Account</DropdownMenuLabel>\n  <DropdownMenuGroup>...</DropdownMenuGroup>\n  <DropdownMenuSub>...</DropdownMenuSub>\n  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>\n</DropdownMenuContent>` },
        { title: "RTL", preview: <DropdownMenuRtlPreview />, code: `<div dir="rtl">\n  <DropdownMenu>\n    <DropdownMenuTrigger>فتح القائمة</DropdownMenuTrigger>\n  </DropdownMenu>\n</div>` },
      ]}
      props={[
        { name: "DropdownMenu", type: "Component", description: "Root. Controls open state." },
        { name: "DropdownMenuTrigger", type: "Component", description: "Button that opens the menu. Supports asChild." },
        { name: "DropdownMenuContent", type: "Component", description: "Popup menu. Props: align, side, sideOffset, alignOffset, collisionPadding." },
        { name: "DropdownMenuItem", type: "Component", description: "Menu action. Props: inset, variant (default | destructive), icon, description, shortcut, kbd, badge." },
        { name: "DropdownMenuLabel", type: "Component", description: "Section label. Prop: inset." },
        { name: "DropdownMenuSeparator", type: "Component", description: "Divider line between sections." },
        { name: "DropdownMenuShortcut", type: "Component", description: "Keyboard hint, right-aligned." },
        { name: "DropdownMenuGroup", type: "Component", description: "Groups related items." },
        { name: "DropdownMenuCheckboxItem", type: "Component", description: "Toggle item. Props: checked, onCheckedChange, icon, description, shortcut, kbd." },
        { name: "DropdownMenuRadioGroup", type: "Component", description: "Single-select group. Props: value, onValueChange." },
        { name: "DropdownMenuRadioItem", type: "Component", description: "Radio option. Props: value, description, shortcut." },
        { name: "DropdownMenuSub", type: "Component", description: "Submenu root." },
        { name: "DropdownMenuSubTrigger", type: "Component", description: "Opens the submenu. Prop: inset." },
        { name: "DropdownMenuSubContent", type: "Component", description: "Submenu popup." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
