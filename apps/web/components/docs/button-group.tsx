import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ButtonGroupPreview,
  ButtonGroupSegmentedPreview,
  ButtonGroupToolbarPreview,
  ButtonGroupOrientationPreview,
  ButtonGroupSizePreview,
  ButtonGroupNestedPreview,
  ButtonGroupSeparatorPreview,
  ButtonGroupSplitPreview,
  ButtonGroupInputPreview,
  ButtonGroupInputGroupPreview,
  ButtonGroupDropdownPreview,
  ButtonGroupSelectPreview,
  ButtonGroupPopoverPreview,
  ButtonGroupRtlPreview,
} from "@/components/docs/previews/button-group-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"`;
const defaultCode = `<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Middle</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>`;

export async function ButtonGroupDocs() {
  const sourceCode = (await readComponentSource("button-group")) || "// Unable to load source code - run generate-registry";

  return (
    <DocsPageLayout
      title="Button Group"
      description="A connected instrument or frosted segmented tray for related actions — RTL-safe radius surgery, inset dividers, hover seam elevation, and composition with inputs and dropdowns."
      preview={<ButtonGroupPreview />}
      previewCode={defaultCode}
      installPackageName="button-group"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/button-group.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> Wrap <code className="font-mono text-xs">Button</code>, <code className="font-mono text-xs">input</code>, or <code className="font-mono text-xs">select</code> inside <code className="font-mono text-xs">ButtonGroup</code>. Use <code className="font-mono text-xs">ButtonGroupSeparator</code> for dividers and <code className="font-mono text-xs">ButtonGroupText</code> for static text/icons.</p>
          <p><strong className="text-foreground">Accessibility:</strong> Group has <code className="font-mono text-xs">role="group"</code> semantics; ensure each button has discernible text and <code className="font-mono text-xs">aria-label</code> for icon-only buttons.</p>
          <p><strong className="text-foreground">ButtonGroup vs ToggleGroup:</strong> Use <code className="font-mono text-xs">ButtonGroup</code> for collective actions (e.g., toolbar). Use <code className="font-mono text-xs">ToggleGroup</code> when buttons maintain selected state.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <ButtonGroupPreview />, code: defaultCode },
        {
          title: "Segmented",
          preview: <ButtonGroupSegmentedPreview />,
          code: `<ButtonGroup variant="segmented">\n  <Button variant="ghost" size="sm">Day</Button>\n  <Button variant="ghost" size="sm">Week</Button>\n  <Button variant="ghost" size="sm">Month</Button>\n</ButtonGroup>`,
        },
        {
          title: "Toolbar",
          preview: <ButtonGroupToolbarPreview />,
          code: `<ButtonGroup variant="segmented" aria-label="Formatting">\n  <Button variant="ghost" size="icon-sm" aria-label="Bold"><Bold /></Button>\n  <Button variant="ghost" size="icon-sm" aria-label="Italic"><Italic /></Button>\n  <ButtonGroupSeparator orientation="vertical" />\n  <Button variant="ghost" size="icon-sm" aria-label="Align left"><AlignLeft /></Button>\n</ButtonGroup>`,
        },
        { title: "Orientation", preview: <ButtonGroupOrientationPreview />, code: `<ButtonGroup>\n  <Button>Horizontal</Button>\n</ButtonGroup>\n<ButtonGroup orientation="vertical">\n  <Button>Vertical</Button>\n</ButtonGroup>` },
        { title: "Size", preview: <ButtonGroupSizePreview />, code: `<ButtonGroup>\n  <Button size="sm">Small</Button>\n</ButtonGroup>` },
        { title: "Nested", preview: <ButtonGroupNestedPreview />, code: `<ButtonGroup>\n  <Button>One</Button>\n  <ButtonGroup><Button>Nested</Button></ButtonGroup>\n</ButtonGroup>` },
        { title: "Separator", preview: <ButtonGroupSeparatorPreview />, code: `<ButtonGroup>\n  <Button>Left</Button>\n  <ButtonGroupSeparator />\n  <Button>Right</Button>\n</ButtonGroup>` },
        { title: "Split", preview: <ButtonGroupSplitPreview />, code: `<ButtonGroup>\n  <Button>Action</Button>\n  <Button size="icon"><ChevronDown /></Button>\n</ButtonGroup>` },
        { title: "Input", preview: <ButtonGroupInputPreview />, code: `<ButtonGroup>\n  <input placeholder="Search" />\n  <Button>Go</Button>\n</ButtonGroup>` },
        { title: "Input Group", preview: <ButtonGroupInputGroupPreview />, code: `<ButtonGroup>\n  <ButtonGroupText><Search /></ButtonGroupText>\n  <input />\n  <Button>Submit</Button>\n</ButtonGroup>` },
        { title: "Dropdown Menu", preview: <ButtonGroupDropdownPreview />, code: `<ButtonGroup>\n  <Button>Dropdown</Button>\n  <Button size="icon"><ChevronDown /></Button>\n</ButtonGroup>` },
        { title: "Select", preview: <ButtonGroupSelectPreview />, code: `<ButtonGroup>\n  <select><option>Select</option></select>\n  <Button>Apply</Button>\n</ButtonGroup>` },
        { title: "Popover", preview: <ButtonGroupPopoverPreview />, code: `<ButtonGroup>\n  <Button>Popover Trigger</Button>\n  <Button size="icon"><Star /></Button>\n</ButtonGroup>` },
        { title: "RTL", preview: <ButtonGroupRtlPreview />, code: `<div dir="rtl">\n  <ButtonGroup>\n    <Button>يمين</Button>\n    <Button>يسار</Button>\n  </ButtonGroup>\n</div>` },
      ]}
      props={[
        { name: "variant", type: '"connected" | "segmented"', default: '"connected"', description: "Connected shares edges as one instrument; segmented is a frosted tray for distinct controls." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Orientation of the group. Sets aria-orientation when vertical." },
        { name: "className", type: "string", description: "Additional CSS classes." },
        { name: "ButtonGroupSeparator", type: "Component", description: "Visual separator between grouped buttons." },
        { name: "ButtonGroupText", type: "Component", description: "Text container within a button group (e.g., for icons or labels)." },
      ]}
    />
  );
}
