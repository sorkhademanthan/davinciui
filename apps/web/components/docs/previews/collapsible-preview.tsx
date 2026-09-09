"use client"

import * as React from "react"
import { BookOpen, ChevronDown, ChevronsUpDown, ChevronRight, Compass, File, Folder, LayoutGrid, Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

// ---------------------------------------------------------------------------
// Default — simple toggle
// ---------------------------------------------------------------------------

export function CollapsiblePreview() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-2">
            <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <ChevronsUpDown className="size-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/primitives</div>
          <CollapsibleContent>
            <div className="space-y-2">
              <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/colors</div>
              <div className="rounded-md border px-4 py-3 font-mono text-sm">@stitches/react</div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

export function CollapsibleBasicPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Collapsible className="w-full max-w-sm space-y-2 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Can I use this in my project?</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown className="size-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="text-sm text-muted-foreground">
          Yes. Free to use for personal and commercial projects. No attribution required.
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Controlled
// ---------------------------------------------------------------------------

export function CollapsibleControlledPreview() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm space-y-2 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Controlled state</h4>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              {open ? "Hide" : "Show"}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="text-sm text-muted-foreground">
          This content is controlled via <code className="font-mono text-xs">open</code> and{" "}
          <code className="font-mono text-xs">onOpenChange</code>.
        </CollapsibleContent>
      </Collapsible>
      <p className="text-xs text-muted-foreground">State: {open ? "open" : "closed"}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Settings Panel — trigger button reveals additional settings
// ---------------------------------------------------------------------------

export function CollapsibleSettingsPreview() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Card className="w-full max-w-xs">
        <CardContent className="p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Radius</h4>
            <p className="text-xs text-muted-foreground">Set the corner radius of the element.</p>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 flex items-start gap-2">
            <div className="grid w-full grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="radius-x" className="sr-only">
                  Radius X
                </Label>
                <Input id="radius-x" placeholder="0" defaultValue="8" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="radius-y" className="sr-only">
                  Radius Y
                </Label>
                <Input id="radius-y" placeholder="0" defaultValue="8" />
              </div>
              <CollapsibleContent className="col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="radius-tl" className="sr-only">
                      Radius TL
                    </Label>
                    <Input id="radius-tl" placeholder="0" defaultValue="8" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="radius-br" className="sr-only">
                      Radius BR
                    </Label>
                    <Input id="radius-br" placeholder="0" defaultValue="8" />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <ChevronsUpDown className="size-4" />
                <span className="sr-only">Toggle advanced</span>
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// File Tree — nested collapsibles
// ---------------------------------------------------------------------------

type FileTreeItem = { name: string; items?: FileTreeItem[] }

const fileTree: FileTreeItem[] = [
  {
    name: "components",
    items: [
      {
        name: "ui",
        items: [
          { name: "button.tsx" },
          { name: "card.tsx" },
          { name: "collapsible.tsx" },
          { name: "dialog.tsx" },
        ],
      },
      { name: "login-form.tsx" },
    ],
  },
  { name: "lib", items: [{ name: "utils.ts" }] },
  { name: "hooks", items: [{ name: "use-mobile.ts" }] },
  { name: "app.tsx" },
  { name: "globals.css" },
  { name: "package.json" },
]

function FileTreeNode({ item, depth = 0 }: { item: FileTreeItem; depth?: number }) {
  if (item.items) {
    return (
      <Collapsible defaultOpen={depth === 0}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="group flex w-full justify-start gap-1.5 px-2 font-normal [&[data-panel-open]>svg:first-child]:rotate-90"
          >
            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform" />
            <Folder className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{item.name}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ms-4 border-s ps-2">
            <div className="flex flex-col gap-0.5 py-1">
              {item.items.map((child) => (
                <FileTreeNode key={child.name} item={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      <File className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm">{item.name}</span>
    </div>
  )
}

export function CollapsibleFileTreePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Card className="w-full max-w-[16rem]">
        <CardContent className="p-2">
          <div className="flex flex-col gap-0.5">
            {fileTree.map((item) => (
              <FileTreeNode key={item.name} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RTL
// ---------------------------------------------------------------------------

export function CollapsibleRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Collapsible className="w-full max-w-sm space-y-2 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">هل يمكنني استخدام هذا في مشروعي؟</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown className="size-4" />
              <span className="sr-only">تبديل</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="text-sm text-muted-foreground">
          نعم. مجاني للاستخدام في المشاريع الشخصية والتجارية. لا يلزم نسب المصدر.
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FAQ — help-center pattern: question headers, rich answers, multiple open
// ---------------------------------------------------------------------------

const faqItems = [
  {
    q: "Can I use this in my project?",
    a: "Yes. Free for personal and commercial projects, no attribution required. All components are MIT licensed and yours to keep.",
  },
  {
    q: "How does billing work?",
    a: "Plans are per workspace, billed monthly or annually. You can upgrade, downgrade, or cancel at any time — changes are prorated automatically.",
  },
  {
    q: "Is my data secure?",
    a: "Data is encrypted in transit and at rest (AES-256). We are SOC 2 Type II certified and never sell your data. Read our security whitepaper for details.",
  },
  {
    q: "Do you offer support?",
    a: "Every plan includes email support with a 24-hour median response time. Team plans add priority chat and a dedicated success manager.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel in two clicks from settings. Your workspace stays active until the end of the billing period and you can export everything.",
  },
]

export function CollapsibleFaqPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md">
        <p className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Help center
        </p>
        <h3 className="mb-4 text-xl font-semibold tracking-tight">
          Frequently asked questions
        </h3>
        <div className="flex flex-col gap-2">
          {faqItems.map((item, i) => (
            <Collapsible
              key={item.q}
              defaultOpen={i === 0}
              className="rounded-xl border bg-card shadow-xs transition-[box-shadow,border-color] duration-300 data-[open]:border-primary/25 data-[open]:shadow-md"
            >
              <CollapsibleTrigger className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-[15px] font-medium outline-none transition-colors hover:text-foreground focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring/40 [&[data-panel-open]>span:last-child]:rotate-45 [&[data-panel-open]>span:last-child]:border-primary/30 [&[data-panel-open]>span:last-child]:bg-primary/10 [&[data-panel-open]>span:last-child]:text-primary">
                <span className="flex-1">
                  {item.q}
                  <span className="sr-only"> (question {i + 1} of {faqItems.length})</span>
                </span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
                  <Plus className="size-3.5" />
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{item.a}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Navigation Sidebar — collapsible sections, active link, single-open
// ---------------------------------------------------------------------------

const sidebarSections = [
  {
    id: "start",
    title: "Getting started",
    icon: BookOpen,
    links: ["Introduction", "Installation", "Quickstart"],
  },
  {
    id: "components",
    title: "Components",
    icon: LayoutGrid,
    links: ["Button", "Collapsible", "Dialog", "Table"],
  },
  {
    id: "guides",
    title: "Guides",
    icon: Compass,
    links: ["Theming", "Accessibility", "Migration"],
  },
]

export function CollapsibleSidebarPreview() {
  const [openSection, setOpenSection] = React.useState<string | null>("components")
  const [activeLink, setActiveLink] = React.useState("Collapsible")

  return (
    <div className="flex h-full w-full items-center justify-center p-6 sm:p-8">
      <nav aria-label="Docs" className="w-full max-w-64 rounded-xl border bg-card p-2 shadow-xs">
        <div className="flex flex-col gap-0.5">
          {sidebarSections.map((section) => {
            const isOpen = openSection === section.id
            const Icon = section.icon
            return (
              <Collapsible
                key={section.id}
                open={isOpen}
                onOpenChange={(open) => setOpenSection(open ? section.id : null)}
              >
                <CollapsibleTrigger className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/40 [&[data-panel-open]>svg:last-child]:rotate-180">
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1 truncate">{section.title}</span>
                  <ChevronDown
                    className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="flex flex-col gap-0.5 py-1 ps-9">
                    {section.links.map((link) => {
                      const isActive = activeLink === link
                      return (
                        <li key={link}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveLink(link)
                            }}
                            aria-current={isActive ? "page" : undefined}
                            className={
                              isActive
                                ? "block truncate rounded-md bg-primary/10 px-2.5 py-1.5 text-[13px] font-medium text-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
                                : "block truncate rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                            }
                          >
                            {link}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
