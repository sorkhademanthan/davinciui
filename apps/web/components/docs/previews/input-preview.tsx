"use client";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";

export function InputPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Input placeholder="Enter text" className="max-w-sm" />
    </div>
  );
}

export function InputFieldPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Label htmlFor="field">Field Label</Label>
        <Input id="field" placeholder="Field input" />
      </div>
    </div>
  );
}

export function InputFieldGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input placeholder="Doe" />
        </div>
      </div>
    </div>
  );
}

export function InputDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Input disabled placeholder="Disabled" className="max-w-sm" />
    </div>
  );
}

export function InputInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Input aria-invalid placeholder="Invalid" defaultValue="Wrong value" className="max-w-sm" />
    </div>
  );
}

export function InputFilePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Input type="file" className="max-w-sm" />
    </div>
  );
}

export function InputInlinePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex gap-2 max-w-sm w-full">
        <Input placeholder="Inline" className="flex-1" />
        <Button>Go</Button>
      </div>
    </div>
  );
}

export function InputGridPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="grid grid-cols-2 gap-4 max-w-sm w-full">
        <Input placeholder="Grid 1" />
        <Input placeholder="Grid 2" />
        <Input placeholder="Grid 3" />
        <Input placeholder="Grid 4" />
      </div>
    </div>
  );
}

export function InputRequiredPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-2">
        <Label>
          Required <span className="text-destructive">*</span>
        </Label>
        <Input required placeholder="Required" />
      </div>
    </div>
  );
}

export function InputBadgePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative max-w-sm w-full">
        <Input placeholder="With badge" />
        <Badge className="absolute right-1 top-1/2 -translate-y-1/2 h-5 px-1.5 text-xs">New</Badge>
      </div>
    </div>
  );
}

export function InputGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex max-w-sm w-full">
        <Input placeholder="Input Group" className="rounded-r-none" />
        <Button className="rounded-l-none border-l-0">Search</Button>
      </div>
    </div>
  );
}

export function InputButtonGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="inline-flex rounded-lg border overflow-hidden max-w-sm w-full">
        <Button variant="outline" className="rounded-none border-0 border-r">
          A
        </Button>
        <Input placeholder="Button Group" className="border-0 rounded-none shadow-none" />
        <Button variant="outline" className="rounded-none border-0 border-l">
          B
        </Button>
      </div>
    </div>
  );
}

export function InputFormPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <form className="w-full max-w-sm space-y-4 p-4 border rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="form-input">Email</Label>
          <Input id="form-input" type="email" placeholder="email@example.com" />
        </div>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
}

export function InputRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Input placeholder="نص عربي" className="max-w-sm" />
    </div>
  );
}
