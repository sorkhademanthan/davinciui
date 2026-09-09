"use client";

import * as React from "react";
import {
  Archive,
  ArrowUpDown,
  ClipboardPaste,
  Copy,
  Download,
  Eye,
  FilePenLine,
  FolderInput,
  Link2,
  Mail,
  Pencil,
  Scissors,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSubRoot,
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
      <ContextMenu onOpenChange={(open) => open && setLast("opened")}>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon={<Scissors aria-hidden />} kbd={["⌘", "X"]} onClick={() => setLast("cut")}>
            Cut
          </ContextMenuItem>
          <ContextMenuItem icon={<Copy aria-hidden />} kbd={["⌘", "C"]} onClick={() => setLast("copy")}>
            Copy
          </ContextMenuItem>
          <ContextMenuItem icon={<ClipboardPaste aria-hidden />} kbd={["⌘", "V"]} onClick={() => setLast("paste")}>
            Paste
          </ContextMenuItem>
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
          <ContextMenuItem onClick={() => setLast("open")}>Open</ContextMenuItem>
          <ContextMenuSub label="Share" icon={<Share2 aria-hidden />}>
            <ContextMenuItem icon={<Mail aria-hidden />} onClick={() => setLast("share → email")}>
              Email
            </ContextMenuItem>
            <ContextMenuItem icon={<Link2 aria-hidden />} kbd={["⌘", "L"]} onClick={() => setLast("share → link")}>
              Copy link
            </ContextMenuItem>
          </ContextMenuSub>
          <ContextMenuItem onClick={() => setLast("rename")}>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

/** Headless submenu composition — full control over trigger + content. */
export function ComposedSubmenuDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem icon={<Eye aria-hidden />} onClick={() => setLast("preview")}>
            Preview
          </ContextMenuItem>
          <ContextMenuSubRoot>
            <ContextMenuSubTrigger>
              <span className="flex size-4 items-center justify-center text-muted-foreground">
                <Share2 aria-hidden />
              </span>
              <span className="flex-1 text-start">Share</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuLabel>Collaborate</ContextMenuLabel>
              <ContextMenuItem icon={<Mail aria-hidden />} description="Send as attachment" onClick={() => setLast("share → email")}>
                Email
              </ContextMenuItem>
              <ContextMenuItem icon={<Link2 aria-hidden />} kbd={["⌘", "L"]} onClick={() => setLast("share → link")}>
                Copy link
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSubRoot>
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
          <ContextMenuItem kbd={["⌘", "X"]}>Cut</ContextMenuItem>
          <ContextMenuItem kbd={["⌘", "C"]}>Copy</ContextMenuItem>
          <ContextMenuItem kbd={["⌘", "V"]}>Paste</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem kbd={["⌘", "A"]}>Select all</ContextMenuItem>
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
          <ContextMenuGroup>
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuItem kbd={["⌘", "Z"]} onClick={() => setLast("undo")}>
              Undo
            </ContextMenuItem>
            <ContextMenuItem kbd={["⇧", "⌘", "Z"]} onClick={() => setLast("redo")}>
              Redo
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuItem kbd={["⌘", "+"]} onClick={() => setLast("zoom-in")}>
              Zoom in
            </ContextMenuItem>
            <ContextMenuItem kbd={["⌘", "−"]} onClick={() => setLast("zoom-out")}>
              Zoom out
            </ContextMenuItem>
          </ContextMenuGroup>
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
          <ContextMenuItem icon={<Scissors aria-hidden />}>Cut</ContextMenuItem>
          <ContextMenuItem icon={<Copy aria-hidden />}>Copy</ContextMenuItem>
          <ContextMenuItem icon={<ClipboardPaste aria-hidden />}>Paste</ContextMenuItem>
          <ContextMenuItem icon={<Download aria-hidden />}>Download</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

/** Rich items — descriptions, badges, and mixed states. */
export function RichItemsDemo() {
  const [last, setLast] = React.useState("—");
  return (
    <DemoShell readout={last}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-64">
          <ContextMenuLabel>File</ContextMenuLabel>
          <ContextMenuItem
            icon={<FilePenLine aria-hidden />}
            description="Open in the editor"
            kbd={["↵"]}
            onClick={() => setLast("open")}
          >
            Open
          </ContextMenuItem>
          <ContextMenuItem
            icon={<Star aria-hidden />}
            description="Pin to quick access"
            badge="Pro"
            onClick={() => setLast("star")}
          >
            Add to favorites
          </ContextMenuItem>
          <ContextMenuItem icon={<FolderInput aria-hidden />} badge={12} onClick={() => setLast("move")}>
            Move to…
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem icon={<Download aria-hidden />} shortcut="12 MB" onClick={() => setLast("download")}>
            Download
          </ContextMenuItem>
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
          <ContextMenuLabel>Appearance</ContextMenuLabel>
          <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={(v) => setBookmarks(v)}>
            Show bookmarks bar
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={numbers}
            onCheckedChange={(v) => setNumbers(v)}
            description="Gutter line numbers"
          >
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
            <ContextMenuRadioItem value="name" description="A → Z">
              Name
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="date" description="Newest first">
              Date
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="size" description="Largest first">
              Size
            </ContextMenuRadioItem>
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
          <ContextMenuItem icon={<Archive aria-hidden />} onClick={() => setLast("archived")}>
            Archive
          </ContextMenuItem>
          <ContextMenuItem icon={<Pencil aria-hidden />} kbd={["⌘", "R"]} onClick={() => setLast("renamed")}>
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive icon={<Trash2 aria-hidden />} kbd={["⌫"]} onClick={() => setLast("deleted")}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

/** Long menu — scrolls past 28rem and supports type-ahead (press a letter). */
const TEAMMATES = [
  "Ada Lovelace",
  "Alan Turing",
  "Grace Hopper",
  "Margaret Hamilton",
  "Katherine Johnson",
  "Linus Torvalds",
  "Barbara Liskov",
  "Donald Knuth",
  "Edsger Dijkstra",
  "Frances Allen",
  "John Carmack",
  "Radia Perlman",
  "Tim Berners-Lee",
  "Vint Cerf",
  "Shafi Goldwasser",
  "Leslie Lamport",
];

export function LongListDemo() {
  const [assignee, setAssignee] = React.useState("—");
  return (
    <DemoShell readout={`assignee=${assignee} · tip: press “g” to jump`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click, then type to search</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Assign to</ContextMenuLabel>
          {TEAMMATES.map((name) => (
            <ContextMenuItem key={name} onClick={() => setAssignee(name)}>
              {name}
            </ContextMenuItem>
          ))}
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

export function DisabledDemo() {
  return (
    <DemoShell>
      <ContextMenu>
        <ContextMenuTrigger>
          <TriggerBox>Right-click here</TriggerBox>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem kbd={["⌘", "C"]}>Copy</ContextMenuItem>
          <ContextMenuItem disabled shortcut="Empty">
            Paste
          </ContextMenuItem>
          <ContextMenuSub label="More actions" disabled>
            <ContextMenuItem>Never reachable</ContextMenuItem>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
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
          <ContextMenuItem onClick={() => setLast("قص")}>قص</ContextMenuItem>
          <ContextMenuItem onClick={() => setLast("نسخ")}>نسخ</ContextMenuItem>
          <ContextMenuSub label="مشاركة">
            <ContextMenuItem onClick={() => setLast("بريد")}>بريد</ContextMenuItem>
            <ContextMenuItem onClick={() => setLast("رابط")}>رابط</ContextMenuItem>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Multi-context showcase — table row · canvas object · editor.
// One component, three menus, each tuned to its surface.
// ─────────────────────────────────────────────────────────────

const ROWS = [
  { name: "launch-plan.md", meta: "Markdown · 24 KB", starred: true },
  { name: "hero-render.png", meta: "Image · 2.1 MB", starred: false },
  { name: "pricing-model.csv", meta: "CSV · 88 KB", starred: false },
];

export function MultiContextDemo() {
  const [last, setLast] = React.useState("right-click a surface");
  return (
    <div className="flex w-full flex-col gap-4 bg-background p-6">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Table rows */}
        <div className="overflow-hidden rounded-xl border border-border/60">
          <p className="border-b border-border/60 bg-muted/30 px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Files
          </p>
          {ROWS.map((row) => (
            <ContextMenu key={row.name}>
              <ContextMenuTrigger className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] hover:bg-muted/50">
                <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
                {row.starred && <Star aria-label="starred" className="size-3.5 fill-amber-400 text-amber-400" />}
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem icon={<Eye aria-hidden />} kbd={["↵"]} onClick={() => setLast(`open ${row.name}`)}>
                  Open
                </ContextMenuItem>
                <ContextMenuItem icon={<ArrowUpDown aria-hidden />} onClick={() => setLast(`rename ${row.name}`)}>
                  Rename
                </ContextMenuItem>
                <ContextMenuSub label="Share" icon={<Share2 aria-hidden />}>
                  <ContextMenuItem icon={<Mail aria-hidden />} onClick={() => setLast(`emailed ${row.name}`)}>
                    Email
                  </ContextMenuItem>
                  <ContextMenuItem icon={<Link2 aria-hidden />} kbd={["⌘", "L"]} onClick={() => setLast("link copied")}>
                    Copy link
                  </ContextMenuItem>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem destructive icon={<Trash2 aria-hidden />} onClick={() => setLast(`deleted ${row.name}`)}>
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>

        {/* Canvas object */}
        <div className="flex min-h-44 items-center justify-center rounded-xl border border-border/60 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-[size:16px_16px] p-4">
          <ContextMenu>
            <ContextMenuTrigger className="flex h-24 w-32 cursor-default items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white shadow-lg select-none">
              hero-card
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Object</ContextMenuLabel>
              <ContextMenuItem kbd={["⌘", "D"]} onClick={() => setLast("duplicated hero-card")}>
                Duplicate
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setLast("brought to front")}>Bring to front</ContextMenuItem>
              <ContextMenuItem onClick={() => setLast("grouped")}>Group selection</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>

        {/* Editor selection */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <ContextMenu>
            <ContextMenuTrigger>
              <p className="font-mono text-xs leading-6 select-none">
                <span className="text-muted-foreground">{"const theme = "}</span>
                <span className="rounded bg-amber-400/20 px-1">await davinci.load("midnight")</span>
                <span className="text-muted-foreground">;</span>
              </p>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem icon={<Scissors aria-hidden />} kbd={["⌘", "X"]} onClick={() => setLast("cut code")}>
                Cut
              </ContextMenuItem>
              <ContextMenuItem icon={<Copy aria-hidden />} kbd={["⌘", "C"]} onClick={() => setLast("copied code")}>
                Copy
              </ContextMenuItem>
              <ContextMenuItem
                icon={<ClipboardPaste aria-hidden />}
                description="Paste and format"
                kbd={["⇧", "⌘", "V"]}
                onClick={() => setLast("pasted code")}
              >
                Paste
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
      <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
        {last}
      </p>
      {/* Keeps the shortcut export referenced for tree-shaking audits */}
      <span className="hidden">
        <ContextMenuShortcut>⌘K</ContextMenuShortcut>
      </span>
    </div>
  );
}
