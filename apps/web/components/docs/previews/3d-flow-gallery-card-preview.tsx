"use client";

import {
  FlowGallery,
  FLOW_GALLERY_DEFAULT_IMAGES,
} from "@workspace/ui/components/3d-flow-gallery";

/**
 * Live miniature for the component gallery card. Wheel input is disabled so
 * the card never hijacks page scroll; drag still works.
 */
export function FlowGalleryCardPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <FlowGallery
        images={FLOW_GALLERY_DEFAULT_IMAGES}
        autoSpeed={1.4}
        wheelSensitivity={0}
        borderRadius={10}
        className="h-full w-full"
        ariaLabel="3D flow gallery preview"
      />
    </div>
  );
}
