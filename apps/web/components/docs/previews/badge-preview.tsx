"use client";

import * as React from "react";
import { Badge, BadgeDot } from "@workspace/ui/components/badge";
import { ArrowUpRight, Bell, Bookmark, Check, Loader2 } from "lucide-react";

function Shell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function BadgePreview() {
  return (
    <Shell>
      <Badge>Badge</Badge>
    </Shell>
  );
}

export function BadgeVariantsPreview() {
  return (
    <Shell readout="default · secondary · destructive · outline · info · success · warning">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </Shell>
  );
}

export function BadgeSizesPreview() {
  return (
    <Shell readout="sm · default · lg">
      <Badge size="sm">Small</Badge>
      <Badge>Default</Badge>
      <Badge size="lg">Large</Badge>
    </Shell>
  );
}

export function BadgeIconPreview() {
  return (
    <Shell>
      <Badge variant="success">
        <Check /> Verified
      </Badge>
      <Badge>
        <Bell /> 5 new <span className="sr-only">notifications</span>
      </Badge>
      <Badge variant="outline">
        <Bookmark /> Saved
      </Badge>
    </Shell>
  );
}

export function BadgeDotPreview() {
  return (
    <Shell readout="status dots inherit the tone — pulse for live">
      <Badge variant="outline">
        <BadgeDot className="bg-emerald-500" /> Live
      </Badge>
      <Badge variant="outline">
        <BadgeDot pulse className="bg-blue-500" /> Streaming
      </Badge>
      <Badge variant="outline">
        <BadgeDot className="bg-amber-500" /> Paused
      </Badge>
      <Badge variant="info">
        <BadgeDot /> Updates
      </Badge>
    </Shell>
  );
}

export function BadgeRemovablePreview() {
  const [tags, setTags] = React.useState(["design", "motion", "tokens"]);
  return (
    <Shell readout={tags.length ? `${tags.length} filters active` : "no filters — click to reset"}>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))} removeLabel={`Remove ${tag} filter`}>
          {tag}
        </Badge>
      ))}
      {tags.length === 0 ? (
        <button
          type="button"
          onClick={() => setTags(["design", "motion", "tokens"])}
          className="h-7 rounded-full border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Reset filters
        </button>
      ) : null}
    </Shell>
  );
}

export function BadgeSpinnerPreview() {
  return (
    <Shell>
      <Badge variant="secondary">
        <Loader2 className="animate-spin" /> Syncing
      </Badge>
      <Badge variant="outline">
        <Loader2 className="animate-spin" /> Generating
      </Badge>
    </Shell>
  );
}

export function BadgeLinkPreview() {
  return (
    <Shell>
      <Badge asChild>
        <a href="#badge">
          v2.0 available <ArrowUpRight />
        </a>
      </Badge>
    </Shell>
  );
}

export function BadgeColorsPreview() {
  return (
    <Shell readout="className still wins over every tone">
      <Badge className="border-transparent bg-violet-500/10 text-violet-700 dark:text-violet-300">Violet</Badge>
      <Badge className="border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-300">Sky</Badge>
      <Badge variant="success" className="uppercase tracking-widest">
        Shipped
      </Badge>
    </Shell>
  );
}

export function BadgeRtlPreview() {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>شارة</Badge>
        <Badge variant="secondary">
          <Bell /> ٥ جديدة
        </Badge>
        <Badge variant="success" onRemove={() => {}} removeLabel="إزالة">
          مكتمل
        </Badge>
      </div>
    </div>
  );
}
