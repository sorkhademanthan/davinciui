"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, Search, X } from "lucide-react";
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

export function InputVariantsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <Input placeholder="Default" defaultValue="Default" />
        <Input variant="filled" placeholder="Filled" defaultValue="Filled" />
        <Input variant="ghost" placeholder="Ghost" defaultValue="Ghost" />
        <Input variant="underline" placeholder="Underline" defaultValue="Underline" />
      </div>
    </div>
  );
}

export function InputSizesPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <Input size="sm" placeholder="Small" defaultValue="Small" />
        <Input placeholder="Default" defaultValue="Default" />
        <Input size="lg" placeholder="Large" defaultValue="Large" />
      </div>
    </div>
  );
}

export function InputSearchPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" placeholder="Search…" inputClassName="ps-9" />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 font-mono text-[11px] text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

export function InputPasswordPreview() {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative w-full max-w-sm">
        <Input
          type={visible ? "text" : "password"}
          placeholder="Password"
          defaultValue="hunter2-hunter2"
          inputClassName="pe-9"
          aria-label="Password"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export function InputClearablePreview() {
  const [value, setValue] = React.useState("Ada Lovelace");
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative w-full max-w-sm">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Clearable"
          inputClassName={value ? "pe-9" : undefined}
          aria-label="Clearable"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear input"
            className="absolute right-1 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

export function InputLoadingPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="relative w-full max-w-sm">
        <Input placeholder="Loading…" disabled inputClassName="pe-9" aria-label="Loading" />
        <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}

export function InputTypesPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-3">
        <Input type="email" placeholder="email@example.com" autoComplete="email" aria-label="Email" />
        <div className="grid grid-cols-2 gap-3">
          <Input type="number" placeholder="42" inputMode="decimal" aria-label="Number" />
          <Input type="date" aria-label="Date" />
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
      <div className="w-full max-w-sm space-y-2">
        <Input invalid placeholder="Invalid" defaultValue="Wrong value" aria-describedby="input-invalid-hint" />
        <p id="input-invalid-hint" role="alert" className="text-xs font-medium text-destructive">
          This field is required.
        </p>
      </div>
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
        <Input placeholder="With badge" inputClassName="pe-14" />
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
        <Input placeholder="Button Group" unstyled className="rounded-none" />
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
      <form className="w-full max-w-sm space-y-4 p-4 border rounded-lg" onSubmit={(e) => e.preventDefault()}>
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
