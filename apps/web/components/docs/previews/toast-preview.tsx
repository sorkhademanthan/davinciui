"use client";

import { Button } from "@workspace/ui/components/button";
import { Toaster, toast, toastPromise } from "@workspace/ui/components/toast";

export function ToastPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8 gap-4">
      <Toaster />
      <Button onClick={() => toast("Hello!", { description: "This is a toast." })}>Show Toast</Button>
    </div>
  );
}

export function ToastTypesPreview() {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 p-8">
      <Toaster />
      <Button variant="outline" onClick={() => toast("Default", { type: "default" })}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast("Success!", { type: "success" })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast("Error!", { type: "error" })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast("Info", { type: "info" })}>
        Info
      </Button>
    </div>
  );
}

export function ToastActionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toaster />
      <Button
        onClick={() =>
          toast("Action required", {
            description: "Click action to undo.",
            action: <Button size="sm" onClick={() => toast("Undone", { type: "success" })}>Undo</Button>,
          })
        }
      >
        With Action
      </Button>
    </div>
  );
}

export function ToastPromisePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Toaster />
      <Button
        onClick={() => {
          const p = new Promise((res) => setTimeout(res, 1000));
          toastPromise(p, { loading: "Loading...", success: "Success!", error: "Error!" });
        }}
      >
        Promise
      </Button>
    </div>
  );
}
