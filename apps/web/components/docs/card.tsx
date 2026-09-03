import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  CardEdgeToEdgePreview,
  CardImagePreview,
  CardPreview,
  CardRtlPreview,
  CardSmallPreview,
  CardSpacingPreview,
} from "@/components/docs/previews/card-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
      description="Displays a card with header, content, and footer."
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
            <strong className="text-foreground">Edge to edge:</strong> Bleed content with{" "}
            <code className="font-mono text-xs">-mx-(--card-spacing)</code> and drop the section gap above a footer
            with <code className="font-mono text-xs">-mb-(--card-spacing)</code> on{" "}
            <code className="font-mono text-xs">CardContent</code>.
          </p>
        </div>
      }
      examples={[
        { title: "Size", preview: <CardSmallPreview />, code: `<Card size="sm">\n  <CardHeader>\n    <CardTitle>Compact card</CardTitle>\n    <CardDescription>Small size variant.</CardDescription>\n  </CardHeader>\n  <CardContent>...</CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Spacing", preview: <CardSpacingPreview />, code: `<Card className="[--card-spacing:--spacing(6)]">\n  <CardHeader>...</CardHeader>\n  <CardContent>...</CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Edge to Edge", preview: <CardEdgeToEdgePreview />, code: `<Card>\n  <CardHeader>...</CardHeader>\n  <CardContent className="-mb-(--card-spacing)">\n    <img className="-mx-(--card-spacing) w-[calc(100%+var(--card-spacing)*2)]" />\n  </CardContent>\n  <CardFooter>...</CardFooter>\n</Card>` },
        { title: "Image", preview: <CardImagePreview />, code: `<Card>\n  <img src="..." alt="Cover" className="h-40 w-full object-cover" />\n  <CardHeader>\n    <CardTitle>Card with image</CardTitle>\n  </CardHeader>\n  <CardContent>...</CardContent>\n</Card>` },
        { title: "RTL", preview: <CardRtlPreview />, code: `<div dir="rtl">\n  <Card>\n    <CardHeader>\n      <CardTitle>عنوان البطاقة</CardTitle>\n    </CardHeader>\n  </Card>\n</div>` },
      ]}
      props={[
        { name: "Card", type: "Component", description: "Root container for card content." },
        { name: "size", type: '"default" | "sm"', default: '"default"', description: "Card density. sm uses smaller spacing (Card)." },
        { name: "CardHeader", type: "Component", description: "Title, description, and optional action row." },
        { name: "CardTitle", type: "Component", description: "Card title." },
        { name: "CardDescription", type: "Component", description: "Helper text under the title." },
        { name: "CardAction", type: "Component", description: "Top-right header slot, e.g. a button or badge." },
        { name: "CardContent", type: "Component", description: "Main card body." },
        { name: "CardFooter", type: "Component", description: "Actions and secondary content at the bottom." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
