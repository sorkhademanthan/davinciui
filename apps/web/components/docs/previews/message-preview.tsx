"use client";

import * as React from "react";
import { Check, CheckCheck, Copy, Download, FileText, Pencil, RefreshCcw, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Bubble, BubbleContent, BubbleReactions } from "@workspace/ui/components/bubble";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@workspace/ui/components/attachment";
import {
  Message,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  MessageTime,
} from "@workspace/ui/components/message";
import { Spinner } from "@workspace/ui/components/spinner";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

function Person({ initials }: { initials: string }) {
  return (
    <Avatar className="size-8">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

export function MessageBasicPreview() {
  return (
    <DemoShell>
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="CN" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>How can I help you today?</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble>
              <BubbleContent>Deploying to prod real quick.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

export function MessageAvatarPreview() {
  return (
    <DemoShell readout='align="end" mirrors the row'>
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="R" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>The build failed during dependency installation.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar>
            <Person initials="R" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>Can you share the exact error?</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar>
            <Person initials="ME" />
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>Here&apos;s the error from the logs.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

export function MessageGroupPreview() {
  return (
    <DemoShell readout="empty avatar slots keep earlier rows aligned">
      <MessageGroup>
        <Message>
          <MessageAvatar className="w-8" />
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>I checked the registry addresses.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar>
            <Person initials="CN" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>The component and example JSON now live under the UI registry.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </MessageGroup>
    </DemoShell>
  );
}

export function MessageHeaderFooterPreview() {
  return (
    <DemoShell readout="header stays start-aligned · footer follows the side">
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="O" />
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Olivia</MessageHeader>
            <Bubble variant="secondary">
              <BubbleContent>Send the report to the team. Ping @shadcn if you need help.</BubbleContent>
            </Bubble>
            <MessageFooter>Read · Yesterday</MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble>
              <BubbleContent>It&apos;s a one-line change.</BubbleContent>
            </Bubble>
            <MessageFooter>Delivered</MessageFooter>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

export function MessageActionsPreview() {
  const [copied, setCopied] = React.useState(false);
  return (
    <DemoShell readout={copied ? "copied to clipboard" : "icon-only actions carry aria-labels"}>
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="R" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>The install failure is coming from the workspace package.</BubbleContent>
            </Bubble>
            <MessageFooter>
              <button
                type="button"
                aria-label="Copy message"
                onClick={() => setCopied(true)}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
              <button
                type="button"
                aria-label="Retry request"
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <RefreshCcw className="size-3.5" />
              </button>
            </MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble variant="destructive">
              <BubbleContent>Failed to send.</BubbleContent>
            </Bubble>
            <MessageFooter>
              <button
                type="button"
                aria-label="Retry send"
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <RefreshCcw className="size-3.5" />
              </button>
            </MessageFooter>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

export function MessageAttachmentPreview() {
  const [removed, setRemoved] = React.useState(false);
  return (
    <DemoShell>
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="ME" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>Here&apos;s the image. Can you add it to the PDF?</BubbleContent>
            </Bubble>
            <div className="mt-2 overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&auto=format&fit=crop&q=60"
                alt="Workspace"
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
            </div>
          </MessageContent>
        </Message>
        {!removed ? (
          <Message align="end">
            <MessageContent>
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
              </Attachment>
              <MessageFooter>Delivered</MessageFooter>
            </MessageContent>
          </Message>
        ) : null}
        <Message>
          <MessageAvatar>
            <Person initials="ME" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>Thanks. Looks good.</BubbleContent>
              <BubbleReactions role="img" aria-label="Reactions: thumbs up">
                <span>👍</span>
              </BubbleReactions>
            </Bubble>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

export function MessageStatusPreview() {
  return (
    <DemoShell readout="role=status announces streaming updates">
      <div className="flex flex-col gap-4">
        <Message role="status">
          <MessageAvatar>
            <Person initials="A" />
          </MessageAvatar>
          <MessageContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              <span className="animate-pulse">Checking the logs…</span>
            </div>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:transition-none"
    >
      {children}
    </button>
  );
}

export function MessageHoverActionsPreview() {
  const [copied, setCopied] = React.useState(false);
  return (
    <DemoShell readout={copied ? "copied to clipboard" : "hover the row — actions reveal, stay for keyboard and touch"}>
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="R" />
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>The install failure is coming from the workspace package.</BubbleContent>
            </Bubble>
            <MessageActions>
              <ActionButton label="Copy message" onClick={() => setCopied(true)}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </ActionButton>
              <ActionButton label="Retry request">
                <RefreshCcw className="size-3.5" />
              </ActionButton>
            </MessageActions>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble>
              <BubbleContent>Deploying to prod real quick.</BubbleContent>
            </Bubble>
            <MessageActions>
              <ActionButton label="Edit message">
                <Pencil className="size-3.5" />
              </ActionButton>
              <ActionButton label="Copy message">
                <Copy className="size-3.5" />
              </ActionButton>
            </MessageActions>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}

export function MessageTimestampsPreview() {
  return (
    <DemoShell readout="headers pair names with time · footers pair ticks with time">
      <div className="flex flex-col gap-4">
        <Message>
          <MessageAvatar>
            <Person initials="O" />
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>
              Olivia <MessageTime>09:41</MessageTime>
            </MessageHeader>
            <Bubble variant="secondary">
              <BubbleContent>Send the report to the team when it lands.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble>
              <BubbleContent>It&apos;s a one-line change.</BubbleContent>
            </Bubble>
            <MessageFooter>
              <CheckCheck className="size-3.5 text-sky-500" aria-label="Read" />
              <MessageTime>09:42</MessageTime>
            </MessageFooter>
          </MessageContent>
        </Message>
      </div>
    </DemoShell>
  );
}
