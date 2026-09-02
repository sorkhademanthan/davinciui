"use client";

import { RadioGroup, Radio } from "@workspace/ui/components/radio";
import { Label } from "@workspace/ui/components/label";

export function RadioPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <RadioGroup defaultValue="1">
        <Radio name="r1" value="Option 1" defaultChecked />
        <Radio name="r1" value="Option 2" />
      </RadioGroup>
    </div>
  );
}

export function RadioDescriptionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <RadioGroup className="max-w-sm">
        <div className="space-y-1">
          <Radio name="r2" value="With description" defaultChecked />
          <p className="text-xs text-muted-foreground ml-6">This is a description.</p>
        </div>
      </RadioGroup>
    </div>
  );
}

export function RadioChoiceCardPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <RadioGroup className="grid gap-3 max-w-sm w-full">
        <label className="flex items-center gap-3 rounded-lg border p-3 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 cursor-pointer">
          <input type="radio" name="choice" defaultChecked className="sr-only peer" />
          <span className="size-4 rounded-full border flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary">
            <span className="size-2 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
          </span>
          Choice Card A
        </label>
        <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer">
          <input type="radio" name="choice" className="sr-only peer" />
          <span className="size-4 rounded-full border" />
          Choice Card B
        </label>
      </RadioGroup>
    </div>
  );
}

export function RadioFieldsetPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <fieldset className="border rounded-lg p-4 max-w-sm w-full space-y-3">
        <legend className="text-sm font-medium px-1">Fieldset</legend>
        <RadioGroup>
          <Radio name="fs" value="One" defaultChecked />
          <Radio name="fs" value="Two" />
        </RadioGroup>
      </fieldset>
    </div>
  );
}

export function RadioDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <RadioGroup>
        <Radio name="rd" value="Enabled" defaultChecked />
        <Radio name="rd" value="Disabled" disabled />
      </RadioGroup>
    </div>
  );
}

export function RadioInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <RadioGroup>
        <Radio name="ri" value="Invalid" invalid />
      </RadioGroup>
    </div>
  );
}

export function RadioRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <RadioGroup>
        <Radio name="rr" value="RTL" defaultChecked />
        <Radio name="rr" value="RTL 2" />
      </RadioGroup>
    </div>
  );
}
