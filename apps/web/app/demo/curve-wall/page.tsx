"use client";

import { curveWallDemoItems } from "@/components/docs/previews/curve-wall-items";
import { CurveWall } from "@workspace/ui/components/curve-wall";

export default function CurveWallDemoPage() {
  return (
    <main className="h-[100svh] w-full bg-background">
      <CurveWall
        items={curveWallDemoItems}
        fit="contain"
        ariaLabel="CMS curve media wall"
      />
    </main>
  );
}
