"use client";

import { Checkbox, CheckboxGroup } from "@workspace/ui/components/checkbox";
import { Label } from "@workspace/ui/components/label";

export function CheckboxPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Checkbox id="check-basic" />
        <Label htmlFor="check-basic">Accept terms</Label>
      </div>
    </div>
  );
}

export function CheckboxCheckedPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked id="check-checked" />
        <Label htmlFor="check-checked">Checked</Label>
      </div>
    </div>
  );
}

export function CheckboxInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Checkbox invalid id="check-invalid" />
        <Label htmlFor="check-invalid">Invalid</Label>
      </div>
    </div>
  );
}

export function CheckboxDescriptionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Checkbox id="check-desc" />
          <Label htmlFor="check-desc">With description</Label>
        </div>
        <p className="text-xs text-muted-foreground ml-7">This is a description for the checkbox.</p>
      </div>
    </div>
  );
}

export function CheckboxDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Checkbox disabled id="check-disabled" />
        <Label htmlFor="check-disabled" className="opacity-50">
          Disabled
        </Label>
      </div>
    </div>
  );
}

export function CheckboxGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <CheckboxGroup>
        <div className="flex items-center gap-2">
          <Checkbox id="g1" />
          <Label htmlFor="g1">Option 1</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="g2" />
          <Label htmlFor="g2">Option 2</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="g3" />
          <Label htmlFor="g3">Option 3</Label>
        </div>
      </CheckboxGroup>
    </div>
  );
}

export function CheckboxTablePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <table className="w-full max-w-sm border rounded-lg overflow-hidden text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 w-10">
              <Checkbox />
            </th>
            <th className="p-2 text-left">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2">
              <Checkbox />
            </td>
            <td className="p-2">Row 1</td>
          </tr>
          <tr className="border-t">
            <td className="p-2">
              <Checkbox />
            </td>
            <td className="p-2">Row 2</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CheckboxRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <div className="flex items-center gap-2">
        <Checkbox id="check-rtl" />
        <Label htmlFor="check-rtl">RTL</Label>
      </div>
    </div>
  );
}
