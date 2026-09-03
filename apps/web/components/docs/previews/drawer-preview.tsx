"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

export function DrawerPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function DrawerScrollablePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Scrollable content</Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="shrink-0 border-b">
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>Keep actions visible while the content scrolls.</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid gap-2">
                <Label htmlFor={`d-field-${i}`}>Field {i + 1}</Label>
                <Input id={`d-field-${i}`} placeholder={`Value ${i + 1}`} />
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Scrollable body with sticky header/footer. Content overflows and footer stays pinned.
            </p>
          </div>
          <DrawerFooter className="shrink-0 border-t bg-background">
            <Button>Save changes</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function DrawerSidePreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 p-8">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Drawer key={side} direction={side}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="capitalize">
              {side}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="capitalize">{side} drawer</DrawerTitle>
              <DrawerDescription>direction=&quot;{side}&quot;</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}

function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = React.useState(defaultValue);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = () => setMatches(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function DrawerResponsivePreview() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Button variant="outline" disabled>
          Loading…
        </Button>
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Responsive — Dialog on desktop</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responsive dialog</DialogTitle>
              <DialogDescription>Renders as Dialog on desktop and Drawer on mobile.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="r-name">Name</Label>
              <Input id="r-name" placeholder="Enter name" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => setOpen(false)}>Save</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Responsive — Drawer on mobile</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Responsive drawer</DrawerTitle>
            <DrawerDescription>Same content, drawer on small screens.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid gap-2">
              <Label htmlFor="r-name-m">Name</Label>
              <Input id="r-name-m" placeholder="Enter name" />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Save</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function DrawerRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button variant="outline">فتح الدرج</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>هل أنت متأكد؟</DrawerTitle>
            <DrawerDescription>لا يمكن التراجع عن هذا الإجراء.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>متابعة</Button>
            <DrawerClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
