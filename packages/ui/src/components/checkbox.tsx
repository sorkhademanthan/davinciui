"use client";

import * as React from "react";
import { Check, CircleAlert, Minus } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

// ---------------------------------------------------------------------------
// Checkbox — native input, 20px box, sr-only input + styled box via label
// ---------------------------------------------------------------------------

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Error state. Sets aria-invalid + destructive styling. */
  invalid?: boolean;
  /** Tri-state dash for "select all" parents. Sets input.indeterminate. */
  indeterminate?: boolean;
}

function Checkbox({
  className,
  invalid,
  indeterminate,
  checked,
  defaultChecked,
  disabled,
  required,
  onChange,
  ref: forwardedRef,
  ...props
}: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Merge forwarded ref with internal ref for indeterminate wiring.
  const setRefs = React.useCallback(
    (node: HTMLInputElement | null) => {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef && typeof forwardedRef === "object") {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
      }
    },
    [forwardedRef]
  );

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  // Indeterminate parents report aria-checked="mixed" to screen readers.
  const ariaChecked = indeterminate
    ? ("mixed" as const)
    : checked !== undefined
      ? checked
      : undefined;

  return (
    <label
      data-slot="checkbox"
      data-state={indeterminate ? "indeterminate" : undefined}
      aria-invalid={invalid || undefined}
      className={cn(
        // 20px box, 6px radius, crisp 120ms motion
        "relative inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-input bg-background shadow-xs/5 transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out",
        "has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background",
        "has-[input:checked]:border-primary has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground",
        "has-[:indeterminate]:border-primary has-[:indeterminate]:bg-primary has-[:indeterminate]:text-primary-foreground",
        "hover:border-primary/50 has-[input:checked]:hover:bg-primary/90",
        // Invalid: red border + ring; keeps checked fill readable
        invalid &&
          "border-destructive ring-1 ring-destructive/25 hover:border-destructive has-[input:checked]:border-destructive has-[input:checked]:bg-destructive has-[input:checked]:hover:bg-destructive/90",
        "has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 has-[input:disabled]:hover:border-input",
        "motion-reduce:transition-none",
        className
      )}
    >
      <input
        ref={setRefs}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        required={required}
        aria-invalid={invalid || undefined}
        aria-checked={ariaChecked}
        onChange={onChange}
        {...props}
      />
      {indeterminate ? (
        <Minus className="size-3.5" strokeWidth={3} aria-hidden="true" />
      ) : (
        <Check
          className="size-3.5 scale-50 opacity-0 transition-[opacity,transform] duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
          strokeWidth={3}
          aria-hidden="true"
        />
      )}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Field layout — link-safe (div + htmlFor, so consent links stay clickable)
// Row is min 44px tall via label padding => WCAG 2.5.8 target size.
// ---------------------------------------------------------------------------

function CheckboxField({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="checkbox-field"
      className={cn("flex items-start gap-3", className)}
      {...props}
    />
  );
}

function CheckboxLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="checkbox-label"
      className={cn(
        "cursor-pointer text-sm leading-tight font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

function CheckboxContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="checkbox-content" className={cn("grid gap-1 py-0.5", className)} {...props} />;
}

function CheckboxDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="checkbox-description"
      className={cn("text-sm leading-snug text-muted-foreground", className)}
      {...props}
    />
  );
}

function CheckboxError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="checkbox-error"
      role="alert"
      className={cn("flex items-start gap-1.5 text-sm leading-snug font-medium text-destructive", className)}
      {...props}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// ---------------------------------------------------------------------------
// Group — native fieldset + legend semantics, vertical/horizontal,
// group-level required + invalid with describedby wiring.
// ---------------------------------------------------------------------------

export interface CheckboxGroupProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "title"
> {
  legend: React.ReactNode;
  description?: React.ReactNode;
  errorText?: React.ReactNode;
  invalid?: boolean;
  required?: boolean;
  orientation?: "vertical" | "horizontal";
}

function CheckboxGroup({
  className,
  legend,
  description,
  errorText,
  invalid,
  required,
  orientation = "vertical",
  children,
  ...props
}: CheckboxGroupProps) {
  const autoId = React.useId();
  const descId = description ? `${autoId}-desc` : undefined;
  const errId = errorText ? `${autoId}-error` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      data-slot="checkbox-group"
      data-orientation={orientation}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn("grid gap-3", className)}
      {...props}
    >
      <legend className="text-sm font-medium">
        {legend}
        {required && (
          <span className="ms-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      {description && (
        <p id={descId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div
        className={cn(
          "grid gap-2",
          orientation === "horizontal" && "grid-flow-col justify-start gap-6"
        )}
      >
        {children}
      </div>
      {errorText && (
        <p id={errId} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorText}</span>
        </p>
      )}
    </fieldset>
  );
}

export {
  Checkbox,
  CheckboxField,
  CheckboxLabel,
  CheckboxContent,
  CheckboxDescription,
  CheckboxError,
  CheckboxGroup,
};
