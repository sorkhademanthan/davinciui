"use client";

import { Toggle } from "@workspace/ui/components/toggle";
import { Bold } from "lucide-react";

export function TogglePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toggle aria-label="Toggle">
        <Bold className="size-4" />
      </Toggle>
    </div>
  );
}

export function ToggleOutlinePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toggle variant="outline" aria-label="Outline">
        <Bold className="size-4" />
      </Toggle>
    </div>
  );
}

export function ToggleWithTextPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toggle variant="outline">
        <Bold className="size-4" />
        Bold
      </Toggle>
    </div>
  );
}

export function ToggleSizePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-8">
      <Toggle size="sm" variant="outline">
        Small
      </Toggle>
      <Toggle variant="outline">Default</Toggle>
      <Toggle size="lg" variant="outline">
        Large
      </Toggle>
    </div>
  );
}

export function ToggleDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toggle disabled variant="outline" aria-label="Disabled">
        <Bold className="size-4" />
      </Toggle>
    </div>
  );
}

export function ToggleRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Toggle variant="outline" aria-label="RTL">
        <Bold className="size-4" />
      </Toggle>
    </div>
  );
}
