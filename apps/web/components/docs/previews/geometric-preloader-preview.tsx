"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

export function GeometricPreloaderPreview({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [runId, setRunId] = React.useState(0);
  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      <iframe key={runId} src={src} className="h-full w-full border-0" title={title} />
      <button
        type="button"
        onClick={() => setRunId((id) => id + 1)}
        className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-zinc-950/90 px-3.5 py-2 text-xs font-medium text-white shadow-lg backdrop-blur transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        <RotateCcw className="size-3.5" /> Replay
      </button>
    </div>
  );
}
