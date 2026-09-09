import { DocsPageLayout } from "@/components/docs-page-layout"
import {
  CollapsiblePreview,
  CollapsibleBasicPreview,
  CollapsibleControlledPreview,
  CollapsibleSettingsPreview,
  CollapsibleFileTreePreview,
  CollapsibleFaqPreview,
  CollapsibleSidebarPreview,
  CollapsibleRtlPreview,
} from "@/components/docs/previews/collapsible-preview"
import { readComponentSource } from "@/lib/source-code"

const importCode = `import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"`

const defaultCode = `import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"

export function CollapsibleDemo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
      <div className="flex items-center justify-between rounded-md border px-4 py-2">
        <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <ChevronsUpDown className="size-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/primitives</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/colors</div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">@stitches/react</div>
      </CollapsibleContent>
    </Collapsible>
  )
}`

export async function CollapsibleDocs() {
  const sourceCode = (await readComponentSource("collapsible")) || "// Unable to load source code"

  return (
    <DocsPageLayout
      title="Collapsible"
      description="An interactive component which expands/collapses a panel."
      preview={<CollapsiblePreview />}
      previewCode={defaultCode}
      installPackageName="collapsible"
      installDependencies="@base-ui/react"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/collapsible.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Composition:</strong>{" "}
            <code className="font-mono text-xs">Collapsible</code> wraps{" "}
            <code className="font-mono text-xs">CollapsibleTrigger</code> +{" "}
            <code className="font-mono text-xs">CollapsibleContent</code>.
          </p>
          <p>
            <strong className="text-foreground">Controlled:</strong> Use{" "}
            <code className="font-mono text-xs">open</code> and{" "}
            <code className="font-mono text-xs">onOpenChange</code> to control state. Use{" "}
            <code className="font-mono text-xs">defaultOpen</code> for uncontrolled.
          </p>
        </div>
      }
      examples={[
        {
          title: "Basic",
          preview: <CollapsibleBasicPreview />,
          code: `<Collapsible>
  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects. No attribution required.
  </CollapsibleContent>
</Collapsible>`,
        },
        {
          title: "Controlled",
          preview: <CollapsibleControlledPreview />,
          code: `const [open, setOpen] = React.useState(false)

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>`,
        },
        {
          title: "Settings Panel",
          preview: <CollapsibleSettingsPreview />,
          code: `<Card>
  <CardContent>
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex items-start gap-2">
      <div className="grid w-full grid-cols-2 gap-2">
        <Input placeholder="0" defaultValue="8" />
        <Input placeholder="0" defaultValue="8" />
        <CollapsibleContent className="col-span-2 grid grid-cols-2 gap-2">
          <Input placeholder="0" />
          <Input placeholder="0" />
        </CollapsibleContent>
      </div>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="icon"><ChevronsUpDown /></Button>
      </CollapsibleTrigger>
    </Collapsible>
  </CardContent>
</Card>`,
        },
        {
          title: "File Tree",
          preview: <CollapsibleFileTreePreview />,
          code: `<Collapsible>
  <CollapsibleTrigger>
    <ChevronRight /> <Folder /> components
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="ms-4 border-s ps-2">
      <Collapsible>
        <CollapsibleTrigger><Folder /> ui</CollapsibleTrigger>
        <CollapsibleContent>
          <File /> button.tsx
          <File /> collapsible.tsx
        </CollapsibleContent>
      </Collapsible>
    </div>
  </CollapsibleContent>
</Collapsible>`,
        },
        {
          title: "FAQ",
          preview: <CollapsibleFaqPreview />,
          code: `{faqItems.map((item, i) => (
  <Collapsible key={item.q} defaultOpen={i === 0}>
    <CollapsibleTrigger>
      {item.q}
      <Plus />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <p>{item.a}</p>
    </CollapsibleContent>
  </Collapsible>
))}`,
        },
        {
          title: "Navigation Sidebar",
          preview: <CollapsibleSidebarPreview />,
          code: `const [openSection, setOpenSection] = React.useState("components")
const [activeLink, setActiveLink] = React.useState("Collapsible")

<nav aria-label="Docs">
  {sections.map((section) => (
    <Collapsible
      key={section.id}
      open={openSection === section.id}
      onOpenChange={(open) => setOpenSection(open ? section.id : null)}
    >
      <CollapsibleTrigger>
        <Icon /> {section.title} <ChevronDown />
      </CollapsibleTrigger>
      <CollapsibleContent>
        {section.links.map((link) => (
          <a
            key={link}
            href={link.href}
            aria-current={activeLink === link ? "page" : undefined}
          >
            {link}
          </a>
        ))}
      </CollapsibleContent>
    </Collapsible>
  ))}
</nav>`,
        },
        {
          title: "RTL",
          preview: <CollapsibleRtlPreview />,
          code: `<div dir="rtl">
  <Collapsible>
    <CollapsibleTrigger>هل يمكنني استخدام هذا؟</CollapsibleTrigger>
    <CollapsibleContent>نعم. مجاني للاستخدام.</CollapsibleContent>
  </Collapsible>
</div>`,
        },
      ]}
      props={[
        {
          name: "Collapsible",
          type: "Component",
          description: "Root container. Wraps Trigger and Content. Accepts open, defaultOpen, onOpenChange, disabled.",
        },
        {
          name: "CollapsibleTrigger",
          type: "Component",
          description: "Button that toggles the panel. Supports asChild to render custom button.",
        },
        {
          name: "CollapsibleContent",
          type: "Component",
          description: "Panel with grid-rows open/close animation (300ms out, 200ms in). Put borders, padding and spacing on content inside — the panel collapses to 0fr. Supports keepMounted, hiddenUntilFound.",
        },
        {
          name: "open",
          type: "boolean",
          description: "Controlled open state (Collapsible).",
        },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "false",
          description: "Initial open state for uncontrolled usage.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean, details: ChangeEventDetails) => void",
          description: "Called when open state changes.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Disables trigger interaction.",
        },
        {
          name: "keepMounted",
          type: "boolean",
          default: "false",
          description: "Keep the panel in the DOM when closed (find-in-page support).",
        },
        {
          name: "className",
          type: "string",
          description: "Additional CSS classes.",
        },
      ]}
    />
  )
}
