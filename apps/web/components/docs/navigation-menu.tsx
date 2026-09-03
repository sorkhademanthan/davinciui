import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  NavigationMenuPreview,
  NavigationMenuWithIconPreview,
  NavigationMenuLinkPreview,
  NavigationMenuRtlPreview,
} from "@/components/docs/previews/navigation-menu-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"`;

const defaultCode = `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/docs">Introduction</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/docs" className={navigationMenuTriggerStyle()}>
        Docs
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`;

export async function NavigationMenuDocs() {
  const sourceCode = (await readComponentSource("navigation-menu")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Navigation Menu"
      description="A collection of links for navigating websites."
      preview={<NavigationMenuPreview />}
      previewCode={defaultCode}
      installPackageName="navigation-menu"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/navigation-menu.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">NavigationMenu</code> →{" "}
            <code className="font-mono text-xs">NavigationMenuList</code> →{" "}
            <code className="font-mono text-xs">NavigationMenuItem</code> →{" "}
            <code className="font-mono text-xs">NavigationMenuTrigger</code> +{" "}
            <code className="font-mono text-xs">NavigationMenuContent</code> /{" "}
            <code className="font-mono text-xs">NavigationMenuLink</code>.
          </p>
          <p>
            <strong className="text-foreground">Link composition:</strong> Use{" "}
            <code className="font-mono text-xs">render=&#123;&lt;Link href=&quot;/docs&quot; /&gt;&#125;</code> on{" "}
            <code className="font-mono text-xs">NavigationMenuLink</code> for Next.js client-side routing, paired with{" "}
            <code className="font-mono text-xs">navigationMenuTriggerStyle()</code>.
          </p>
          <p>
            <strong className="text-foreground">RTL:</strong> Wrap with{" "}
            <code className="font-mono text-xs">dir=&quot;rtl&quot;</code> — trigger icon and popup placement flip automatically via Base UI Direction.
          </p>
        </div>
      }
      examples={[
        { title: "Default", preview: <NavigationMenuPreview />, code: defaultCode },
        {
          title: "With Icon",
          preview: <NavigationMenuWithIconPreview />,
          code: `<NavigationMenuTrigger>\n  <BookOpen className="mr-1.5 size-4" />\n  Docs\n</NavigationMenuTrigger>`,
        },
        {
          title: "Link",
          preview: <NavigationMenuLinkPreview />,
          code: `<NavigationMenuLink render={<Link href="/docs" />} className={navigationMenuTriggerStyle()}>\n  Documentation\n</NavigationMenuLink>`,
        },
        {
          title: "RTL",
          preview: <NavigationMenuRtlPreview />,
          code: `<div dir="rtl">\n  <NavigationMenu>\n    <NavigationMenuTrigger>البدء</NavigationMenuTrigger>\n  </NavigationMenu>\n</div>`,
        },
      ]}
      props={[
        { name: "NavigationMenu", type: "Component", description: "Root nav element. Wraps List + Viewport." },
        { name: "NavigationMenuList", type: "Component", description: "Flex list of items." },
        { name: "NavigationMenuItem", type: "Component", description: "Single item. Wraps Trigger + Content or Link." },
        { name: "NavigationMenuTrigger", type: "Component", description: "Button that opens Content. Shows chevron." },
        { name: "NavigationMenuContent", type: "Component", description: "Popup content for an item." },
        { name: "NavigationMenuLink", type: "Component", description: "Link. Supports render prop for Next.js Link." },
        { name: "navigationMenuTriggerStyle", type: "cva", description: "Shared trigger/link styles for consistent sizing." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
