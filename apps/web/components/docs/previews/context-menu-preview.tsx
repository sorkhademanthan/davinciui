"use client";

import * as React from "react";
import {
  ClipboardPaste,
  Copy,
  Download,
  Link2,
  Mail,
  Scissors,
  Share2,
  Trash2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
} from "@workspace/ui/components/context-menu";

function TriggerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-44 w-72 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground select-none">
      {children}
    </div>
  );
}

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      {children}
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

export function BasicContextMenuDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setLast("cut")}>Cut</ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast("copy")}>Copy</ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast("paste")}>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function SubmenuDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setLast("open")}>Open</ContextMenuItem>
          <ContextMenuSub label="Share" icon={<Share2 className="size-4" aria-hidden />}>
            <ContextMenuItem icon={<Mail className="size-4" aria-hidden />} onSelect={() => setLast("share → email")}>
              Email
            </ContextMenuItem>
            <ContextMenuItem icon={<Link2 className="size-4" aria-hidden />} onSelect={() => setLast("share → link")}>
              Copy link
            </ContextMenuItem>
          </ContextMenuSub>
          <ContextMenuItem onSelect={() => setLast("rename")}>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function ShortcutsDemo() {
  return (
    <DemoShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem shortcut="⌘X">Cut</ContextMenuItem>
          <ContextMenuItem shortcut="⌘C">Copy</ContextMenuItem>
          <ContextMenuItem shortcut="⌘V">Paste</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem shortcut="⌘A">Select all</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function GroupsDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Edit</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLast("undo")}>Undo</ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast("redo")}>Redo</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLast("zoom-in")}>Zoom in</ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast("zoom-out")}>Zoom out</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function IconsDemo() {
  return (
    <DemoShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon={<Scissors className="size-4" aria-hidden />}>Cut</ContextMenuItem>
          <ContextMenuItem icon={<Copy className="size-4" aria-hidden />}>Copy</ContextMenuItem>
          <ContextMenuItem icon={<ClipboardPaste className="size-4" aria-hidden />}>Paste</ContextMenuItem>
          <ContextMenuItem icon={<Download className="size-4" aria-hidden />}>Download</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function CheckboxesDemo() {
  const [bookmarks, setBookmarks] = React.useState(true);
  const [numbers, setNumbers] = React.useState(false);
  return (
    <DemoShell readout={`bookmarks=${bookmarks ? "on" : "off"} · numbers=${numbers ? "on" : "off"}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
            Show bookmarks bar
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={numbers} onCheckedChange={setNumbers}>
            Show line numbers
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function RadioDemo() {
  const [sort, setSort] = React.useState("name");
  return (
    <DemoShell readout={`sort=${sort}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Sort by</ContextMenuLabel>
          <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
            <ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
            <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
            <ContextMenuRadioItem value="size">Size</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function DestructiveDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setLast("archived")}>Archive</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive icon={<Trash2 className="size-4" aria-hidden />} onSelect={() => setLast("deleted")}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

export function SidesDemo() {
  return (
    <DemoShell readout="Trigger at the corner — the menu flips to stay on screen">
      <div className="flex h-56 w-full max-w-sm items-end justify-end rounded-xl border border-border/60 p-3">
        <ContextMenu>
          <ContextMenuTrigger className="rounded-lg border border-dashed border-border px-4 py-6 text-xs text-muted-foreground select-none">
            Right-click at the edge
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuItem>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </DemoShell>
  );
}

export function RtlContextMenuDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu dir="rtl">
        <ContextMenuTrigger>
          <TriggerBox>انقر بزر الماوس الأيمن هنا</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setLast("قص")}>قص</ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast("نسخ")}>نسخ</ContextMenuItem>
          <ContextMenuSub label="مشاركة">
            <ContextMenuItem onSelect={() => setLast("بريد")}>بريد</ContextMenuItem>
            <ContextMenuItem onSelect={() => setLast("رابط")}>رابط</ContextMenuItem>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}
