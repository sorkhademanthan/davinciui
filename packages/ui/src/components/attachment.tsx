"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done";
export type AttachmentSize = "default" | "sm" | "xs";
export type AttachmentOrientation = "horizontal" | "vertical";

interface AttachmentContextValue {
  state: AttachmentState;
  size: AttachmentSize;
  orientation: AttachmentOrientation;
}

const AttachmentContext = React.createContext<AttachmentContextValue>({
  state: "done",
  size: "default",
  orientation: "horizontal",
});

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Upload lifecycle state. Drives styling and the title shimmer. @default "done" */
  state?: AttachmentState;
  /** Attachment size. @default "default" */
  size?: AttachmentSize;
  /** Lay the media beside or above the content. @default "horizontal" */
  orientation?: AttachmentOrientation;
}

function Attachment({ state = "done", size = "default", orientation = "horizontal", className, ...props }: AttachmentProps) {
  return (
    <AttachmentContext.Provider value={{ state, size, orientation }}>
      <div
        data-slot="attachment"
        data-state={state}
        data-size={size}
        data-orientation={orientation}
        className={cn(
          "relative flex w-full gap-3 overflow-hidden rounded-xl border bg-card p-3 text-card-foreground transition-colors duration-200",
          orientation === "vertical" && "flex-col",
          state === "error" && "border-destructive/50",
          // Clickable cards shift the border on hover so the trigger affordance reads.
          "has-[[data-slot=attachment-trigger]]:hover:border-ring/40",
          className
        )}
        {...props}
      />
    </AttachmentContext.Provider>
  );
}

export interface AttachmentMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the media holds an icon or an <img>. @default "icon" */
  variant?: "icon" | "image";
}

function AttachmentMedia({ variant = "icon", className, children, ...props }: AttachmentMediaProps) {
  const { size, orientation } = React.useContext(AttachmentContext);
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(
        "shrink-0 self-center overflow-hidden",
        variant === "icon" &&
          "flex items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-1/2",
        variant === "icon" && size === "default" && "size-10",
        variant === "icon" && size === "sm" && "size-8 rounded-md",
        variant === "icon" && size === "xs" && "size-7 rounded-md",
        variant === "image" && "rounded-md border border-border/60 bg-muted",
        variant === "image" && orientation === "horizontal" && "aspect-square w-16 [&_img]:size-full [&_img]:object-cover",
        variant === "image" && orientation === "vertical" && "aspect-video w-full [&_img]:size-full [&_img]:object-cover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AttachmentContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="attachment-content"
      className={cn("flex min-w-0 flex-1 flex-col justify-center gap-0.5", className)}
      {...props}
    />
  );
}

function AttachmentTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { state, size } = React.useContext(AttachmentContext);
  const busy = state === "uploading" || state === "processing";
  return (
    <div
      data-slot="attachment-title"
      data-busy={busy || undefined}
      className={cn(
        "truncate font-medium tracking-[-0.01em]",
        size === "default" && "text-sm",
        size === "sm" && "text-[13px]",
        size === "xs" && "text-xs",
        busy && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

function AttachmentDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { state } = React.useContext(AttachmentContext);
  return (
    <div
      data-slot="attachment-description"
      className={cn(
        "truncate text-xs text-muted-foreground",
        state === "error" && "text-destructive",
        className
      )}
      {...props}
    />
  );
}

function AttachmentActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = React.useContext(AttachmentContext);
  const overlay = orientation === "vertical";
  return (
    <div
      data-slot="attachment-actions"
      data-overlay={overlay || undefined}
      className={cn(
        "z-10 flex shrink-0 items-center gap-1",
        // Horizontal rows balance around the middle; vertical cards float
        // the actions over the media like a photo viewer.
        overlay
          ? "absolute end-2 top-2 rounded-full border border-border/60 bg-background/85 p-0.5 shadow-sm backdrop-blur [&_[data-slot=attachment-action]]:rounded-full"
          : "relative",
        className
      )}
      {...props}
    />
  );
}

export type AttachmentActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function AttachmentAction({ className, type = "button", ...props }: AttachmentActionProps) {
  return (
    <button
      data-slot="attachment-action"
      type={type}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  );
}

export interface AttachmentTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the trigger as a different element, such as a link. */
  render?: React.ReactElement;
}

function AttachmentTrigger({ render, className, ...props }: AttachmentTriggerProps) {
  // Fills the card behind the actions so both stay independently clickable.
  const triggerProps = {
    "data-slot": "attachment-trigger",
    className: cn(
      "absolute inset-0 z-0 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
      className
    ),
    ...props,
  } as React.ButtonHTMLAttributes<HTMLButtonElement> & { "data-slot": string };
  if (render && React.isValidElement(render)) {
    const element = render as React.ReactElement<{ className?: string }>;
    return React.cloneElement(element, {
      ...triggerProps,
      ...element.props,
      className: cn(triggerProps.className, element.props.className),
    });
  }
  return <button {...triggerProps} />;
}

function AttachmentGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="attachment-group"
      className={cn(
        "flex w-full gap-3 overflow-x-auto pb-1 snap-x snap-mandatory",
        "[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]",
        "[&_>*]:w-64 [&_>*]:shrink-0 [&_>*]:snap-start",
        className
      )}
      {...props}
    />
  );
}

export {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
  AttachmentGroup,
};

export default Attachment;
