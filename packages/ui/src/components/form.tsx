"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(({ className, ...props }, ref) => (
  <form ref={ref} className={cn("space-y-6", className)} {...props} />
));
Form.displayName = "Form";

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="form-item" className={cn("space-y-2", className)} {...props} />;
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label data-slot="form-label" className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />;
}

function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="form-control" className={cn(className)} {...props} />;
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="form-description" className={cn("text-xs text-muted-foreground", className)} {...props} />;
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return <p data-slot="form-message" className={cn("text-xs font-medium text-destructive", className)} {...props}>{children}</p>;
}

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
