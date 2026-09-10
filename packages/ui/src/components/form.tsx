"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from "./field";

// ─────────────────────────────────────────────────────────────
// Design notes — one system, not two:
// FormItem/FormLabel/FormControl/FormDescription/FormMessage are
// ergonomic aliases over the Field family, so every form inherits
// the same auto-wiring: stable ids, auto htmlFor, injected
// aria-invalid + aria-describedby, and alert-announced errors with
// icons. No form library required; bring your own state and
// validation (validate on blur, announce with role="alert").
// ─────────────────────────────────────────────────────────────

const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
  ({ className, onSubmit, action, ...props }, ref) => (
    <form
      ref={ref}
      action={action}
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        // Prevent full page reload / navigation when no native `action`
        // is set, so docs previews and SPA usage stay on the page.
        if (!action) e.preventDefault();
        onSubmit?.(e);
      }}
      {...props}
    />
  ),
);
Form.displayName = "Form";

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Error state — gates FieldError when FormMessage omits forceShow. @default false */
  invalid?: boolean;
}

function FormItem({ className, invalid = false, ...props }: FormItemProps) {
  return (
    <Field
      data-slot="form-item"
      orientation="vertical"
      invalid={invalid}
      className={cn(className)}
      {...props}
    />
  );
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <FieldLabel data-slot="form-label" className={cn("peer-disabled:opacity-70", className)} {...props} />;
}

function FormControl({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="form-control" className={cn(className)} {...props}>
      <FieldControl>{children}</FieldControl>
    </div>
  );
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <FieldDescription data-slot="form-description" className={cn("text-xs", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  // forceShow preserves legacy behavior (visible whenever children
  // exist) while adding role="alert" and the error icon.
  return (
    <FieldError data-slot="form-message" forceShow className={cn("text-xs", className)} {...props}>
      {children}
    </FieldError>
  );
}

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
