import * as React from "react";
import { createRoot } from "react-dom/client";
import CrumpledPaperReveal from "../CrumpledPaperReveal";

/* -----------------------------------------------------------------------------
 * Reduced-motion emulation
 * The component reads prefers-reduced-motion through matchMedia. We replace
 * just that query so the demo control strip can toggle it without changing the
 * OS setting.
 * ---------------------------------------------------------------------------*/
let reducedMotion = false;
const reducedMotionListeners = new Set<() => void>();
const nativeMatchMedia = window.matchMedia.bind(window);

window.matchMedia = ((query: string) => {
  if (!query.includes("prefers-reduced-motion")) return nativeMatchMedia(query);
  return {
    get matches() {
      return reducedMotion;
    },
    media: query,
    onchange: null,
    addEventListener(_type: string, listener: () => void) {
      reducedMotionListeners.add(listener);
    },
    removeEventListener(_type: string, listener: () => void) {
      reducedMotionListeners.delete(listener);
    },
    addListener(listener: () => void) {
      reducedMotionListeners.add(listener);
    },
    removeListener(listener: () => void) {
      reducedMotionListeners.delete(listener);
    },
    dispatchEvent() {
      return true;
    },
  } as unknown as MediaQueryList;
}) as typeof window.matchMedia;

function setDemoReducedMotion(value: boolean): void {
  reducedMotion = value;
  reducedMotionListeners.forEach((listener) => listener());
}

/* -----------------------------------------------------------------------------
 * RAF / FPS instrumentation
 * ---------------------------------------------------------------------------*/
const nativeRaf = window.requestAnimationFrame.bind(window);
let rafCalls = 0;
let lastFrameTime = 0;
let smoothedFps = 60;

window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
  rafCalls += 1;
  return nativeRaf((ts) => {
    if (ts !== lastFrameTime) {
      if (lastFrameTime > 0) {
        smoothedFps = smoothedFps * 0.9 + (1000 / Math.max(1, ts - lastFrameTime)) * 0.1;
      }
      lastFrameTime = ts;
    }
    callback(ts);
  });
}) as typeof window.requestAnimationFrame;

/* -----------------------------------------------------------------------------
 * Procedural test images
 * ---------------------------------------------------------------------------*/
function paperBase(ctx: CanvasRenderingContext2D, width: number, height: number, top: string, bottom: string): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function grain(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number): void {
  let state = seed;
  const rand = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(90, 74, 52, ${0.015 + rand() * 0.03})`;
    ctx.fillRect(rand() * width, rand() * height, 1.2, 1.2);
  }
}

function makeHandwrittenLetter(): string {
  const width = 1000;
  const height = 1250;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  paperBase(ctx, width, height, "#fcf7ea", "#f0e6d2");
  grain(ctx, width, height, 11);

  ctx.strokeStyle = "rgba(120, 104, 80, 0.08)";
  ctx.lineWidth = 1;
  for (let y = 210; y < 1120; y += 72) {
    ctx.beginPath();
    ctx.moveTo(96, y);
    ctx.lineTo(width - 96, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#2B3A5B";
  ctx.font = "54px 'Snell Roundhand', 'Brush Script MT', 'Segoe Script', cursive";
  ctx.textBaseline = "alphabetic";
  const body = [
    "My dearest,",
    "The city has been quiet this week.",
    "I keep the window open and listen",
    "for the harbour bell. Come find me",
    "when the light turns gold.",
  ];
  body.forEach((line, index) => {
    ctx.save();
    ctx.translate(120, 300 + index * 96);
    ctx.rotate((index % 2 === 0 ? -1 : 1) * 0.004);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });

  ctx.font = "58px 'Snell Roundhand', 'Brush Script MT', 'Segoe Script', cursive";
  ctx.fillStyle = "rgba(43, 58, 91, 0.85)";
  ctx.save();
  ctx.translate(600, 1080);
  ctx.rotate(-0.03);
  ctx.fillText("Yours, A.", 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function ridge(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  amplitude: number,
  color: string,
  seed: number
): void {
  let state = seed;
  const rand = (): number => {
    state = (state * 1103515245 + 12345) >>> 0;
    return state / 4294967296;
  };
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, baseY + amplitude);
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const peak = baseY - amplitude * (0.35 + rand() * 0.65);
    ctx.lineTo(x, peak);
    if (i < steps) ctx.lineTo(x + width / steps / 2, peak + amplitude * 0.35);
  }
  ctx.lineTo(width, baseY + amplitude);
  ctx.closePath();
  ctx.fill();
}

function makePhotoPrint(): string {
  const width = 1000;
  const height = 1250;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  ctx.fillStyle = "#fbfaf6";
  ctx.fillRect(0, 0, width, height);

  const left = width * 0.05;
  const right = width * 0.95;
  const top = width * 0.05;
  const bottom = height - width * 0.14;
  const photoW = right - left;
  const photoH = bottom - top;

  const sky = ctx.createLinearGradient(0, top, 0, bottom);
  sky.addColorStop(0, "#cfe4f2");
  sky.addColorStop(0.55, "#e8edf0");
  sky.addColorStop(1, "#f6e5cd");
  ctx.fillStyle = sky;
  ctx.fillRect(left, top, photoW, photoH);

  const colors = ["#b7d0e2", "#8fb3cc", "#6a92b3", "#4a7195", "#2f5478", "#223f5f"];
  ctx.save();
  ctx.translate(left, top);
  ctx.beginPath();
  ctx.rect(0, 0, photoW, photoH);
  ctx.clip();
  colors.forEach((color, index) => {
    const baseY = photoH * (0.28 + index * 0.115);
    ridge(ctx, photoW, baseY, photoH * (0.16 - index * 0.012), color, 31 + index * 7);
  });
  ctx.restore();

  ctx.fillStyle = "rgba(30, 52, 76, 0.9)";
  ctx.font = "44px 'Snell Roundhand', 'Brush Script MT', cursive";
  ctx.textAlign = "left";
  ctx.fillText("the harbour, early spring", left, height - width * 0.05);

  return canvas.toDataURL("image/png");
}

function makeTypedLetter(): string {
  const width = 1000;
  const height = 1250;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  paperBase(ctx, width, height, "#faf7ef", "#efe9da");
  grain(ctx, width, height, 53);

  ctx.fillStyle = "#282d33";
  ctx.textAlign = "center";
  ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
  ctx.fillText("THE HARBOR PRESS", width / 2, 130);
  ctx.font = "22px 'Courier New', monospace";
  ctx.fillStyle = "rgba(40, 45, 51, 0.7)";
  ctx.fillText("14 Quay Street · Est. 1904", width / 2, 168);
  ctx.strokeStyle = "rgba(40, 45, 51, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 200);
  ctx.lineTo(width - 90, 200);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#30343a";
  ctx.font = "28px 'Courier New', monospace";
  const lines = [
    "12 March",
    "",
    "Dear Sir,",
    "",
    "We have received your manuscript and",
    "the accompanying plates. The press is",
    "scheduled to run the first proofs on",
    "Friday next. Please call at the office",
    "before noon if you wish to review the",
    "colour separation in person.",
    "",
    "With thanks,",
    "E. Marsh",
  ];
  lines.forEach((line, index) => {
    ctx.fillText(line, 96, 290 + index * 46);
  });

  ctx.save();
  ctx.translate(width - 320, height - 300);
  ctx.rotate(-0.16);
  ctx.strokeStyle = "rgba(178, 45, 42, 0.85)";
  ctx.lineWidth = 7;
  ctx.strokeRect(0, 0, 250, 110);
  ctx.fillStyle = "rgba(178, 45, 42, 0.85)";
  ctx.font = "bold 46px 'Courier New', monospace";
  ctx.fillText("RECEIVED", 18, 62);
  ctx.font = "22px 'Courier New', monospace";
  ctx.fillText("14 MAR 1904", 18, 92);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

const IMAGES = {
  letter: makeHandwrittenLetter(),
  photo: makePhotoPrint(),
  typed: makeTypedLetter(),
};

// Dev flags for verifying edge cases from the checklist.
const PARAMS = new URLSearchParams(window.location.search);
const NO_LINK = PARAMS.get("nolink") === "1";
const BROKEN_IMAGE = PARAMS.get("broken") === "1";
const BROKEN_SRC = new URL("missing-image.png", window.location.href).href;

/* -----------------------------------------------------------------------------
 * Demo UI
 * ---------------------------------------------------------------------------*/
type Trigger = "hover" | "click" | "inView" | "scroll";
type ShapeName =
  | "Sphere"
  | "Tight Wad"
  | "Loose Wad"
  | "Egg"
  | "Pebble"
  | "Pillow"
  | "Cube"
  | "Shard"
  | "Cone"
  | "Disc"
  | "Twist"
  | "Burst";
type FoldName = "none" | "half" | "thirds";
type FinishName = "matte" | "satin" | "gloss";
type AspectName = "1:1" | "4:5" | "3:4" | "4:3" | "3:2" | "16:9";

const SHAPES: ShapeName[] = [
  "Sphere",
  "Tight Wad",
  "Loose Wad",
  "Egg",
  "Pebble",
  "Pillow",
  "Cube",
  "Shard",
  "Cone",
  "Disc",
  "Twist",
  "Burst",
];

interface Item {
  key: string;
  image: string;
  alt: string;
  shape: ShapeName;
  fold: FoldName;
}

const BASE_ITEMS: Item[] = [
  { key: "letter", image: IMAGES.letter, alt: "Handwritten letter", shape: "Tight Wad", fold: "none" },
  { key: "photo", image: IMAGES.photo, alt: "Blue mountain photo print", shape: "Loose Wad", fold: "none" },
  { key: "typed", image: IMAGES.typed, alt: "Typewritten letter with received stamp", shape: "Egg", fold: "thirds" },
];

const EXTRA_SHAPES: ShapeName[] = ["Sphere", "Pebble", "Pillow", "Cube", "Shard", "Cone", "Disc", "Twist", "Burst"];

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.55 }}>{label}</span>
      {children}
    </label>
  );
}

const controlStyle: React.CSSProperties = {
  font: "13px ui-monospace, SFMono-Regular, Menlo, monospace",
  background: "rgba(255,255,255,0.65)",
  color: "#2b2a26",
  border: "1px solid rgba(80,70,55,0.22)",
  borderRadius: 7,
  padding: "7px 10px",
};

function App(): React.ReactElement {
  const [trigger, setTrigger] = React.useState<Trigger>("hover");
  const [shape, setShape] = React.useState<ShapeName>("Tight Wad");
  const [fold, setFold] = React.useState<FoldName>("none");
  const [finish, setFinish] = React.useState<FinishName>("matte");
  const [count, setCount] = React.useState<1 | 3 | 6>(3);
  const [reduced, setReduced] = React.useState(false);
  const [replay, setReplay] = React.useState(false);
  const [stats, setStats] = React.useState({ fps: 60, raf: 0 });

  const dev = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const rawAspect = params.get("aspect");
    const aspects: AspectName[] = ["1:1", "4:5", "3:4", "4:3", "3:2", "16:9"];
    const aspect = aspects.find((value) => value === rawAspect) ?? "4:5";
    const margin = Math.max(0, Math.min(80, Number(params.get("margin")) || 0));
    const [fx, fy] = (params.get("focal") ?? "50,50").split(",").map((value) => Number(value));
    return {
      aspect,
      margin,
      focalX: Number.isFinite(fx) ? fx : 50,
      focalY: Number.isFinite(fy) ? fy : 50,
    };
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const raf = rafCalls;
      const fps = raf > 0 ? Math.min(120, Math.round(smoothedFps)) : 0;
      setStats({ fps, raf });
      rafCalls = 0;
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  const items = React.useMemo<Item[]>(() => {
    const base = BASE_ITEMS.map((item, index) => ({
      ...item,
      image: BROKEN_IMAGE && index === 0 ? BROKEN_SRC : item.image,
      shape: index === 0 ? shape : item.shape,
      fold: item.fold === "thirds" && fold === "none" ? "thirds" : fold,
    }));
    if (count === 3) return base;
    if (count === 1) return base.slice(0, 1);
    return [
      ...base,
      ...base.map((item, index) => ({
        ...item,
        key: `${item.key}-b`,
        shape: EXTRA_SHAPES[index % EXTRA_SHAPES.length] ?? "Twist",
      })),
    ];
  }, [count, shape, fold]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgb(230,225,216)",
        color: "#2b2a26",
        font: "14px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        padding: "32px 28px 80px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ maxWidth: 1360, margin: "0 auto 26px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.55 }}>
              Framer code component · local demo
            </div>
            <h1 style={{ margin: "6px 0 0", font: "600 30px/1.1 Georgia, 'Times New Roman', serif", letterSpacing: "-0.01em" }}>
              Crumpled Paper Reveal
            </h1>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", font: "12px ui-monospace, monospace", opacity: 0.7 }}>
            <span>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: stats.raf > 0 ? "#3f8f5a" : "#a09a8d", marginRight: 6 }} />
              RAF {stats.raf} calls/s
            </span>
            <span>{stats.fps} fps</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.35)",
            border: "1px solid rgba(80,70,55,0.16)",
            borderRadius: 12,
          }}
        >
          <Field label="Trigger">
            <select style={controlStyle} value={trigger} onChange={(e) => setTrigger(e.target.value as Trigger)}>
              <option value="hover">hover</option>
              <option value="click">click</option>
              <option value="inView">inView</option>
              <option value="scroll">scroll</option>
            </select>
          </Field>
          <Field label="Shape">
            <select style={controlStyle} value={shape} onChange={(e) => setShape(e.target.value as ShapeName)}>
              {SHAPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fold">
            <select style={controlStyle} value={fold} onChange={(e) => setFold(e.target.value as FoldName)}>
              <option value="none">none</option>
              <option value="half">half</option>
              <option value="thirds">thirds</option>
            </select>
          </Field>
          <Field label="Finish">
            <select style={controlStyle} value={finish} onChange={(e) => setFinish(e.target.value as FinishName)}>
              <option value="matte">matte</option>
              <option value="satin">satin</option>
              <option value="gloss">gloss</option>
            </select>
          </Field>
          <Field label="Instances">
            <select
              style={controlStyle}
              value={count}
              onChange={(e) => {
                const next = Number(e.target.value);
                setCount(next === 6 ? 6 : next === 1 ? 1 : 3);
              }}
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={6}>6</option>
            </select>
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, paddingBottom: 8 }}>
            <input type="checkbox" checked={replay} onChange={(e) => setReplay(e.target.checked)} />
            Replay
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, paddingBottom: 8 }}>
            <input
              type="checkbox"
              checked={reduced}
              onChange={(e) => {
                setReduced(e.target.checked);
                setDemoReducedMotion(e.target.checked);
              }}
            />
            Reduced motion
          </label>
          <a
            href="?canvas=1"
            style={{ marginLeft: "auto", fontSize: 12, color: "#3c5a7a", textDecoration: "underline", paddingBottom: 8 }}
          >
            Open static canvas view
          </a>
        </div>
      </header>

      {trigger === "scroll" && <div style={{ height: "62vh" }} />}
      <main
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 28,
        }}
      >
        {items.map((item) => (
          <div key={item.key} style={{ width: "100%", maxWidth: 400 }}>
            <CrumpledPaperReveal
              image={{ src: item.image }}
              alt={item.alt}
              trigger={trigger}
              replay={replay}
              shape={item.shape}
              fold={item.fold}
              finish={finish}
              aspect={dev.aspect}
              margin={dev.margin}
              focalX={dev.focalX}
              focalY={dev.focalY}
              link={NO_LINK ? undefined : "https://example.com"}
              duration={1}
              easing="Springy"
              shadow={0.5}
              curl={0.3}
            />
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.55 }}>
              <span>{item.alt}</span>
              <span>{item.shape}</span>
            </div>
          </div>
        ))}
      </main>
      <div style={{ height: "52vh" }} />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
