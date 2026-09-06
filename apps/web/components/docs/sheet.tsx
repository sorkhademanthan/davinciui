import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  NoCloseButtonDemo,
  RtlSheetDemo,
  SideSheetDemo,
} from "@/components/docs/previews/sheet-preview";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

export function Example() {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>You have 3 unread messages.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}`;

const compositionNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        A trigger opens a modal panel docked to any edge. Header, title, description, footer, and
        close primitives compose inside — unlike the draggable Drawer, Sheet is a true modal with
        directional enter and exit motion.
      </p>
    </div>
  </div>
);

export async function SheetDocs() {
  const sourceCode =
    (await readComponentSource("sheet")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Sheet"
      description="A modal side panel docked to any edge with directional motion, header/footer primitives, and RTL."
      preview={
        <div className="flex flex-col items-center justify-center">
          <Sheet>
            <SheetTrigger className="h-9 rounded-lg bg-foreground px-4 text-sm font-medium text-background">
              Open sheet
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>You have 3 unread messages.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="sheet"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/sheet.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Side",
          preview: <SideSheetDemo />,
          code: `import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"

<Sheet><SheetTrigger>Top</SheetTrigger><SheetContent side="top">…</SheetContent></Sheet>
<Sheet><SheetTrigger>Right</SheetTrigger><SheetContent side="right">…</SheetContent></Sheet>
<Sheet><SheetTrigger>Bottom</SheetTrigger><SheetContent side="bottom">…</SheetContent></Sheet>
<Sheet><SheetTrigger>Left</SheetTrigger><SheetContent side="left">…</SheetContent></Sheet>`,
        },
        {
          title: "No Close Button",
          preview: <NoCloseButtonDemo />,
          code: `import { Sheet, SheetContent } from "@/components/ui/sheet"

<SheetContent side="right" showCloseButton={false}>
  {/* close from the footer or overlay instead */}
</SheetContent>`,
        },
        {
          title: "RTL",
          preview: <RtlSheetDemo />,
          code: `import { Sheet } from "@/components/ui/sheet"

<div dir="rtl">
  <Sheet>
    <SheetTrigger>فتح اللوحة</SheetTrigger>
    <SheetContent side="right" dir="rtl">…</SheetContent>
  </Sheet>
</div>`,
        },
      ]}
      props={[
        { name: "SheetContent · side", type: '"top" | "right" | "bottom" | "left"', default: '"right"', description: "Panel edge with directional enter/exit motion." },
        { name: "SheetContent · showCloseButton", type: "boolean", default: "true", description: "Corner X button." },
        { name: "SheetTrigger", type: "button", description: "Opens the panel. Accepts asChild." },
        { name: "SheetClose", type: "button", description: "Closes the panel. Accepts asChild." },
        { name: "SheetHeader", type: "div", description: "Title + description stack." },
        { name: "SheetFooter", type: "div", description: "Action row pinned to the panel end." },
        { name: "SheetTitle", type: "h2 element", description: "Accessible panel title." },
        { name: "SheetDescription", type: "p element", description: "Accessible panel description." },
        { name: "className", type: "string", description: "Extra classes per part." },
      ]}
    />
  );
}
