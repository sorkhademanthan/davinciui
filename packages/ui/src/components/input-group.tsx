"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement>;

function isAddon(child: React.ReactNode): child is React.ReactElement<InputGroupAddonProps> {
  return React.isValidElement(child) && child.type === InputGroupAddon;
}

function InputGroup({ className, children, ...props }: InputGroupProps) {
  const kids = React.Children.toArray(children);
  // Block addons stack above/below; everything else shares one middle row
  // in JSX order, so callers never think about wrappers.
  const top = kids.filter((c) => isAddon(c) && (c.props.align ?? "inline-start") === "block-start");
  const bottom = kids.filter((c) => isAddon(c) && (c.props.align ?? "inline-start") === "block-end");
  const middle = kids.filter((c) => !isAddon(c) || !["block-start", "block-end"].includes(c.props.align ?? "inline-start"));
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex w-full flex-col rounded-lg border border-input bg-background shadow-xs transition-colors",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
        "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-1 has-[[aria-invalid=true]]:ring-destructive/20",
        "has-[input:disabled]:opacity-50 has-[textarea:disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {top}
      {middle.length > 0 && <div className="flex min-w-0 flex-1 flex-row items-center">{middle}</div>}
      {bottom}
    </div>
  );
}

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Addon placement around the field. @default "inline-start" */
  align?: InputGroupAddonAlign;
}

const ADDON_ALIGN_CLASSES: Record<InputGroupAddonAlign, string> = {
  "inline-start": "flex-row items-center ps-2.5",
  "inline-end": "flex-row items-center pe-2.5",
  "block-start": "flex-col items-stretch border-b border-border p-2",
  "block-end": "flex-col items-stretch border-t border-border p-2",
};

function InputGroupAddon({ align = "inline-start", className, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn("flex gap-1.5 text-sm text-muted-foreground", ADDON_ALIGN_CLASSES[align], className)}
      {...props}
    />
  );
}

export type InputGroupButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function InputGroupButton({ className, type = "button", ...props }: InputGroupButtonProps) {
  return (
    <button
      data-slot="input-group-button"
      type={type}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "h-9 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "min-h-20 w-full resize-y bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea };

export default InputGroup;
