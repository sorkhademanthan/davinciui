import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  DrawerPreview,
  DrawerScrollablePreview,
  DrawerSidePreview,
  DrawerResponsivePreview,
  DrawerRtlPreview,
} from "@/components/docs/previews/drawer-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"`;

const defaultCode = `<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

export async function DrawerDocs() {
  const sourceCode = (await readComponentSource("drawer")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Drawer"
      description="A drawer component for React. Built on top of Vaul."
      preview={<DrawerPreview />}
      previewCode={defaultCode}
      installPackageName="drawer"
      installDependencies="vaul"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/drawer.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Drawer</code> →{" "}
            <code className="font-mono text-xs">DrawerTrigger</code> +{" "}
            <code className="font-mono text-xs">DrawerContent</code> →{" "}
            <code className="font-mono text-xs">DrawerHeader</code> →{" "}
            <code className="font-mono text-xs">DrawerTitle</code> +{" "}
            <code className="font-mono text-xs">DrawerDescription</code> +{" "}
            <code className="font-mono text-xs">DrawerFooter</code> +{" "}
            <code className="font-mono text-xs">DrawerClose</code>.
          </p>
          <p>
            <strong className="text-foreground">Scrolling:</strong> Keep header/footer sticky with{" "}
            <code className="font-mono text-xs">DrawerContent className=&quot;max-h-[85vh]&quot;</code> + inner{" "}
            <code className="font-mono text-xs">overflow-y-auto flex-1</code>.
          </p>
          <p>
            <strong className="text-foreground">Sides:</strong> Use{" "}
            <code className="font-mono text-xs">direction=&quot;top | right | bottom | left&quot;</code> on{" "}
            <code className="font-mono text-xs">Drawer</code>. Responsive pattern:{" "}
            <code className="font-mono text-xs">Dialog</code> on desktop +{" "}
            <code className="font-mono text-xs">Drawer</code> on mobile via media query.
          </p>
        </div>
      }
      examples={[
        { title: "Scrollable Content", preview: <DrawerScrollablePreview />, code: `<DrawerContent className="max-h-[85vh]">\n  <DrawerHeader className="border-b">...</DrawerHeader>\n  <div className="flex-1 overflow-y-auto p-4">...</div>\n  <DrawerFooter className="border-t">...</DrawerFooter>\n</DrawerContent>` },
        { title: "Sides", preview: <DrawerSidePreview />, code: `<Drawer direction="right">\n  <DrawerTrigger>Right</DrawerTrigger>\n  <DrawerContent>...</DrawerContent>\n</Drawer>` },
        { title: "Responsive Dialog", preview: <DrawerResponsivePreview />, code: `"use client"\nimport { useMediaQuery } from "@/hooks/use-media-query"\nconst isDesktop = useMediaQuery("(min-width: 768px)")\nreturn isDesktop ? <Dialog>...</Dialog> : <Drawer>...</Drawer>` },
        { title: "RTL", preview: <DrawerRtlPreview />, code: `<div dir="rtl">\n  <Drawer direction="right">\n    <DrawerTrigger>فتح الدرج</DrawerTrigger>\n  </Drawer>\n</div>` },
      ]}
      props={[
        { name: "Drawer", type: "Component", description: "Root. Props: direction, shouldScaleBackground, open, onOpenChange." },
        { name: "DrawerTrigger", type: "Component", description: "Button that opens the drawer. Supports asChild." },
        { name: "DrawerContent", type: "Component", description: "Slide-out panel with handle. Handles direction via data attribute." },
        { name: "DrawerHeader", type: "Component", description: "Header wrapper." },
        { name: "DrawerTitle", type: "Component", description: "Accessible title." },
        { name: "DrawerDescription", type: "Component", description: "Accessible description." },
        { name: "DrawerFooter", type: "Component", description: "Footer for actions." },
        { name: "DrawerClose", type: "Component", description: "Close button. Supports asChild." },
        { name: "direction", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Side of the drawer." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
