import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ProgressPreview,
  ProgressWithLabelValuePreview,
  ProgressLabelPreview,
  ProgressControlledPreview,
  ProgressRtlPreview,
} from "@/components/docs/previews/progress-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import { Progress } from "@/components/ui/progress"`;
const defaultCode = `<Progress value={60} />`;

export async function ProgressDocs() {
  const sourceCode = (await readComponentSource("progress")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Progress"
      description="Displays an indicator showing the completion progress of a task."
      preview={<ProgressPreview />}
      previewCode={defaultCode}
      installPackageName="progress"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/progress.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
          <p><strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Progress</code> with <code className="font-mono text-xs">value</code> (0–max).</p>
        </div>
      }
      examples={[
        { title: "Composition", preview: <ProgressPreview />, code: defaultCode },
        { title: "With label and value", preview: <ProgressWithLabelValuePreview />, code: `<Label>With label and value 60%</Label>\n<Progress value={60} />` },
        { title: "Label", preview: <ProgressLabelPreview />, code: `<Label>Label</Label>\n<Progress value={45} />` },
        { title: "Controlled", preview: <ProgressControlledPreview />, code: `const [v,setV]=useState(40)\n<Progress value={v} />\n<Button onClick={()=>setV(v+10)}>+</Button>` },
        { title: "RTL", preview: <ProgressRtlPreview />, code: `<div dir="rtl">\n  <Progress value={60} />\n</div>` },
      ]}
      props={[
        { name: "value", type: "number", default: "0", description: "Current progress value." },
        { name: "max", type: "number", default: "100", description: "Maximum value." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
