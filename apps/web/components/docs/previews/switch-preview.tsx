"use client";

import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";

export function SwitchPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Switch />
    </div>
  );
}

export function SwitchDescriptionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch id="sw-desc" />
          <Label htmlFor="sw-desc">Airplane mode</Label>
        </div>
        <p className="text-xs text-muted-foreground">This is a description.</p>
      </div>
    </div>
  );
}

export function SwitchChoiceCardPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <label className="flex items-center justify-between gap-4 rounded-lg border p-4 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5 cursor-pointer max-w-sm w-full">
        <div>
          <p className="text-sm font-medium">Choice Card</p>
          <p className="text-xs text-muted-foreground">Enable feature</p>
        </div>
        <Switch />
      </label>
    </div>
  );
}

export function SwitchDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Switch disabled />
    </div>
  );
}

export function SwitchInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Switch invalid />
    </div>
  );
}

export function SwitchSizePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-8">
      <Switch size="sm" />
      <Switch size="default" />
      <Switch size="lg" />
    </div>
  );
}

export function SwitchRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Switch />
    </div>
  );
}
