"use client";

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";

export function AlertDialogPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AlertDialogSmallPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline">
            Small
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Small dialog</AlertDialogTitle>
            <AlertDialogDescription>Compact size.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction size="sm">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AlertDialogMediaPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Media</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center text-xl">⚠️</div>
          <AlertDialogHeader>
            <AlertDialogTitle>Media dialog</AlertDialogTitle>
            <AlertDialogDescription>With media illustration on top.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AlertDialogSmallMediaPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline">
            Small Media
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-sm">
          <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center">⚠️</div>
          <AlertDialogHeader>
            <AlertDialogTitle>Small + Media</AlertDialogTitle>
            <AlertDialogDescription>Compact with media.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction size="sm">Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AlertDialogDestructivePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Destructive</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AlertDialogRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">RTL</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction>متابعة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
