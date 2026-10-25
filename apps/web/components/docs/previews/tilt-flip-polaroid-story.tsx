"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  TILT_FLIP_POLAROID_DEFAULT_BACK_TEXT,
  TiltFlipPolaroid,
} from "@workspace/ui/components/tilt-flip-polaroid";
import { cn } from "@/lib/utils";
import { tiltFlipPolaroidDemoImage } from "./tilt-flip-polaroid-preview";

export type TiltFlipPolaroidStory =
  | "default"
  | "flipped"
  | "notilt"
  | "long"
  | "reduced"
  | "controlled";

const LONG_BACK_TEXT = `jeju, april.
i wandered into this field alone and
just stood there for way too long.
closed my eyes, felt the wind,
thought about nothing.
brought myself flowers for once. ⚘

the light stayed soft until dinner,
and nobody called my name.
i kept the ticket stub in my pocket
so i could find this day again.`;

export function TiltFlipPolaroidStory({
  story = "default",
  className,
}: {
  story?: TiltFlipPolaroidStory;
  className?: string;
}) {
  if (story === "controlled") {
    return <ControlledStory className={className} />;
  }

  return (
    <StoryStage className={className}>
      {story === "reduced" ? (
        <p className="absolute left-4 top-4 max-w-56 text-xs leading-5 text-[#333]/65">
          Reduced-motion story. The card crossfades instead of rotating when the
          OS prefers reduced motion.
        </p>
      ) : null}
      <TiltFlipPolaroid
        image={tiltFlipPolaroidDemoImage}
        backText={
          story === "long" ? LONG_BACK_TEXT : TILT_FLIP_POLAROID_DEFAULT_BACK_TEXT
        }
        defaultFlipped={story === "flipped"}
        tiltEnabled={story !== "notilt"}
      />
    </StoryStage>
  );
}

function ControlledStory({ className }: { className?: string }) {
  const [flipped, setFlipped] = React.useState(false);
  const [lastRequest, setLastRequest] = React.useState<string>("none");

  return (
    <StoryStage className={className}>
      <div className="flex flex-col items-center gap-6">
        <TiltFlipPolaroid
          image={tiltFlipPolaroidDemoImage}
          flipped={flipped}
          onFlippedChange={(next) => setLastRequest(String(next))}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFlipped(false)}
          >
            Set front
          </Button>
          <Button type="button" onClick={() => setFlipped(true)}>
            Set flipped
          </Button>
          <span
            className="text-xs text-[#333]/65"
            data-tfp-last-request={lastRequest}
          >
            request: {lastRequest}
          </span>
        </div>
      </div>
    </StoryStage>
  );
}

function StoryStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#FDF2F2] p-6",
        className,
      )}
    >
      {children}
    </main>
  );
}
