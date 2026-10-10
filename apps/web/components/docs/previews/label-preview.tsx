"use client";

import { Label } from "@workspace/ui/components/label";

export function LabelPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Label htmlFor="label-demo-email">Email address</Label>
        <input
          id="label-demo-email"
          type="email"
          placeholder="you@example.com"
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

export function LabelDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2 opacity-70">
        <Label htmlFor="label-demo-disabled">Archived project</Label>
        <input
          id="label-demo-disabled"
          disabled
          value="Read-only value"
          readOnly
          className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
