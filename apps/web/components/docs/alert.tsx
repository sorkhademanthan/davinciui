import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AlertPreview,
  AlertInfoPreview,
  AlertSuccessPreview,
  AlertWarningPreview,
  AlertDestructivePreview,
  AlertActionPreview,
  AlertDismissiblePreview,
  AlertCustomColorsPreview,
  AlertRtlPreview,
} from "@/components/docs/previews/alert-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Alert,
  AlertAction,
  AlertBody,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert"`;
const defaultCode = `<Alert>
  <AlertIcon>
    <RocketIcon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
  </AlertBody>
</Alert>`;

export async function AlertDocs() {
  const sourceCode = (await readComponentSource("alert")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Alert"
      description="Callouts with unmistakable tones — five variants, an icon tile, and an action slot. Never another gray box you have to squint at."
      preview={<AlertPreview />}
      previewCode={defaultCode}
      installPackageName="alert"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/alert.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Every variant carries three signals — tinted border, tinted surface, and a tone-matched icon tile — so
            severity reads instantly in either theme. Titles stay neutral for readability; only destructive alarms
            the title too. Actions pin to the inline end; the row mirrors automatically in RTL.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Alert
├── AlertIcon
├── AlertBody
│   ├── AlertTitle
│   └── AlertDescription
└── AlertAction`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Info",
          preview: <AlertInfoPreview />,
          code: `<Alert variant="info">
  <AlertIcon>
    <InfoIcon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>New feature available</AlertTitle>
    <AlertDescription>Enable dark mode in settings.</AlertDescription>
  </AlertBody>
</Alert>`,
        },
        {
          title: "Success",
          preview: <AlertSuccessPreview />,
          code: `<Alert variant="success">
  <AlertIcon>
    <CheckCircle2Icon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>Payment successful</AlertTitle>
    <AlertDescription>Your payment of $29.99 has been processed.</AlertDescription>
  </AlertBody>
</Alert>`,
        },
        {
          title: "Warning",
          preview: <AlertWarningPreview />,
          code: `<Alert variant="warning">
  <AlertIcon>
    <AlertTriangleIcon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>Subscription expiring</AlertTitle>
    <AlertDescription>Your trial ends in 3 days.</AlertDescription>
  </AlertBody>
</Alert>`,
        },
        {
          title: "Destructive",
          preview: <AlertDestructivePreview />,
          code: `<Alert variant="destructive">
  <AlertIcon>
    <OctagonXIcon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>Payment failed</AlertTitle>
    <AlertDescription>Your card was declined.</AlertDescription>
  </AlertBody>
</Alert>`,
        },
        {
          title: "With Action",
          preview: <AlertActionPreview />,
          code: `<Alert>
  <AlertIcon>
    <BellRingIcon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>Dark mode is now available</AlertTitle>
    <AlertDescription>Enable it under settings.</AlertDescription>
  </AlertBody>
  <AlertAction>
    <Button size="sm">Enable</Button>
  </AlertAction>
</Alert>`,
        },
        {
          title: "Dismissible",
          preview: <AlertDismissiblePreview />,
          code: `const [open, setOpen] = React.useState(true)

{open ? (
  <Alert variant="info">
    <AlertIcon>
      <InfoIcon />
    </AlertIcon>
    <AlertBody>
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>Deploys pause Sunday 02:00 UTC.</AlertDescription>
    </AlertBody>
    <AlertAction>
      <button type="button" aria-label="Dismiss announcement" onClick={() => setOpen(false)}>
        <XIcon />
      </button>
    </AlertAction>
  </Alert>
) : null}`,
        },
        {
          title: "Custom Colors",
          preview: <AlertCustomColorsPreview />,
          code: `// Every tone composes — override border, surface,
// tile, and text independently.
<Alert className="border-violet-500/25 bg-violet-500/[0.07]">
  <AlertIcon className="border-violet-500/20 bg-violet-500/10 text-violet-600">
    <RocketIcon />
  </AlertIcon>
  <AlertBody>
    <AlertTitle>Custom accent</AlertTitle>
    <AlertDescription className="text-violet-900/75">
      Fully themeable with utilities.
    </AlertDescription>
  </AlertBody>
</Alert>`,
        },
        {
          title: "RTL",
          preview: <AlertRtlPreview />,
          code: `<div dir="rtl">
  <Alert variant="success">
    <AlertIcon>
      <CheckCircle2Icon />
    </AlertIcon>
    <AlertBody>
      <AlertTitle>تم الدفع بنجاح</AlertTitle>
      <AlertDescription>تمت معالجة الدفع.</AlertDescription>
    </AlertBody>
  </Alert>
</div>`,
        },
      ]}
      props={[
        { name: "variant", type: '"default" | "info" | "success" | "warning" | "destructive"', default: '"default"', description: "Tone. Border, surface, tile, and description all shift." },
        { name: "role", type: "string", default: '"alert"', description: "Root landmark role. Override for status-like usage." },
        { name: "AlertIcon", type: "Component", default: "—", description: "Tone-matched icon tile. Decorative, hidden from assistive tech." },
        { name: "AlertBody", type: "Component", default: "—", description: "Title + description stack." },
        { name: "AlertTitle", type: "Component", default: "—", description: "Neutral title, except destructive which alarms." },
        { name: "AlertDescription", type: "Component", default: "—", description: "Tone-tinted supporting text." },
        { name: "AlertAction", type: "Component", default: "—", description: "End-pinned slot for buttons or dismiss controls." },
        { name: "className", type: "string", description: "Additional CSS classes on any part." },
      ]}
    />
  );
}
