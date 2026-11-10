import * as React from "react";
import { createRoot } from "react-dom/client";
import CurvedInlineType, {
  DEFAULT_LINES,
  DEFAULT_PROPS,
  computeLineState,
  formatLineTransform,
  normalizeAngle,
  progressToBaseAngle,
  type CurvedInlineTypeProps,
} from "../CurvedInlineType";

const params = new URLSearchParams(window.location.search);
const mapping: "live" | "spec" =
  params.get("mapping") === "spec" ? "spec" : "live";
const direction: "forward" | "reverse" =
  params.get("direction") === "reverse" ? "reverse" : "forward";
const showCaption = params.get("caption") !== "0";
const debug = params.get("debug") === "1";

declare global {
  interface Window {
    __curved: {
      computeLineState: typeof computeLineState;
      progressToBaseAngle: typeof progressToBaseAngle;
      formatLineTransform: typeof formatLineTransform;
      normalizeAngle: typeof normalizeAngle;
      DEFAULT_LINES: typeof DEFAULT_LINES;
      DEFAULT_PROPS: typeof DEFAULT_PROPS;
      getProgress: () => number;
      getBaseAngle: () => number;
      getStates: () => Array<{
        index: number;
        text: string;
        transform: string;
        opacity: string;
        filter: string;
        front: number;
        y: number;
        z: number;
      }>;
      scrollToProgress: (progress: number) => void;
      setProps: (next: Partial<CurvedInlineTypeProps>) => void;
    };
  }
}

function readProgress(): number {
  const track = document.querySelector<HTMLElement>("[data-curved-track]");
  if (!track) return 0;
  const rect = track.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, -rect.top / travel));
}

function scrollToProgress(progress: number) {
  const track = document.querySelector<HTMLElement>("[data-curved-track]");
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const top = window.scrollY + rect.top;
  const travel = rect.height - window.innerHeight;
  window.scrollTo({ top: top + Math.min(1, Math.max(0, progress)) * travel, behavior: "instant" });
}

window.__curved = {
  computeLineState,
  progressToBaseAngle,
  formatLineTransform,
  normalizeAngle,
  DEFAULT_LINES,
  DEFAULT_PROPS,
  getProgress: readProgress,
  getBaseAngle: () =>
    progressToBaseAngle(readProgress(), {
      mapping,
      direction,
      sweepDeg: DEFAULT_PROPS.sweepDeg,
      sweepFrom: DEFAULT_PROPS.sweepFrom,
      sweepTo: DEFAULT_PROPS.sweepTo,
    }),
  getStates: () => {
    const track = document.querySelector<HTMLElement>("[data-curved-track]");
    const ring = track?.querySelector<HTMLElement>("[data-curved-ring]");
    if (!ring) return [];
    return Array.from(ring.children).map((node, index) => {
      const element = node as HTMLElement;
      const row = element.firstElementChild as HTMLElement | null;
      const text = element.innerText.replace(/\n/g, " ").trim();
      const match = element.style.transform.match(
        /\* (-?[\d.]+)\), calc\(var\(--orrery-reach\) \* (-?[\d.]+)\)\) rotateX\((-?[\d.]+)deg/,
      );
      const y = match ? Number(match[1]) : 0;
      const z = match ? Number(match[2]) : 0;
      return {
        index,
        text,
        transform: element.style.transform,
        opacity: element.style.opacity,
        filter: row?.style.filter ?? "",
        front: (z + 1) / 2,
        y,
        z,
      };
    });
  },
  scrollToProgress,
  setProps: () => {},
};

function App() {
  const [mappingMode, setMappingMode] = React.useState(mapping);
  const [directionMode, setDirectionMode] = React.useState(direction);

  React.useEffect(() => {
    if (params.get("p")) {
      const p = Number(params.get("p"));
      if (Number.isFinite(p)) {
        window.requestAnimationFrame(() => scrollToProgress(p));
      }
    }
  }, []);

  return (
    <>
      <CurvedInlineType
        lines={DEFAULT_LINES}
        mapping={mappingMode}
        direction={directionMode}
        showCaption={showCaption}
      />
      {debug ? (
        <div className="debug">
          <label>
            mapping
            <select
              value={mappingMode}
              onChange={(event) =>
                setMappingMode(event.target.value as "live" | "spec")
              }
            >
              <option value="live">live</option>
              <option value="spec">spec</option>
            </select>
          </label>
          <label>
            direction
            <select
              value={directionMode}
              onChange={(event) =>
                setDirectionMode(event.target.value as "forward" | "reverse")
              }
            >
              <option value="forward">forward</option>
              <option value="reverse">reverse</option>
            </select>
          </label>
          <span id="debug-readout" />
        </div>
      ) : null}
    </>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}

if (debug) {
  window.setInterval(() => {
    const node = document.getElementById("debug-readout");
    if (!node) return;
    node.textContent = `p=${readProgress().toFixed(4)} theta0=${window.__curved
      .getBaseAngle()
      .toFixed(2)}`;
  }, 120);
}
