import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  CardEdgeToEdgePreview,
  CardElevatedPreview,
  CardGlassPreview,
  CardImagePreview,
  CardInteractivePreview,
  CardMediaPreview,
  CardMetricPreview,
  CardOutlinePreview,
  CardPreview,
  CardRtlPreview,
  CardSmallPreview,
  CardSpacingPreview,
  CardSpotlightPreview,
  CardStatusPreview,
} from "@/components/docs/previews/card-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardMedia,
  CardMetric,
  CardTitle,
} from "@/components/ui/card"`;

const defaultCode = `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>`;

export async function CardDocs() {
  const sourceCode = (await readComponentSource("card")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Card"
      description="A layered surface with header, content, and footer — semantic by default, clickable via asChild, with spotlight glow, status edges, KPI metrics, and CLS-safe media."
      preview={<CardPreview />}
      previewCode={defaultCode}
      installPackageName="card"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/card.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong> <code className="font-mono text-xs">Card</code> →{" "}
            <code className="font-mono text-xs">CardHeader</code> (
            <code className="font-mono text-xs">CardTitle</code> +{" "}
            <code className="font-mono text-xs">CardDescription</code> +{" "}
            <code className="font-mono text-xs">CardAction</code>) +{" "}
            <code className="font-mono text-xs">CardContent</code> +{" "}
            <code className="font-mono text-xs">CardFooter</code>.
          </p>
          <p>
            <strong className="text-foreground">Spacing:</strong> Section gaps and insets follow the{" "}
            <code className="font-mono text-xs">--card-spacing</code> CSS variable — override per card with{" "}
            <code className="font-mono text-xs">className=&quot;[--card-spacing:--spacing(6)]&quot;</code>.
          </p>
          <p>
            <strong className="text-foreground">Clickable:</strong> never put{" "}
            <code className="font-mono text-xs">onClick</code> on a{" "}
            <code className="font-mono text-xs">div</code> — use{" "}
            <code className="font-mono text-xs">interactive asChild</code> with a real{" "}
            <code className="font-mono text-xs">a</code>,{" "}
            <code className="font-mono text-xs">button</code>, or{" "}
            <code className="font-mono text-xs">Link</code> child so keyboard, screen
            reader, and middle-click keep working.
          </p>
          <p>
            <strong className="text-foreground">Loading:</strong> match the layout with{" "}
            <code className="font-mono text-xs">Skeleton</code> lines inside{" "}
            <code className="font-mono text-xs">CardContent</code> and set{" "}
            <code className="font-mono text-xs">aria-busy=&quot;true&quot;</code> — never a
            spinner for content loading.
          </p>
          <p>
            <strong className="text-foreground">Edge to edge:</strong> Bleed content with{" "}
            <code className="font-mono text-xs">-mx-(--card-spacing)</code> and drop the section gap above a footer
            with <code className="font-mono text-xs">-mb-(--card-spacing)</code> on{" "}
            <code className="font-mono text-xs">CardContent</code>.
          </p>
        </div>
      }
      examples={[
        { title: "Interactive", preview: <CardInteractivePreview />, code: `<Card interactive asChild>\n  <a href="/changelog">\n    <CardHeader>\n      <CardTitle>Clickable card</CardTitle>\n    </CardHeader>\n  </a>\n</Card>` },
        { title: "Status", preview: <CardStatusPreview />, code: `<Card status="success">\n  <CardHeader>\n    <CardTitle>Deploy succeeded</CardTitle>\n  </CardHeader>\n</Card>` },
        { title: "Metric", preview: <CardMetricPreview />, code: `<Card>\n  <CardHeader>\n    <CardEyebrow>MRR</CardEyebrow>\n  </CardHeader>\n  <CardContent>\n    <CardMetric>$48,290</CardMetric>\n  </CardContent>\n</Card>` },
        { title: "Media", preview: <CardMediaPreview />, code: `<Card>\n  <CardMedia>\n    <img src="..." alt="Cover" width={640} height={360} loading="lazy" />\n  </CardMedia>\n  <CardHeader>...</CardHeader>\n</Card>` },
        { title: "Elevated", preview: <CardElevatedPreview />, code: `<Card variant="elevated">\n  <CardHeader>\n    <CardTitle>Pro workspace</CardTitle>\n  </CardHeader>\n  <CardContent>...</CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Spotlight", preview: <CardSpotlightPreview />, code: `<Card spotlight>\n  <CardHeader>\n    <CardTitle>Move your cursor</CardTitle>\n  </CardHeader>\n  <CardContent>...</CardContent>\n</Card>` },
        { title: "Glass", preview: <CardGlassPreview />, code: `<Card variant="glass">\n  <CardHeader>\n    <CardTitle>Floating panel</CardTitle>\n  </CardHeader>\n  <CardContent>...</CardContent>\n</Card>` },
        { title: "Outline", preview: <CardOutlinePreview />, code: `<Card variant="outline">\n  <CardHeader>\n    <CardTitle>Dense dashboard tile</CardTitle>\n  </CardHeader>\n  <CardContent>...</CardContent>\n</Card>` },
        { title: "Size", preview: <CardSmallPreview />, code: `<Card size="sm">\n  <CardHeader>\n    <CardTitle>Compact card</CardTitle>\n    <CardDescription>Small size variant.</CardDescription>\n  </CardHeader>\n  <CardContent>...</CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Spacing", preview: <CardSpacingPreview />, code: `<Card className="[--card-spacing:--spacing(6)]">\n  <CardHeader>...</CardHeader>\n  <CardContent>...</CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Edge to Edge", preview: <CardEdgeToEdgePreview />, code: `<Card>\n  <CardHeader>...</CardHeader>\n  <CardContent className="-mb-(--card-spacing)">\n    <img className="-mx-(--card-spacing) w-[calc(100%+var(--card-spacing)*2)]" />\n  </CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Image", preview: <CardImagePreview />, code: `<Card>\n  <img src="..." alt="Cover" className="h-40 w-full object-cover" />\n  <CardHeader>\n    <CardTitle>Card with image</CardTitle>\n  </CardHeader>\n  <CardContent>...</CardContent>\n</Card>` },
        { title: "RTL", preview: <CardRtlPreview />, code: `<div dir="rtl">\n  <Card>\n    <CardHeader>\n      <CardTitle>عنوان البطاقة</CardTitle>\n    </CardHeader>\n  </Card>\n</div>` },
      ]}
      props={[
        { name: "Card", type: "Component", description: "Root container for card content." },
        { name: "variant", type: '"default" | "elevated" | "outline" | "glass"', default: '"default"', description: "Surface treatment. Elevated lifts on hover; glass is frosted for overlays." },
        { name: "size", type: '"sm" | "default" | "lg"', default: '"default"', description: "Card density via the shared --card-spacing variable (Card)." },
        { name: "asChild", type: "boolean", default: "false", description: "Render on a semantic child (<a>, <button>, <Link>). Required for clickable cards (Card, CardTitle)." },
        { name: "interactive", type: "boolean", default: "false", description: "Clickable affordance — hover lift, press compression, keyboard focus ring. Combine with asChild (Card)." },
        { name: "selected", type: "boolean", default: "false", description: "Selected state for pickers and grids. Sets data-selected (Card)." },
        { name: "status", type: '"default" | "success" | "info" | "warning" | "destructive"', default: '"default"', description: "2px gradient accent along the top edge. Sets data-status (Card)." },
        { name: "spotlight", type: "boolean", default: "false", description: "Cursor-tracked surface wash + border glow. Use on one featured card per view (Card)." },
        { name: "CardHeader", type: "Component", description: "Title, description, and optional action row." },
        { name: "CardEyebrow", type: "Component", description: "Quiet kicker above the title. Sentence case by default." },
        { name: "CardTitle", type: "Component", description: "Card title. Renders h3 by default; override the level with asChild." },
        { name: "CardDescription", type: "Component", description: "Helper text under the title. Renders a paragraph." },
        { name: "CardAction", type: "Component", description: "Top-right header slot, e.g. a button or badge." },
        { name: "CardMedia", type: "Component", description: "CLS-safe cover media with hover zoom. ratio: video | wide | square." },
        { name: "CardMetric", type: "Component", description: "KPI figure with tabular numerals that won't jitter on update." },
        { name: "CardContent", type: "Component", description: "Main card body." },
        { name: "CardFooter", type: "Component", description: "Actions and secondary content at the bottom." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
