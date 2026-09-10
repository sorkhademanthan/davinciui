import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ProgressControlledPreview,
  ProgressIndeterminatePreview,
  ProgressLabelPreview,
  ProgressPreview,
  ProgressRtlPreview,
  ProgressSizesPreview,
  ProgressStepsPreview,
  ProgressUploadPreview,
  ProgressVariantsPreview,
  ProgressWithLabelValuePreview,
} from "@/components/docs/previews/progress-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"`;
const defaultCode = `<Progress value={60} />`;

export async function ProgressDocs() {
  const sourceCode = (await readComponentSource("progress")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Progress"
      description="Determinate progress with semantic variants, sizes, and label/value composition — plus a built-in indeterminate sweep for unknown waits."
      preview={<ProgressPreview />}
      previewCode={defaultCode}
      installPackageName="progress"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/progress.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Progress</code> renders its track automatically — nest <code className="font-mono text-xs">ProgressLabel</code> and <code className="font-mono text-xs">ProgressValue</code> inside for the header row. Pass <code className="font-mono text-xs">value={`{null}`}</code> when progress can&apos;t be measured.</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <ProgressPreview />, code: defaultCode },
        {
          title: "With label and value",
          preview: <ProgressWithLabelValuePreview />,
          code: `<Progress value={60}>\n  <ProgressLabel>Upload progress</ProgressLabel>\n  <ProgressValue />\n</Progress>`,
        },
        { title: "Label", preview: <ProgressLabelPreview />, code: `<Label>Label</Label>\n<Progress value={45} />` },
        {
          title: "Variants",
          preview: <ProgressVariantsPreview />,
          code: `<Progress value={50} variant="primary" />\n<Progress value={72} variant="success" />\n<Progress value={38} variant="warning" />\n<Progress value={88} variant="destructive" />`,
        },
        {
          title: "Sizes",
          preview: <ProgressSizesPreview />,
          code: `<Progress value={60} size="xs" />\n<Progress value={60} size="sm" />\n<Progress value={60} />\n<Progress value={60} size="lg" />`,
        },
        {
          title: "Indeterminate",
          preview: <ProgressIndeterminatePreview />,
          code: `<Progress value={null} />`,
        },
        {
          title: "Upload",
          preview: <ProgressUploadPreview />,
          code: `const [value, setValue] = useState(0)\n<Progress value={value} variant={value >= 100 ? "success" : "primary"}>\n  <ProgressLabel>sales-dashboard.pdf</ProgressLabel>\n  <ProgressValue />\n</Progress>`,
        },
        {
          title: "Steps",
          preview: <ProgressStepsPreview />,
          code: `<Progress value={step} min={1} max={5} variant="default" />`,
        },
        { title: "Controlled", preview: <ProgressControlledPreview />, code: `const [v,setV]=useState(40)\n<Progress value={v} />\n<Button onClick={()=>setV(v+10)}>+</Button>` },
        { title: "RTL", preview: <ProgressRtlPreview />, code: `<div dir="rtl">\n  <Progress value={60} />\n</div>` },
      ]}
      props={[
        { name: "value", type: "number | null", default: "0", description: "Current value. Null sweeps an indeterminate bar." },
        { name: "min", type: "number", default: "0", description: "Minimum value." },
        { name: "max", type: "number", default: "100", description: "Maximum value." },
        { name: "variant", type: '"primary" | "default" | "success" | "warning" | "destructive"', default: '"primary"', description: "Indicator treatment." },
        { name: "size", type: '"xs" | "sm" | "default" | "lg"', default: '"default"', description: "Track height from hairline to hero." },
        { name: "format / locale / getAriaValueText", type: "Intl + fn", description: "Value formatting and screen-reader text via Base UI." },
        { name: "ProgressLabel / Value", type: "Component", description: "Header row parts composed as children." },
        { name: "ProgressTrack / Indicator", type: "Component", description: "Exported for fully custom layouts." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
