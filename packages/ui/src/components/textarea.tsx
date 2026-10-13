"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs/5 placeholder:text-muted-foreground/72 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:opacity-50 dark:bg-input/32",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
