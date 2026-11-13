"use client";

import * as React from "react";
import { PreloaderProV4 } from "@workspace/ui/components/preloader-pro-v4";

const DESIGN_WIDTH = 1465;
const DESIGN_HEIGHT = 750;

export function PreloaderProV4CardPreview() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;
    const update = () => {
      setScale(host.getBoundingClientRect().width / DESIGN_WIDTH);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 overflow-hidden bg-[#F3EFE7] dark:bg-[#0F0F0F]"
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <PreloaderProV4 preview previewTime={2.2} />
      </div>
    </div>
  );
}
