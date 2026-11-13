"use client";

import * as React from "react";
import { PreloaderProV5 } from "@workspace/ui/components/preloader-pro-v5";

const DESIGN_WIDTH = 1465;
const DESIGN_HEIGHT = 750;

export function PreloaderProV5CardPreview() {
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
      className="absolute inset-0 overflow-hidden bg-[#ECECEA] dark:bg-[#0B0B0A]"
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
        <PreloaderProV5 preview previewTime={5} />
      </div>
    </div>
  );
}