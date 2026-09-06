"use client";

import * as React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  type SheetSide,
} from "@workspace/ui/components/sheet";

function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      {children}
    </div>
  );
}

function SheetBody({ title = "Notifications", body = "You have 3 unread messages from the team." }: { title?: string; body?: string }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{body}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-2 py-2">
        {["Deploy succeeded", "New comment", "Invite accepted"].map((item) => (
          <div key={item} className="rounded-lg border border-border/60 px-3 py-2 text-sm">
            {item}
          </div>
        ))}
      </div>
      <SheetFooter>
        <SheetClose className="h-9 rounded-lg border border-border px-4 text-sm font-medium">
          Dismiss
        </SheetClose>
      </SheetFooter>
    </>
  );
}

const SIDES: SheetSide[] = ["top", "right", "bottom", "left"];

export function SideSheetDemo() {
  return (
    <DemoShell>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SIDES.map((side) => (
          <Sheet key={side}>
            <SheetTrigger className="h-9 rounded-lg border border-border px-4 text-sm font-medium capitalize transition-colors hover:bg-accent">
              {side}
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetBody />
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </DemoShell>
  );
}

export function NoCloseButtonDemo() {
  return (
    <DemoShell>
      <Sheet>
        <SheetTrigger className="h-9 rounded-lg bg-foreground px-4 text-sm font-medium text-background">
          Open without X
        </SheetTrigger>
        <SheetContent side="right" showCloseButton={false}>
          <SheetBody title="Custom chrome" body="The corner X is gone — close from the footer or overlay." />
        </SheetContent>
      </Sheet>
    </DemoShell>
  );
}

export function RtlSheetDemo() {
  return (
    <DemoShell>
      <div dir="rtl">
        <Sheet>
          <SheetTrigger className="h-9 rounded-lg border border-border px-4 text-sm font-medium">
            فتح اللوحة
          </SheetTrigger>
          <SheetContent side="right" dir="rtl">
            <SheetBody title="التنبيهات" body="لديك ٣ رسائل غير مقروءة." />
          </SheetContent>
        </Sheet>
      </div>
    </DemoShell>
  );
}
