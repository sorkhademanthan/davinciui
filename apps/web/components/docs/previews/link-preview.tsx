"use client";

import { Link } from "@workspace/ui/components/link";
import { ArrowUpRight } from "lucide-react";

export function LinkPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Link href="#">Default Link</Link>
    </div>
  );
}

export function LinkMutedPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Link href="#" variant="muted">
        Muted Link
      </Link>
    </div>
  );
}

export function LinkUnderlinePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Link href="#" variant="underline">
        Underline Link
      </Link>
    </div>
  );
}

export function LinkWithIconPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Link href="#">
        Visit docs <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function LinkSizesPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-8">
      <Link href="#" size="sm">
        Small
      </Link>
      <Link href="#">Default</Link>
      <Link href="#" size="lg">
        Large
      </Link>
    </div>
  );
}

export function LinkRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Link href="#">رابط</Link>
    </div>
  );
}
