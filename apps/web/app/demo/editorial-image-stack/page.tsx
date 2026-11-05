import type { Metadata } from "next";
import {
  editorialImageStackBackgroundItems,
  editorialImageStackForegroundItems,
} from "@/components/docs/previews/editorial-image-stack-items";
import { EditorialImageStack } from "@workspace/ui/components/editorial-image-stack";

export const metadata: Metadata = {
  title: "Editorial Image Stack",
};

export default function EditorialImageStackDemoPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#e5e5e5] dark:bg-[#151515]">
      <EditorialImageStack
        backgroundImages={editorialImageStackBackgroundItems}
        foregroundImages={editorialImageStackForegroundItems}
        className="h-full min-h-0"
        ariaLabel="Editorial image stack demo"
      />
    </main>
  );
}
