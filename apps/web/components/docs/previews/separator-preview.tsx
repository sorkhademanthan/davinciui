"use client";

import * as React from "react";
import { Separator } from "@workspace/ui/components/separator";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function SeparatorBasicPreview() {
  return (
    <DemoShell>
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-sm font-medium">DavinciUI</h4>
          <p className="text-sm text-muted-foreground">Beautifully designed components.</p>
        </div>
        <Separator />
        <div className="flex items-center gap-4 text-sm">
          <span>Blog</span>
          <span>Docs</span>
          <span>Source</span>
        </div>
      </div>
    </DemoShell>
  );
}

export function SeparatorVerticalPreview() {
  return (
    <DemoShell readout='orientation="vertical" spans the row even with items-center'>
      <div className="flex h-24 items-center justify-center gap-4">
        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium">Left panel</span>
          <span className="text-xs text-muted-foreground">Filters live here</span>
        </div>
        <Separator orientation="vertical" />
        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium">Right panel</span>
          <span className="text-xs text-muted-foreground">Results live here</span>
        </div>
      </div>
    </DemoShell>
  );
}

export function SeparatorMenuPreview() {
  return (
    <DemoShell readout="role=separator keeps menu sections perceivable">
      <div role="menu" aria-label="Account" className="w-full rounded-xl border bg-card p-1.5 shadow-sm">
        <div role="menuitem" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
          Profile
        </div>
        <div role="menuitem" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
          Billing
        </div>
        <Separator decorative={false} className="my-1.5" />
        <div role="menuitem" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
          Settings
        </div>
        <Separator decorative={false} className="my-1.5" />
        <div role="menuitem" className="rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent">
          Log out
        </div>
      </div>
    </DemoShell>
  );
}

export function SeparatorListPreview() {
  const people = [
    { name: "Ada Lovelace", detail: "Analytical Engine · 1843" },
    { name: "Grace Hopper", detail: "First compiler · 1952" },
    { name: "Margaret Hamilton", detail: "Apollo guidance · 1969" },
  ];
  return (
    <DemoShell>
      <ul className="w-full rounded-xl border bg-card">
        {people.map((person, i) => (
          <li key={person.name}>
            {i > 0 ? <Separator /> : null}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{person.name}</span>
              <span className="text-xs text-muted-foreground">{person.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </DemoShell>
  );
}

export function SeparatorLabelPreview() {
  return (
    <DemoShell readout="labeled divider via composition — no extra API">
      <div className="flex flex-col gap-5">
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Sign-in options"
          className="flex items-center gap-3 text-xs text-muted-foreground"
        >
          <Separator className="flex-1" />
          <span className="shrink-0 font-medium uppercase tracking-widest">or continue with</span>
          <Separator className="flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 flex-1 rounded-md border bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent"
          >
            GitHub
          </button>
          <button
            type="button"
            className="h-9 flex-1 rounded-md border bg-background text-sm font-medium shadow-xs transition-colors hover:bg-accent"
          >
            Google
          </button>
        </div>
      </div>
    </DemoShell>
  );
}

export function SeparatorRtlPreview() {  return (
    <DemoShell readout="dir=rtl · orientation is unaffected by direction">
      <div dir="rtl" className="flex flex-col gap-4">
        <p className="text-sm">لوحة التحكم الأولى</p>
        <Separator />
        <div className="flex h-16 items-stretch gap-3">
          <span className="flex items-center text-sm">الملف الشخصي</span>
          <Separator orientation="vertical" />
          <span className="flex items-center text-sm">الإعدادات</span>
          <Separator orientation="vertical" />
          <span className="flex items-center text-sm">تسجيل الخروج</span>
        </div>
      </div>
    </DemoShell>
  );
}
