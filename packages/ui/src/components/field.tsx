"use client";

import { cn } from "@workspace/ui/lib/utils";
import { CircleAlert } from "lucide-react";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Context — shares generated ids and invalid state with parts.
// The control id is derived once per Field so FieldLabel and
// FieldControl agree without the user threading strings.
// ─────────────────────────────────────────────────────────────

interface FieldContextValue {
  id: string;
  controlId: string;
  descriptionId: string;
  errorId: string;
  invalid: boolean;
}

const FieldContext = React.createContext<FieldContextValue>({
  id: "",
  controlId: "",
  descriptionId: "",
  errorId: "",
  invalid: false,
});

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
  const value = React.useMemo<FieldContextValue>(
    () => ({
      id,
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
      invalid,
    }),
    [id, invalid],
  );
  return (
    <FieldContext.Provider value={value}>
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
      className={cn("flex w-full flex-col gap-5 rounded-xl border border-border/70 bg-card/50 p-5 pt-4", className)}
      {...props}
    />
  );
}

function FieldLegend({ className, ...props }: React.HTMLAttributes<HTMLLegendElement>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("px-2 text-[13px] font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="field-content" className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)} {...props} />;
}

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function FieldLabel({ className, htmlFor, ...props }: FieldLabelProps) {
  const { controlId } = useField();
  return (
    <label
      data-slot="field-label"
      htmlFor={htmlFor ?? (controlId || undefined)}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)}
      {...props}
    />
  );
}

/**
 * Wraps a single control and wires it to the Field automatically:
 * id, aria-invalid, and aria-describedby (description + error).
 * Explicit props on the child always win. Non-element children
 * render untouched.
 *
 *   <Field>
 *     <FieldLabel>Email</FieldLabel>
 *     <FieldControl><Input type="email" /></FieldControl>
 *     <FieldDescription>Invite lands here.</FieldDescription>
 *     <FieldError>Enter a valid email.</FieldError>
 *   </Field>
 */
function FieldControl({ children }: { children: React.ReactNode }) {
  const { controlId, descriptionId, errorId, invalid } = useField();
  if (!React.isValidElement(children)) return <React.Fragment>{children}</React.Fragment>;
  const child = children as React.ReactElement<{
    id?: string;
    "aria-invalid"?: boolean | "true" | "false";
    "aria-describedby"?: string;
  }>;
  return React.cloneElement(child, {
    id: child.props.id ?? (controlId || undefined),
    "aria-invalid": child.props["aria-invalid"] ?? (invalid || undefined),
    "aria-describedby":
      child.props["aria-describedby"] ?? ([descriptionId, errorId].filter(Boolean).join(" ") || undefined),
  });
}

function FieldTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="field-title" className={cn("text-sm font-semibold leading-none", className)} {...props} />
  );
}

function FieldDescription({ className, id: idProp, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useField();
  return (
    <p
      data-slot="field-description"
      id={idProp ?? (descriptionId || undefined)}
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
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
      {children}
      <span aria-hidden className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
    </div>
  );
}

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Error messages. Rendered as a list when more than one. */
  errors?: string[];
  /** Force visibility regardless of Field invalid state. */
  forceShow?: boolean;
  /** Leading alert icon — never color alone. @default true */
  showIcon?: boolean;
}

function FieldError({ className, errors, forceShow = false, showIcon = true, children, id: idProp, ...props }: FieldErrorProps) {
  const { errorId, invalid } = useField();
  const content = errors && errors.length > 0 ? errors : children ? [children] : [];
  if (content.length === 0) return null;
  if (!invalid && !forceShow) return null;
  return (
    <p
      data-slot="field-error"
      role="alert"
      id={idProp ?? (errorId || undefined)}
      className={cn("flex items-start gap-1.5 text-[13px] font-medium leading-5 text-destructive", className)}
      {...props}
    >
      {showIcon && <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />}
      <span className="min-w-0 flex-1">
        {content.length === 1 ? content[0] : <ul className="list-disc space-y-0.5 pl-4">{content.map((c, i) => <li key={i}>{c}</li>)}</ul>}
      </span>
    </p>
  );
}

export {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  FieldControl,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
  useField,
};

export default Field;
