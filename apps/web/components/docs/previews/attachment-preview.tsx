"use client";

import * as React from "react";
import {
  Check,
  Clock,
  Download,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@workspace/ui/components/attachment";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function AttachmentBasicPreview() {
  const [removed, setRemoved] = React.useState(false);
  return (
    <DemoShell readout={removed ? "sales-dashboard.pdf removed" : "actions stay clickable over the trigger"}>
      {!removed ? (
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Download sales-dashboard.pdf">
              <Download />
            </AttachmentAction>
            <AttachmentAction aria-label="Remove sales-dashboard.pdf" onClick={() => setRemoved(true)}>
              <X />
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger aria-label="Open sales-dashboard.pdf" onClick={() => {}} />
        </Attachment>
      ) : (
        <button
          type="button"
          onClick={() => setRemoved(false)}
          className="h-9 w-full rounded-md border bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent"
        >
          Restore attachment
        </button>
      )}
    </DemoShell>
  );
}

const WORKSPACE_IMAGE = {
  src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&auto=format&fit=crop&q=60",
  alt: "Workspace",
  title: "workspace.png",
  meta: "PNG · 820 KB",
};

const DESK_IMAGE = {
  src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&auto=format&fit=crop&q=60",
  alt: "Desk",
  title: "desk-reference.jpg",
  meta: "JPG · 1.1 MB",
};

export function AttachmentImagePreview() {
  return (
    <DemoShell readout='variant="image" · orientation="vertical" stacks media above content'>
      <div className="flex flex-col gap-4">
        <Attachment>
          <AttachmentMedia variant="image">
            <img src={WORKSPACE_IMAGE.src} alt={WORKSPACE_IMAGE.alt} loading="lazy" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{WORKSPACE_IMAGE.title}</AttachmentTitle>
            <AttachmentDescription>{WORKSPACE_IMAGE.meta}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${WORKSPACE_IMAGE.title}`}>
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment orientation="vertical">
          <AttachmentMedia variant="image">
            <img src={DESK_IMAGE.src} alt={DESK_IMAGE.alt} loading="lazy" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{DESK_IMAGE.title}</AttachmentTitle>
            <AttachmentDescription>{DESK_IMAGE.meta}</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${DESK_IMAGE.title}`}>
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </div>
    </DemoShell>
  );
}

export function AttachmentStatesPreview() {
  return (
    <DemoShell readout="uploading + processing shimmer the title · error is destructive + textual">
      <div className="flex flex-col gap-3">
        <Attachment state="idle">
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>selected-file.pdf</AttachmentTitle>
            <AttachmentDescription>Ready to upload</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="uploading">
          <AttachmentMedia>
            <LoaderCircle className="animate-spin" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>design-system.zip</AttachmentTitle>
            <AttachmentDescription>Uploading · 64%</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="processing">
          <AttachmentMedia>
            <Clock />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>market-research.pdf</AttachmentTitle>
            <AttachmentDescription>Processing document</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment state="error">
          <AttachmentMedia>
            <FileSpreadsheet />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>financial-model.xlsx</AttachmentTitle>
            <AttachmentDescription>Upload failed. Try again.</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove financial-model.xlsx">
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        <Attachment state="done">
          <AttachmentMedia>
            <Check />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>uploaded-report.pdf</AttachmentTitle>
            <AttachmentDescription>Uploaded · 1.8 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </div>
    </DemoShell>
  );
}

export function AttachmentSizesPreview() {
  return (
    <DemoShell readout="default · sm · xs">
      <div className="flex flex-col gap-3">
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Default attachment</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment size="sm">
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Small attachment</AttachmentTitle>
            <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment size="xs">
          <AttachmentMedia>
            <FileCode />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Extra small attachment</AttachmentTitle>
          </AttachmentContent>
        </Attachment>
      </div>
    </DemoShell>
  );
}

export function AttachmentGroupPreview() {
  return (
    <DemoShell readout="scroll horizontally — rows snap with an edge fade">
      <AttachmentGroup aria-label="Message attachments">
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>briefing-notes.pdf</AttachmentTitle>
            <AttachmentDescription>PDF · 1.4 MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment>
          <AttachmentMedia variant="image">
            <img src={WORKSPACE_IMAGE.src} alt={WORKSPACE_IMAGE.alt} loading="lazy" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{WORKSPACE_IMAGE.title}</AttachmentTitle>
            <AttachmentDescription>{WORKSPACE_IMAGE.meta}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment>
          <AttachmentMedia>
            <FileSpreadsheet />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>customers.csv</AttachmentTitle>
            <AttachmentDescription>CSV · 18 KB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment>
          <AttachmentMedia>
            <FileCode />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>renderer.tsx</AttachmentTitle>
            <AttachmentDescription>TSX · 12 KB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
    </DemoShell>
  );
}

export function AttachmentTriggerPreview() {
  const [opened, setOpened] = React.useState<string | null>(null);
  return (
    <DemoShell readout={opened ? `triggered: ${opened}` : "whole card activates · actions stay independent"}>
      <div className="flex flex-col gap-4">
        <Attachment>
          <AttachmentMedia>
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>research-summary.pdf</AttachmentTitle>
            <AttachmentDescription>Click anywhere to preview</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Preview research-summary.pdf" onClick={() => setOpened("action: preview")}>
              <Eye />
            </AttachmentAction>
            <AttachmentAction aria-label="Remove research-summary.pdf">
              <X />
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger aria-label="Open preview dialog" onClick={() => setOpened("trigger: dialog")} />
        </Attachment>
        <Attachment>
          <AttachmentMedia variant="image">
            <img src={DESK_IMAGE.src} alt={DESK_IMAGE.alt} loading="lazy" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{DESK_IMAGE.title}</AttachmentTitle>
            <AttachmentDescription>Opens the full image in a new tab</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label={`Remove ${DESK_IMAGE.title}`}>
              <X />
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger
            render={
              <a
                href="https://images.unsplash.com/photo-1497215728101-856f4ea42174"
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${DESK_IMAGE.title}`}
              />
            }
          />
        </Attachment>
      </div>
    </DemoShell>
  );
}
