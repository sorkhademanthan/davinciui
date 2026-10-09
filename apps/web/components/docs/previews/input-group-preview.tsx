"use client";

import * as React from "react";
import { Check, ChevronDown, Command, Copy, Eye, EyeOff, Loader2, Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@workspace/ui/components/input-group";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-sm">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Align overview + positions
// ─────────────────────────────────────────────────────────────

export function AlignDemo() {
  return (
    <DemoShell readout="inline-start · inline-end · block-start · block-end">
      <div className="flex flex-col gap-3">
        <InputGroup>
          <InputGroupAddon align="inline-start">@</InputGroupAddon>
          <InputGroupInput placeholder="Username" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Amount" inputMode="decimal" />
          <InputGroupAddon align="inline-end">USD</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon align="block-start">Shipping address</InputGroupAddon>
          <InputGroupInput placeholder="Street and number" />
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Bio" />
          <InputGroupAddon align="block-end">0 / 180</InputGroupAddon>
        </InputGroup>
      </div>
    </DemoShell>
  );
}

export function InlineStartDemo() {
  return (
    <DemoShell>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search components…" />
      </InputGroup>
    </DemoShell>
  );
}

export function InlineEndDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={value || "—"}>
      <InputGroup>
        <InputGroupInput placeholder="Repository name" value={value} onChange={(e) => setValue(e.target.value)} />
        <InputGroupAddon align="inline-end">
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↵</kbd>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function BlockStartDemo() {
  return (
    <DemoShell>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <span className="text-xs font-semibold text-foreground">API token</span>
          <span className="text-xs">Regenerate it anytime.</span>
        </InputGroupAddon>
        <InputGroupInput placeholder="sk-live-…" />
      </InputGroup>
    </DemoShell>
  );
}

export function BlockEndDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={`${value.length} / 60`}>
      <InputGroup>
        <InputGroupInput placeholder="Display name" maxLength={60} value={value} onChange={(e) => setValue(e.target.value)} />
        <InputGroupAddon align="block-end">
          <span>Visible across workspaces.</span>
          <span className="ms-auto font-mono">{value.length}/60</span>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Addon kinds
// ─────────────────────────────────────────────────────────────

export function IconDemo() {
  return (
    <DemoShell>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" />
        <InputGroupAddon align="inline-end">
          <Command className="size-4" aria-hidden />
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function TextDemo() {
  return (
    <DemoShell>
      <InputGroup>
        <InputGroupAddon align="inline-start">$</InputGroupAddon>
        <InputGroupInput placeholder="0.00" inputMode="decimal" />
        <InputGroupAddon align="inline-end">.00</InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function ButtonDemo() {
  const [value, setValue] = React.useState("");
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <DemoShell readout={sent ? `Invited ${sent}` : undefined}>
      <InputGroup>
        <InputGroupInput placeholder="teammate@studio.co" value={value} onChange={(e) => setValue(e.target.value)} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => value.trim() && setSent(value.trim())}>Invite</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function KbdDemo() {
  return (
    <DemoShell>
      <InputGroup>
        <InputGroupInput placeholder="Jump to…" />
        <InputGroupAddon align="inline-end">
          <kbd className="flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            <Command className="size-3" />K
          </kbd>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function DropdownDemo() {
  const [currency, setCurrency] = React.useState("USD");
  return (
    <DemoShell readout={currency}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-7 cursor-pointer appearance-none bg-transparent pe-4 text-xs font-medium text-foreground outline-none"
          >
            {["USD", "EUR", "INR", "JPY"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none -ms-4 size-3.5 opacity-60" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" inputMode="decimal" />
      </InputGroup>
    </DemoShell>
  );
}

export function SpinnerDemo() {
  return (
    <DemoShell readout="Loading state">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Loader2 className="size-4 animate-spin" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput placeholder="Syncing…" disabled />
      </InputGroup>
    </DemoShell>
  );
}

export function TextareaDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={`${value.length} chars`}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <span className="text-xs font-semibold text-foreground">Feedback</span>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Tell us what happened…" rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
        <InputGroupAddon align="block-end">
          <span>Markdown supported.</span>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function CustomInputDemo() {
  const [show, setShow] = React.useState(false);
  return (
    <DemoShell>
      <InputGroup>
        <InputGroupInput type={show ? "text" : "password"} placeholder="Password" defaultValue="hunter2-hunter2" />
        <InputGroupAddon align="inline-end">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function RtlInputGroupDemo() {
  return (
    <DemoShell>
      <div dir="rtl" className="w-full">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="size-4" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput placeholder="ابحث…" />
          <InputGroupAddon align="inline-end">⌘K</InputGroupAddon>
        </InputGroup>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Sizes · variants · invalid — inherited from the group
// ─────────────────────────────────────────────────────────────

export function SizesDemo() {
  return (
    <DemoShell readout="sm · default · lg">
      <div className="flex flex-col gap-3">
        <InputGroup size="sm">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput placeholder="Small" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="size-4" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput placeholder="Default" />
        </InputGroup>
        <InputGroup size="lg">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput placeholder="Large" />
        </InputGroup>
      </div>
    </DemoShell>
  );
}

export function VariantsDemo() {
  return (
    <DemoShell readout="default · filled · ghost · underline">
      <div className="flex flex-col gap-3">
        <InputGroup>
          <InputGroupInput placeholder="Default" defaultValue="Default" />
        </InputGroup>
        <InputGroup variant="filled">
          <InputGroupInput placeholder="Filled" defaultValue="Filled" />
        </InputGroup>
        <InputGroup variant="ghost">
          <InputGroupInput placeholder="Ghost" defaultValue="Ghost" />
        </InputGroup>
        <InputGroup variant="underline">
          <InputGroupInput placeholder="Underline" defaultValue="Underline" />
        </InputGroup>
      </div>
    </DemoShell>
  );
}

export function InvalidDemo() {
  return (
    <DemoShell>
      <div className="flex flex-col gap-2">
        <InputGroup invalid>
          <InputGroupAddon align="inline-start">@</InputGroupAddon>
          <InputGroupInput placeholder="Username" defaultValue="taken-name" aria-describedby="group-invalid-hint" />
        </InputGroup>
        <p id="group-invalid-hint" role="alert" className="text-xs font-medium text-destructive">
          That username is already taken.
        </p>
      </div>
    </DemoShell>
  );
}

export function ButtonVariantsDemo() {
  return (
    <DemoShell readout="button sizes · variants">
      <div className="flex flex-col gap-3">
        <InputGroup>
          <InputGroupInput placeholder="teammate@studio.co" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Invite</InputGroupButton>
            <InputGroupButton variant="ghost">Later</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="API key" defaultValue="sk-live-92jf…" readOnly />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-sm" variant="outline" aria-label="Copy API key">
              <Copy className="size-4" aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Premium compositions
// ─────────────────────────────────────────────────────────────

export function UrlDemo() {
  return (
    <DemoShell readout="yoursite.com">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="yoursite" defaultValue="yoursite" aria-label="Domain" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function CopyDemo() {
  const [copied, setCopied] = React.useState(false);
  const value = "pnpm dlx shadcn@latest add @davinciui/input-group";
  return (
    <DemoShell readout={copied ? "Copied ✓" : undefined}>
      <InputGroup>
        <InputGroupInput defaultValue={value} readOnly aria-label="Install command" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            aria-label="Copy install command"
            onClick={() => {
              void navigator.clipboard?.writeText(value).catch(() => undefined);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}

export function ClearableDemo() {
  const [query, setQuery] = React.useState("linear");
  return (
    <DemoShell readout={query || "—"}>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search issues…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" variant="ghost" aria-label="Clear search" onClick={() => setQuery("")}>
              <X className="size-4" aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </DemoShell>
  );
}

export function MixedDemo() {
  const [value, setValue] = React.useState("");
  return (
    <DemoShell readout={`${value.length} / 60`}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <span className="text-xs font-semibold text-foreground">Profile handle</span>
        </InputGroupAddon>
        <InputGroupAddon align="inline-start">@</InputGroupAddon>
        <InputGroupInput placeholder="ada" maxLength={60} value={value} onChange={(e) => setValue(e.target.value)} />
        <InputGroupAddon align="inline-end">
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↵</kbd>
        </InputGroupAddon>
        <InputGroupAddon align="block-end">
          <span>Shown on invoices and receipts.</span>
          <span className="ms-auto font-mono">{value.length}/60</span>
        </InputGroupAddon>
      </InputGroup>
    </DemoShell>
  );
}
