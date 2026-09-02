"use client";

import { Select, SelectItem, SelectGroup } from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";

export function SelectPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Select defaultValue="apple" className="max-w-sm">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="orange">Orange</option>
      </Select>
    </div>
  );
}

export function SelectCompositionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Label>Composition</Label>
        <Select defaultValue="1">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      </div>
    </div>
  );
}

export function SelectAlignPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Select defaultValue="center" className="max-w-sm">
        <option value="start">Align Start</option>
        <option value="center">Align Center (Trigger)</option>
        <option value="end">Align End</option>
      </Select>
    </div>
  );
}

export function SelectGroupsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Select defaultValue="apple" className="max-w-sm">
        <optgroup label="Fruits">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </optgroup>
        <optgroup label="Vegetables">
          <option value="carrot">Carrot</option>
          <option value="potato">Potato</option>
        </optgroup>
      </Select>
    </div>
  );
}

export function SelectScrollablePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Select defaultValue="1" className="max-w-sm">
        {Array.from({ length: 20 }).map((_, i) => (
          <option key={i} value={`${i}`}>
            Item {i + 1}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function SelectDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Select disabled defaultValue="apple" className="max-w-sm">
        <option value="apple">Apple (Disabled)</option>
      </Select>
    </div>
  );
}

export function SelectInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Select invalid defaultValue="" className="max-w-sm">
        <option value="" disabled>
          Select invalid
        </option>
        <option value="apple">Apple</option>
      </Select>
    </div>
  );
}

export function SelectRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Select defaultValue="apple" className="max-w-sm">
        <option value="apple">تفاحة</option>
        <option value="banana">موز</option>
      </Select>
    </div>
  );
}
