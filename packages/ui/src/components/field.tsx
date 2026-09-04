"use client";

import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Context — shares generated ids and invalid state with parts.
// ─────────────────────────────────────────────────────────────

interface FieldContextValue {
  id: string;
  invalid: boolean;
}

const FieldContext = React.createContext<FieldContextValue>({ id: "", invalid: false });

function useField() {
  return React.useContext(FieldContext);
}

export type FieldOrientation = "vertical" | "horizontal" | "responsive";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout direction. Responsive stacks on mobile, rows on sm+. @default "vertical" */
  orientation?: FieldOrientation;
  /** Error state shared with FieldError. @default false */
  invalid?: boolean;
}

const ORIENTATION_CLASSES: Record<FieldOrientation, string> = {
  vertical: "flex-col gap-2",
  horizontal: "flex-row items-start gap-3",
  responsive: "flex-col gap-2 sm:flex-row sm:items-start sm:gap-3",
};

function Field({ orientation = "vertical", invalid = false, className, children, ...props }: FieldProps) {
  const id = React.useId();
  return (
    <FieldContext.Provider value={{ id, invalid }}>
      <div
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        className={cn("flex", ORIENTATION_CLASSES[orientation], className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-group" className={cn("flex w-full flex-col gap-5", className)} {...props} />;
}

function FieldSet({ className, ...props }: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex w-full flex-col gap-5 rounded-xl border p-4", className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: React.HTMLAttributes<HTMLLegendElement>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("px-1 text-sm font-semibold", className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-content" className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)} {...props} />;
}

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <label
      data-slot="field-label"
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="field-title" className={cn("text-sm font-semibold leading-none", className)} {...props} />
  );
}

function FieldDescription({ className, id: idProp, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { id } = useField();
  return (
    <p
      data-slot="field-description"
      id={idProp ?? (id ? `${id}-description` : undefined)}
      className={cn("text-[13px] leading-5 text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldSeparator({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="field-separator"
      role="separator"
      className={cn("flex items-center gap-3 text-xs text-muted-foreground", className)}
      {...props}
    >
      <span aria-hidden className="h-px flex-1 bg-border" />
      {children}
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Error messages. Rendered as a list when more than one. */
  errors?: string[];
  /** Force visibility regardless of Field invalid state. */
  forceShow?: boolean;
}

function FieldError({ className, errors, forceShow = false, children, id: idProp, ...props }: FieldErrorProps) {
  const { id, invalid } = useField();
  const content = errors && errors.length > 0 ? errors : children ? [children] : [];
  if (content.length === 0) return null;
  if (!invalid && !forceShow) return null;
  return (
    <p
      data-slot="field-error"
      role="alert"
      id={idProp ?? (id ? `${id}-error` : undefined)}
      className={cn("text-[13px] font-medium leading-5 text-destructive", className)}
      {...props}
    >
      {content.length === 1 ? content[0] : <ul className="list-disc space-y-0.5 pl-4">{content.map((c, i) => <li key={i}>{c}</li>)}</ul>}
    </p>
  );
}

export {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
  useField,
};

export default Field;
