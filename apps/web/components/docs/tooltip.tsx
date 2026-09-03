import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  TooltipPreview,
  TooltipPlacementPreview,
  TooltipShortcutPreview,
  TooltipDisabledPreview,
  TooltipRtlPreview,
} from "@/components/docs/previews/tooltip-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"`;

const defaultCode = `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`;

export async function TooltipDocs() {
  const sourceCode = (await readComponentSource("tooltip")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Tooltip"
      description="A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
      preview={<TooltipPreview />}
      previewCode={defaultCode}
      installPackageName="tooltip"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/tooltip.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">TooltipProvider</code> →{" "}
            <code className="font-mono text-xs">Tooltip</code> →{" "}
            <code className="font-mono text-xs">TooltipTrigger</code> +{" "}
            <code className="font-mono text-xs">TooltipContent</code>.
          </p>
          <p>
            <strong className="text-foreground">Placement:</strong> Use{" "}
            <code className="font-mono text-xs">side=&quot;top | right | bottom | left&quot;</code> and{" "}
            <code className="font-mono text-xs">align=&quot;start | center | end&quot;</code> on{" "}
            <code className="font-mono text-xs">TooltipContent</code>.
          </p>
          <p>
            <strong className="text-foreground">Disabled:</strong> Wrap disabled{" "}
            <code className="font-mono text-xs">Button</code> in{" "}
            <code className="font-mono text-xs">{"<span tabIndex={0}>"}</code> so tooltip can receive hover/focus.
          </p>
        </div>
      }
      examples={[
        { title: "Placement", preview: <TooltipPlacementPreview />, code: `<TooltipContent side="top">Top</TooltipContent>\n<TooltipContent side="bottom">Bottom</TooltipContent>\n<TooltipContent side="left">Left</TooltipContent>\n<TooltipContent side="right">Right</TooltipContent>` },
        { title: "With Keyboard Shortcut", preview: <TooltipShortcutPreview />, code: `<TooltipContent>\n  <span>Save</span>\n  <Kbd>⌘S</Kbd>\n</TooltipContent>` },
        { title: "Disabled Button", preview: <TooltipDisabledPreview />, code: `<Tooltip>\n  <TooltipTrigger asChild>\n    <span tabIndex={0}>\n      <Button disabled>Disabled</Button>\n    </span>\n  </TooltipTrigger>\n  <TooltipContent>This action is disabled</TooltipContent>\n</Tooltip>` },
        { title: "RTL", preview: <TooltipRtlPreview />, code: `<div dir="rtl">\n  <Tooltip>\n    <TooltipTrigger>مرر</TooltipTrigger>\n  </Tooltip>\n</div>` },
      ]}
      props={[
        { name: "TooltipProvider", type: "Component", description: "Wraps tooltips to control delay. Props: delay." },
        { name: "Tooltip", type: "Component", description: "Root." },
        { name: "TooltipTrigger", type: "Component", description: "Element that triggers tooltip. Supports asChild." },
        { name: "TooltipContent", type: "Component", description: "Popup content. Props: side, align, sideOffset." },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Preferred side." },
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
