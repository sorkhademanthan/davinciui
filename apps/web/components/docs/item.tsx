import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ItemAvatarPreview,
  ItemBasicPreview,
  ItemDropdownPreview,
  ItemGroupPreview,
  ItemHeaderPreview,
  ItemImagePreview,
  ItemIconPreview,
  ItemLinkPreview,
  ItemRtlPreview,
  ItemSizesPreview,
  ItemVariantsPreview,
} from "@/components/docs/previews/item-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"`;
const defaultCode = `<Item>
  <ItemMedia variant="icon">
    <Icon />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Title</ItemTitle>
    <ItemDescription>Description</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button>Action</Button>
  </ItemActions>
</Item>`;

export async function ItemDocs() {
  const sourceCode =
    (await readComponentSource("item")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Item"
      description="A versatile flex container for content with media, title, description, and actions. Group it to build lists."
      preview={<ItemBasicPreview />}
      previewCode={defaultCode}
      installPackageName="item"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/item.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Item only displays content. If you need a form input such as a checkbox, input, radio, or select, use{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">Field</code> instead.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`ItemGroup
└── Item
    ├── ItemHeader
    ├── ItemMedia
    ├── ItemContent
    │   ├── ItemTitle
    │   └── ItemDescription
    ├── ItemActions
    └── ItemFooter`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Variant",
          preview: <ItemVariantsPreview />,
          code: `import { Item } from "@/components/ui/item"

<Item>Default — transparent, no border.</Item>
<Item variant="outline">Outlined with a visible border.</Item>
<Item variant="muted">Muted background for secondary content.</Item>`,
        },
        {
          title: "Size",
          preview: <ItemSizesPreview />,
          code: `import { Item } from "@/components/ui/item"

<Item size="default">Standard size.</Item>
<Item size="sm">Compact, for dense layouts.</Item>
<Item size="xs">Most compact available.</Item>`,
        },
        {
          title: "Icon",
          preview: <ItemIconPreview />,
          code: `import { Item, ItemMedia } from "@/components/ui/item"

<Item variant="outline">
  <ItemMedia variant="icon">
    <ShieldAlertIcon />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Security Alert</ItemTitle>
    <ItemDescription>New login detected.</ItemDescription>
  </ItemContent>
</Item>`,
        },
        {
          title: "Avatar",
          preview: <ItemAvatarPreview />,
          code: `import { Item, ItemMedia } from "@/components/ui/item"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Render Avatar (or any media) inside default ItemMedia.
<ItemMedia>
  <Avatar>
    <AvatarFallback>ER</AvatarFallback>
  </Avatar>
</ItemMedia>`,
        },
        {
          title: "Image",
          preview: <ItemImagePreview />,
          code: `import { Item, ItemMedia } from "@/components/ui/item"

<ItemMedia variant="image">
  <img src="/track.jpg" alt="" />
</ItemMedia>`,
        },
        {
          title: "Group",
          preview: <ItemGroupPreview />,
          code: `import { Item, ItemGroup, ItemSeparator } from "@/components/ui/item"

<ItemGroup>
  <Item>{/* … */}</Item>
  <ItemSeparator />
  <Item>{/* … */}</Item>
</ItemGroup>`,
        },
        {
          title: "Header",
          preview: <ItemHeaderPreview />,
          code: `import { Item, ItemHeader, ItemFooter } from "@/components/ui/item"

// Header spans the full row above the content;
// footer spans below it.
<Item variant="outline" className="p-0">
  <ItemHeader>
    <img src="/model.jpg" alt="Model" />
  </ItemHeader>
  <ItemContent>{/* title + description */}</ItemContent>
  <ItemFooter>{/* actions */}</ItemFooter>
</Item>`,
        },
        {
          title: "Link",
          preview: <ItemLinkPreview />,
          code: `import { Item } from "@/components/ui/item"

// render turns the item into a link;
// hover and focus states follow the anchor.
<Item render={<a href="/dashboard" />}>
  <ItemContent>
    <ItemTitle>Dashboard</ItemTitle>
    <ItemDescription>Overview of your account.</ItemDescription>
  </ItemContent>
</Item>`,
        },
        {
          title: "Dropdown",
          preview: <ItemDropdownPreview />,
          code: `import { Item, ItemActions } from "@/components/ui/item"

// Actions host any control — buttons, selects, switches.
<Item variant="outline">
  <ItemContent>
    <ItemTitle>Framework</ItemTitle>
  </ItemContent>
  <ItemActions>
    <NativeSelect aria-label="Framework">{/* options */}</NativeSelect>
  </ItemActions>
</Item>`,
        },
        {
          title: "RTL",
          preview: <ItemRtlPreview />,
          code: `import { Item } from "@/components/ui/item"

<div dir="rtl">
  <Item variant="outline">
    <ItemContent>
      <ItemTitle>عنصر أساسي</ItemTitle>
      <ItemDescription>عنصر بسيط يحتوي على عنوان ووصف.</ItemDescription>
    </ItemContent>
  </Item>
</div>`,
        },
      ]}
      props={[
        { name: "variant", type: '"default" | "outline" | "muted"', default: '"default"', description: "Visual style of the item." },
        { name: "size", type: '"default" | "sm" | "xs"', default: '"default"', description: "Density of the item." },
        { name: "render", type: "ReactElement", default: "—", description: "Render the item as a link or custom element." },
        { name: "variant (media)", type: '"default" | "icon" | "image"', default: '"default"', description: "Media treatment (ItemMedia)." },
        { name: "className", type: "string", description: "Additional classes on any part." },
      ]}
    />
  );
}
