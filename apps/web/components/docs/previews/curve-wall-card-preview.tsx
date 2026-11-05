"use client";

import { curveWallDemoItems } from "@/components/docs/previews/curve-wall-items";
import { CurveWall } from "@workspace/ui/components/curve-wall";

export function CurveWallCardPreview() {
  return (
    <CurveWall
      items={curveWallDemoItems.slice(1, 13)}
      columns={4}
      gap={8}
      radius={5}
      fit="contain"
      wander={10}
      className="h-full min-h-0"
      ariaLabel="Curve wall preview"
      interactive={false}
    />
  );
}
