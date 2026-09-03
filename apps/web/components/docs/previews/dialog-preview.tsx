"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { X } from "lucide-react";

export function DialogPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DialogCustomClosePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Custom close</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Custom close button</DialogTitle>
            <DialogDescription>Replace the default close control with your own button.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
          <DialogClose className="absolute right-3 top-3 rounded-md p-1.5 opacity-60 hover:bg-accent hover:opacity-100">
            <X className="size-4" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DialogNoClosePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">No close button</Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>No close button</DialogTitle>
            <DialogDescription>Use showCloseButton={false} to hide the close button.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DialogStickyFooterPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Sticky footer</Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[80vh] flex-col p-0 sm:max-w-lg">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Keep actions visible while the content scrolls.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid gap-2">
                <Label htmlFor={`field-${i}`}>Field {i + 1}</Label>
                <Input id={`field-${i}`} placeholder={`Value ${i + 1}`} />
              </div>
            ))}
          </div>
          <DialogFooter className="border-t bg-background px-6 py-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DialogScrollablePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Scrollable content</Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scrollable content</DialogTitle>
            <DialogDescription>Long content can scroll while the header stays in view.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 -mr-1 flex-1 space-y-3 py-1 text-sm leading-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <p key={i} className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. {i + 1}
              </p>
            ))}
          </div>
          <DialogFooter className="pt-2">
            <Button>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DialogRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">فتح</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>هل أنت متأكد؟</DialogTitle>
            <DialogDescription>لا يمكن التراجع عن هذا الإجراء. سيتم حذف حسابك نهائياً.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button>متابعة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
