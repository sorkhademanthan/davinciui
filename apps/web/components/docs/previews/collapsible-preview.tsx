"use client"

import * as React from "react"
import { ChevronsUpDown, ChevronRight, File, Folder } from "lucide-react"
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
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-3 font-mono text-sm">@radix-ui/colors</div>
            <div className="rounded-md border px-4 py-3 font-mono text-sm">@stitches/react</div>
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
              <CollapsibleContent className="col-span-2 grid grid-cols-2 gap-2">
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
        <CollapsibleContent className="ml-4 border-l pl-2">
          <div className="flex flex-col gap-0.5 py-1">
            {item.items.map((child) => (
              <FileTreeNode key={child.name} item={child} depth={depth + 1} />
            ))}
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
