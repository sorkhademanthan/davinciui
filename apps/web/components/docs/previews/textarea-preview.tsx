"use client";

import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";

export function TextareaPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Textarea placeholder="Type your message" className="max-w-sm" />
    </div>
  );
}

export function TextareaFieldPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Label htmlFor="ta-field">Field</Label>
        <Textarea id="ta-field" placeholder="Field textarea" />
      </div>
    </div>
  );
}

export function TextareaDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Textarea disabled placeholder="Disabled" className="max-w-sm" />
    </div>
  );
}

export function TextareaInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Textarea aria-invalid placeholder="Invalid" defaultValue="Wrong" className="max-w-sm" />
    </div>
  );
}

export function TextareaButtonPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <Textarea placeholder="With button" />
        <Button className="w-full">Submit</Button>
      </div>
    </div>
  );
}

export function TextareaRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Textarea placeholder="نص عربي" className="max-w-sm" />
    </div>
  );
}
