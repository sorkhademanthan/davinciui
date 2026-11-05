"use client";

import { EditorialImageStack } from "@workspace/ui/components/editorial-image-stack";
import {
  editorialImageStackBackgroundItems,
  editorialImageStackForegroundItems,
} from "@/components/docs/previews/editorial-image-stack-items";

export function EditorialImageStackCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e5e5e5] dark:bg-[#151515]">
      <EditorialImageStack
        backgroundImages={editorialImageStackBackgroundItems}
        foregroundImages={editorialImageStackForegroundItems}
        className="h-full min-h-0"
        ariaLabel="Editorial image stack preview"
      />
    </div>
  );
}
