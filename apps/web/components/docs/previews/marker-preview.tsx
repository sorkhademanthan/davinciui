"use client";

import * as React from "react";
import { BookOpenCheck, Check, FileText, GitBranch, RotateCcw, Search, TriangleAlert } from "lucide-react";
import { Marker, MarkerContent, MarkerDot, MarkerIcon, MarkerTime } from "@workspace/ui/components/marker";
import { Spinner } from "@workspace/ui/components/spinner";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function MarkerBasicPreview() {
  return (
    <DemoShell>
      <div className="flex flex-col gap-2">
        <Marker>
          <MarkerIcon>
            <GitBranch />
          </MarkerIcon>
          <MarkerContent>Switched to a new branch</MarkerContent>
        </Marker>
        <Marker>
          <MarkerContent>Conversation compacted</MarkerContent>
        </Marker>
        <Marker>
          <MarkerIcon>
            <Search />
          </MarkerIcon>
          <MarkerContent>Explored 4 files</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerVariantsPreview() {
  return (
    <DemoShell readout="default · separator · border">
      <div className="flex flex-col gap-2">
        <Marker>
          <MarkerContent>A default marker for inline notes.</MarkerContent>
        </Marker>
        <Marker variant="separator">
          <MarkerContent>A separator marker</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerContent>A border marker for row boundaries.</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerStatusPreview() {
  return (
    <DemoShell readout='role="status" announces streaming updates'>
      <div className="flex flex-col gap-2">
        <Marker role="status">
          <MarkerIcon>
            <Spinner className="size-3.5" />
          </MarkerIcon>
          <MarkerContent>Compacting conversation</MarkerContent>
        </Marker>
        <Marker role="status">
          <MarkerIcon>
            <Spinner className="size-3.5" />
          </MarkerIcon>
          <MarkerContent>Running tests</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerShimmerPreview() {
  return (
    <DemoShell readout="pulsing content signals live streaming text">
      <div className="flex flex-col gap-2">
        <Marker>
          <MarkerContent className="animate-pulse">Thinking…</MarkerContent>
        </Marker>
        <Marker>
          <MarkerIcon>
            <Search />
          </MarkerIcon>
          <MarkerContent className="animate-pulse">Reading 4 files</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerSeparatorPreview() {
  return (
    <DemoShell>
      <div className="flex flex-col gap-2">
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
        <Marker>
          <MarkerContent>Worked for 42s</MarkerContent>
        </Marker>
        <Marker variant="separator">
          <MarkerContent>Conversation compacted</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerBorderPreview() {
  return (
    <DemoShell>
      <div className="flex flex-col">
        <Marker variant="border">
          <MarkerIcon>
            <GitBranch />
          </MarkerIcon>
          <MarkerContent>Switched to release-candidate</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerIcon>
            <Search />
          </MarkerIcon>
          <MarkerContent>Reviewed 8 related files</MarkerContent>
        </Marker>
        <Marker variant="border">
          <MarkerIcon>
            <FileText />
          </MarkerIcon>
          <MarkerContent>Opened implementation notes</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerIconPreview() {
  return (
    <DemoShell readout="flex-col stacks the icon above the content">
      <div className="flex flex-col gap-4">
        <Marker>
          <MarkerIcon>
            <GitBranch />
          </MarkerIcon>
          <MarkerContent>Switched to a new branch</MarkerContent>
        </Marker>
        <Marker className="flex-col gap-1">
          <MarkerIcon>
            <BookOpenCheck />
          </MarkerIcon>
          <MarkerContent>Syncing completed</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerLinksPreview() {
  const [reverted, setReverted] = React.useState(false);
  return (
    <DemoShell readout={reverted ? "change reverted" : "markers render as real links and buttons"}>
      <div className="flex flex-col gap-2">
        <Marker render={<a href="#marker" onClick={(e) => e.preventDefault()} />}>
          <MarkerIcon>
            <GitBranch />
          </MarkerIcon>
          <MarkerContent className="underline underline-offset-4">View the pull request</MarkerContent>
        </Marker>
        <Marker
          render={
            <button type="button" onClick={() => setReverted(true)} aria-label="Revert this change" />
          }
        >
          <MarkerIcon>
            <RotateCcw />
          </MarkerIcon>
          <MarkerContent className="underline underline-offset-4">Revert this change</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerTonesPreview() {
  return (
    <DemoShell readout="neutral · success · warning · error · info">
      <div className="flex flex-col gap-2">
        <Marker>
          <MarkerIcon>
            <GitBranch />
          </MarkerIcon>
          <MarkerContent>Switched to a new branch</MarkerContent>
        </Marker>
        <Marker tone="success">
          <MarkerIcon>
            <Check />
          </MarkerIcon>
          <MarkerContent>Tests passed in 12s</MarkerContent>
        </Marker>
        <Marker tone="warning">
          <MarkerIcon>
            <TriangleAlert />
          </MarkerIcon>
          <MarkerContent>2 snapshots need review</MarkerContent>
        </Marker>
        <Marker tone="error">
          <MarkerIcon>
            <TriangleAlert />
          </MarkerIcon>
          <MarkerContent>Build failed on step 4</MarkerContent>
        </Marker>
        <Marker tone="info">
          <MarkerIcon>
            <Search />
          </MarkerIcon>
          <MarkerContent>Explored 4 related files</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerLivePreview() {
  return (
    <DemoShell readout='live dot + role="status" for streaming work'>
      <div className="flex flex-col gap-2">
        <Marker tone="info" role="status">
          <MarkerDot live tone="info" />
          <MarkerContent className="animate-pulse">Thinking…</MarkerContent>
        </Marker>
        <Marker tone="success" role="status">
          <MarkerDot tone="success" />
          <MarkerContent>Compacted 38 messages</MarkerContent>
        </Marker>
        <Marker role="status">
          <MarkerIcon>
            <Spinner className="size-3.5" />
          </MarkerIcon>
          <MarkerContent>Running tests</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}

export function MarkerTimestampsPreview() {
  return (
    <DemoShell readout="mono timestamps dock at the row edge">
      <div className="flex flex-col gap-2">
        <Marker>
          <MarkerIcon>
            <GitBranch />
          </MarkerIcon>
          <MarkerContent>Switched to release-candidate</MarkerContent>
          <MarkerTime>09:41</MarkerTime>
        </Marker>
        <Marker tone="success">
          <MarkerIcon>
            <Check />
          </MarkerIcon>
          <MarkerContent>Deployed to preview</MarkerContent>
          <MarkerTime>09:42</MarkerTime>
        </Marker>
        <Marker variant="separator">
          <MarkerContent>Conversation compacted</MarkerContent>
        </Marker>
        <Marker size="sm">
          <MarkerContent>Worked for 42s · 38 messages</MarkerContent>
        </Marker>
      </div>
    </DemoShell>
  );
}
