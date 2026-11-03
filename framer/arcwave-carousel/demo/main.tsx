import * as React from "react";
import { createRoot } from "react-dom/client";
import ArcwaveCarousel, {
  DEFAULT_SLIDES,
  buildRingSlides,
  computePitchDegrees,
  computePlate,
  type ArcwaveCarouselProps,
  type ArcwavePlateParams,
} from "../ArcwaveCarousel";

const nativeRaf = window.requestAnimationFrame.bind(window);
let rafCalls = 0;
window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
  rafCalls += 1;
  return nativeRaf(callback);
}) as typeof window.requestAnimationFrame;

/* -----------------------------------------------------------------------------
 * Milestone 1 golden values
 * All values are the section 4.4 measurements at cardWidth=168, gap=6.4,
 * radius=532 and carousel position 10.57. The ring has 20 slots.
 * ---------------------------------------------------------------------------*/

const GOLDEN_POSITION = 10.57;
const GOLDEN_CARD_WIDTH = 168;
const GOLDEN_GAP = 6.4;
const GOLDEN_RADIUS = 532;
const GOLDEN_PITCH = 18.783;

interface GoldenRow {
  slot: number;
  name: string;
  theta: number;
  x: number;
  z: number;
  rotateY: number;
  opacity: number;
  blur: number;
  zIndex: number;
  interactive: boolean;
  ariaHidden: boolean;
}

const GOLDEN_ROWS: GoldenRow[] = [
  {
    slot: 6,
    name: "Sofia",
    theta: -85.83,
    x: -530.6,
    z: -493.38,
    rotateY: -65,
    opacity: 0.0346,
    blur: 2.26,
    zIndex: 409,
    interactive: false,
    ariaHidden: true,
  },
  {
    slot: 7,
    name: "Amara",
    theta: -67.05,
    x: -489.9,
    z: -324.59,
    rotateY: -65,
    opacity: 0.5769,
    blur: 1.64,
    zIndex: 429,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 8,
    name: "Elias",
    theta: -48.27,
    x: -397.03,
    z: -177.9,
    rotateY: -48.271,
    opacity: 0.705,
    blur: 1.07,
    zIndex: 449,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 9,
    name: "Theo",
    theta: -29.49,
    x: -261.88,
    z: -68.92,
    rotateY: -29.489,
    opacity: 0.8198,
    blur: 0.56,
    zIndex: 469,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 10,
    name: "Mara",
    theta: -10.71,
    x: -98.83,
    z: -9.26,
    rotateY: -10.706,
    opacity: 0.9346,
    blur: 0.15,
    zIndex: 489,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 11,
    name: "Nora",
    theta: 8.08,
    x: 74.74,
    z: -5.28,
    rotateY: 8.077,
    opacity: 0.9506,
    blur: 0.1,
    zIndex: 491,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 12,
    name: "Julian",
    theta: 26.86,
    x: 240.36,
    z: -57.39,
    rotateY: 26.859,
    opacity: 0.8359,
    blur: 0.5,
    zIndex: 471,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 13,
    name: "Kai",
    theta: 45.64,
    x: 380.37,
    z: -160.06,
    rotateY: 45.642,
    opacity: 0.7211,
    blur: 0.99,
    zIndex: 451,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 14,
    name: "Iris",
    theta: 64.43,
    x: 479.87,
    z: -302.34,
    rotateY: 64.425,
    opacity: 0.6063,
    blur: 1.55,
    zIndex: 431,
    interactive: true,
    ariaHidden: false,
  },
  {
    slot: 15,
    name: "Lena",
    theta: 83.21,
    x: 528.27,
    z: -469.08,
    rotateY: 65,
    opacity: 0.0879,
    blur: 2.17,
    zIndex: 411,
    interactive: false,
    ariaHidden: true,
  },
];

const TOLERANCE = {
  pitch: 0.001,
  theta: 0.05,
  position: 0.5,
  rotateY: 0.05,
  opacity: 0.01,
  blur: 0.03,
  zIndex: 1,
};

interface Check {
  label: string;
  pass: boolean;
  expected: unknown;
  actual: unknown;
  tolerance?: number;
}

interface GoldenResult {
  pass: boolean;
  pitch: number;
  checks: Check[];
  domChecks: Check[];
  checkedAt: string;
}

declare global {
  interface Window {
    __ARCWAVE_GOLDEN__?: GoldenResult;
  }
}

function numericCheck(
  label: string,
  expected: number,
  actual: number,
  tolerance: number,
): Check {
  return {
    label,
    pass: Number.isFinite(actual) && Math.abs(expected - actual) <= tolerance,
    expected,
    actual,
    tolerance,
  };
}

function booleanCheck(
  label: string,
  expected: boolean,
  actual: boolean,
): Check {
  return { label, pass: expected === actual, expected, actual };
}

function parsePlateTransform(transform: string): {
  x: number;
  z: number;
  rotateY: number;
} | null {
  const match = transform.match(
    /translate3d\(([-\d.]+)px,\s*([-\d.]+)px,\s*([-\d.]+)px\)\s*rotateY\(([-\d.]+)deg\)/,
  );
  if (!match) return null;
  return {
    x: Number(match[1]),
    z: Number(match[3]),
    rotateY: Number(match[4]),
  };
}

function readPlate(plate: HTMLElement): {
  x: number;
  z: number;
  rotateY: number;
  opacity: number;
  blur: number;
  zIndex: number;
  interactive: boolean;
  ariaHidden: boolean;
} | null {
  const transform = parsePlateTransform(plate.style.transform);
  const blurMatch = plate.style.filter.match(/blur\(([-\d.]+)px\)/);
  if (!transform || !blurMatch) return null;
  return {
    ...transform,
    opacity: Number(plate.style.opacity),
    blur: Number(blurMatch[1]),
    zIndex: Number(plate.style.zIndex),
    interactive: plate.style.pointerEvents === "auto",
    ariaHidden: plate.getAttribute("aria-hidden") === "true",
  };
}

function runGoldenTest(root: HTMLElement | null): GoldenResult {
  const params: ArcwavePlateParams = {
    slotCount: 20,
    radius: GOLDEN_RADIUS,
    pitchDegrees: computePitchDegrees(
      GOLDEN_CARD_WIDTH,
      GOLDEN_GAP,
      GOLDEN_RADIUS,
    ),
    maxRotation: 65,
    visibleArc: 90,
    sideOpacity: 0.45,
    sideBlur: 2.4,
    blurExponent: 1.3,
    blurScale: 1,
    zBase: 500,
    interactiveAngle: 75,
    ariaHiddenOpacity: 0.1,
  };

  const checks: Check[] = [
    numericCheck("pitch", GOLDEN_PITCH, params.pitchDegrees, TOLERANCE.pitch),
    booleanCheck(
      "ring slot count",
      true,
      buildRingSlides(undefined).length === 20,
    ),
  ];

  for (const row of GOLDEN_ROWS) {
    const state = computePlate(row.slot, GOLDEN_POSITION, params);
    const prefix = `slot ${row.slot} ${row.name}`;
    checks.push(
      numericCheck(`${prefix} theta`, row.theta, state.theta, TOLERANCE.theta),
    );
    checks.push(
      numericCheck(`${prefix} x`, row.x, state.x, TOLERANCE.position),
    );
    checks.push(
      numericCheck(`${prefix} z`, row.z, state.z, TOLERANCE.position),
    );
    checks.push(
      numericCheck(
        `${prefix} rotateY`,
        row.rotateY,
        state.rotateY,
        TOLERANCE.rotateY,
      ),
    );
    checks.push(
      numericCheck(
        `${prefix} opacity`,
        row.opacity,
        state.opacity,
        TOLERANCE.opacity,
      ),
    );
    checks.push(
      numericCheck(`${prefix} blur`, row.blur, state.blur, TOLERANCE.blur),
    );
    checks.push(
      numericCheck(
        `${prefix} z-index`,
        row.zIndex,
        state.zIndex,
        TOLERANCE.zIndex,
      ),
    );
    checks.push(
      booleanCheck(`${prefix} interactive`, row.interactive, state.interactive),
    );
    checks.push(
      booleanCheck(`${prefix} aria-hidden`, row.ariaHidden, state.ariaHidden),
    );
  }

  const domChecks: Check[] = [];
  const plates = Array.from(
    root?.querySelectorAll<HTMLElement>(".thr3-plate") ?? [],
  );
  domChecks.push(booleanCheck("DOM plate count", true, plates.length === 20));

  for (const row of GOLDEN_ROWS) {
    const plate = plates[row.slot];
    const prefix = `DOM slot ${row.slot} ${row.name}`;
    if (!plate) {
      domChecks.push({
        label: prefix,
        pass: false,
        expected: "plate",
        actual: "missing",
      });
      continue;
    }

    domChecks.push(
      booleanCheck(
        `${prefix} label`,
        true,
        (plate.getAttribute("aria-label") ?? "").includes(row.name),
      ),
    );

    const values = readPlate(plate);
    if (!values) {
      domChecks.push({
        label: prefix,
        pass: false,
        expected: "parsable transform/filter",
        actual: `${plate.style.transform} / ${plate.style.filter}`,
      });
      continue;
    }

    domChecks.push(
      numericCheck(`${prefix} x`, row.x, values.x, TOLERANCE.position),
    );
    domChecks.push(
      numericCheck(`${prefix} z`, row.z, values.z, TOLERANCE.position),
    );
    domChecks.push(
      numericCheck(
        `${prefix} rotateY`,
        row.rotateY,
        values.rotateY,
        TOLERANCE.rotateY,
      ),
    );
    domChecks.push(
      numericCheck(
        `${prefix} opacity`,
        row.opacity,
        values.opacity,
        TOLERANCE.opacity,
      ),
    );
    domChecks.push(
      numericCheck(`${prefix} blur`, row.blur, values.blur, TOLERANCE.blur),
    );
    domChecks.push(
      numericCheck(
        `${prefix} z-index`,
        row.zIndex,
        values.zIndex,
        TOLERANCE.zIndex,
      ),
    );
    domChecks.push(
      booleanCheck(
        `${prefix} interactive`,
        row.interactive,
        values.interactive,
      ),
    );
    domChecks.push(
      booleanCheck(`${prefix} aria-hidden`, row.ariaHidden, values.ariaHidden),
    );
  }

  const result: GoldenResult = {
    pass: [...checks, ...domChecks].every((check) => check.pass),
    pitch: params.pitchDegrees,
    checks,
    domChecks,
    checkedAt: new Date().toISOString(),
  };
  window.__ARCWAVE_GOLDEN__ = result;
  return result;
}

type DemoAutoplayMode = "continuous" | "step";
type DemoAutoplayDirection = "left" | "right";
type DemoCaptionMode = "hover" | "always" | "center";
type DemoReveal = "fade" | "slide" | "none";
type DemoVideoPlayback = "visible" | "centre" | "always";

const PARAMS = new URLSearchParams(window.location.search);
const LINKED = PARAMS.get("link") === "1";
const VIDEO = PARAMS.get("video") === "1";
const START_AUTOPLAY = PARAMS.get("autoplay") !== "0";

const GOLDEN_PROPS: ArcwaveCarouselProps = {
  cardSizeMode: "fixed",
  cardWidth: 168,
  cardHeight: 240,
  gap: 6.4,
  cylinderRadius: 532,
  perspective: 480,
  maxRotation: 65,
  visibleArc: 90,
  sideOpacity: 0.45,
  sideBlur: 2.4,
  sideDarken: 0,
  edgeFade: 20,
  autoplay: false,
  dragEnabled: false,
  wheelEnabled: false,
  captionMode: "always",
  reveal: "none",
  debugPosition: 10.57,
  ariaLabel: "Arcwave golden test",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.5,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const controlStyle: React.CSSProperties = {
  font: "12px ui-monospace, SFMono-Regular, Menlo, monospace",
  background: "rgba(255,255,255,0.08)",
  color: "#eee",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: 7,
  padding: "7px 9px",
};

function App(): React.ReactElement {
  const goldenRootRef = React.useRef<HTMLDivElement>(null);
  const [result, setResult] = React.useState<GoldenResult | null>(null);
  const [autoplay, setAutoplay] = React.useState(START_AUTOPLAY);
  const [autoplayMode, setAutoplayMode] =
    React.useState<DemoAutoplayMode>("continuous");
  const [autoplayDirection, setAutoplayDirection] =
    React.useState<DemoAutoplayDirection>("left");
  const [autoplaySpeed, setAutoplaySpeed] = React.useState(0.45);
  const [snap, setSnap] = React.useState(false);
  const [dragEnabled, setDragEnabled] = React.useState(true);
  const [wheelEnabled, setWheelEnabled] = React.useState(true);
  const [captionMode, setCaptionMode] =
    React.useState<DemoCaptionMode>("hover");
  const [reveal, setReveal] = React.useState<DemoReveal>("slide");
  const [sideDarken, setSideDarken] = React.useState(0.12);
  const [videoPlayback, setVideoPlayback] =
    React.useState<DemoVideoPlayback>("visible");
  const [rafRate, setRafRate] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = runGoldenTest(goldenRootRef.current);
      setResult(next);
      const output = document.getElementById("golden-result");
      if (output) output.textContent = JSON.stringify(next, null, 2);
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setRafRate(rafCalls);
      rafCalls = 0;
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  const linkedSlides = React.useMemo(
    () =>
      LINKED
        ? DEFAULT_SLIDES.map((slide, index) =>
            index === 0
              ? {
                  ...slide,
                  link: { href: "https://example.com", target: "_blank" },
                }
              : slide,
          )
        : undefined,
    [],
  );

  const displayedSlides = React.useMemo(() => {
    if (!VIDEO) return linkedSlides;
    const source = new URL("test-video.webm", window.location.href).href;
    return DEFAULT_SLIDES.map((slide, index) =>
      index === 0
        ? {
            ...slide,
            type: "video" as const,
            video: { src: source },
            poster: slide.image,
            image: null,
          }
        : slide,
    );
  }, [linkedSlides]);

  const failed = result
    ? [...result.checks, ...result.domChecks].filter((check) => !check.pass)
        .length
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
        padding: "20px 16px 64px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ maxWidth: 1465, margin: "0 auto 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                opacity: 0.5,
              }}
            >
              Framer code component · local demo
            </div>
            <h1
              style={{
                margin: "5px 0 0",
                font: "600 30px/1.1 Inter, Helvetica, Arial, sans-serif",
                letterSpacing: "-0.03em",
              }}
            >
              Arcwave Carousel
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              font: "11px ui-monospace, monospace",
              opacity: 0.7,
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: rafRate > 0 ? "#63d18b" : "#6f6f76",
                  marginRight: 6,
                }}
              />
              RAF {rafRate}/s
            </span>
            <a
              href="?canvas=1&autoplay=0"
              style={{ color: "#9fc7ff", textDecoration: "underline" }}
            >
              Canvas view
            </a>
            <a
              href="?link=1&autoplay=0"
              style={{ color: "#9fc7ff", textDecoration: "underline" }}
            >
              Link test
            </a>
            <a
              href="?video=1&autoplay=0"
              style={{ color: "#9fc7ff", textDecoration: "underline" }}
            >
              Video test
            </a>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
          }}
        >
          <Field label="Autoplay">
            <select
              data-testid="autoplay"
              style={controlStyle}
              value={autoplay ? "on" : "off"}
              onChange={(event) => setAutoplay(event.target.value === "on")}
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
          </Field>
          <Field label="Mode">
            <select
              data-testid="autoplay-mode"
              style={controlStyle}
              value={autoplayMode}
              onChange={(event) =>
                setAutoplayMode(event.target.value as DemoAutoplayMode)
              }
            >
              <option value="continuous">continuous</option>
              <option value="step">step</option>
            </select>
          </Field>
          <Field label="Direction">
            <select
              data-testid="autoplay-direction"
              style={controlStyle}
              value={autoplayDirection}
              onChange={(event) =>
                setAutoplayDirection(
                  event.target.value as DemoAutoplayDirection,
                )
              }
            >
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </Field>
          <Field label="Speed">
            <input
              data-testid="autoplay-speed"
              style={{ ...controlStyle, width: 84 }}
              type="number"
              min={0.1}
              max={6}
              step={0.05}
              value={autoplaySpeed}
              onChange={(event) => setAutoplaySpeed(Number(event.target.value))}
            />
          </Field>
          <Field label="Snap">
            <select
              data-testid="snap"
              style={controlStyle}
              value={snap ? "on" : "off"}
              onChange={(event) => setSnap(event.target.value === "on")}
            >
              <option value="off">off</option>
              <option value="on">on</option>
            </select>
          </Field>
          <Field label="Drag">
            <select
              data-testid="drag"
              style={controlStyle}
              value={dragEnabled ? "on" : "off"}
              onChange={(event) => setDragEnabled(event.target.value === "on")}
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
          </Field>
          <Field label="Wheel">
            <select
              data-testid="wheel"
              style={controlStyle}
              value={wheelEnabled ? "on" : "off"}
              onChange={(event) => setWheelEnabled(event.target.value === "on")}
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
          </Field>
          <Field label="Captions">
            <select
              data-testid="captions"
              style={controlStyle}
              value={captionMode}
              onChange={(event) =>
                setCaptionMode(event.target.value as DemoCaptionMode)
              }
            >
              <option value="hover">hover</option>
              <option value="always">always</option>
              <option value="center">center</option>
            </select>
          </Field>
          <Field label="Reveal">
            <select
              data-testid="reveal"
              style={controlStyle}
              value={reveal}
              onChange={(event) => setReveal(event.target.value as DemoReveal)}
            >
              <option value="fade">fade</option>
              <option value="slide">slide</option>
              <option value="none">none</option>
            </select>
          </Field>
          <Field label="Video">
            <select
              data-testid="video-playback"
              style={controlStyle}
              value={videoPlayback}
              onChange={(event) =>
                setVideoPlayback(event.target.value as DemoVideoPlayback)
              }
            >
              <option value="visible">visible</option>
              <option value="centre">centre</option>
              <option value="always">always</option>
            </select>
          </Field>
          <Field label="Darken">
            <input
              data-testid="darken"
              style={{ width: 96 }}
              type="range"
              min={0}
              max={0.7}
              step={0.01}
              value={sideDarken}
              onChange={(event) => setSideDarken(Number(event.target.value))}
            />
          </Field>
          <div
            id="golden-summary"
            data-testid="golden-summary"
            style={{
              marginLeft: "auto",
              paddingBottom: 6,
              font: "11px ui-monospace, monospace",
              color: !result ? "#c9c4b8" : result.pass ? "#63d18b" : "#ff7474",
            }}
          >
            {!result
              ? "Golden test running…"
              : result.pass
                ? `Golden PASS · ${result.checks.length + result.domChecks.length}`
                : `Golden FAIL · ${failed}`}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1465, margin: "0 auto" }}>
        <div
          id="main-carousel"
          style={{
            position: "relative",
            width: 1465,
            height: 737,
            maxWidth: "100%",
          }}
        >
          <ArcwaveCarousel
            {...GOLDEN_PROPS}
            debugPosition={undefined}
            slides={displayedSlides}
            cardSizeMode="fixed"
            edgeFade={20}
            sideDarken={sideDarken}
            autoplay={autoplay}
            autoplayMode={autoplayMode}
            autoplayDirection={autoplayDirection}
            autoplaySpeed={autoplaySpeed}
            snap={snap}
            dragEnabled={dragEnabled}
            wheelEnabled={wheelEnabled}
            captionMode={captionMode}
            reveal={reveal}
            videoPlayback={videoPlayback}
            pauseOnHover
            initialPosition={0}
            ariaLabel="Arcwave interactive demo"
          />
        </div>

        <div
          style={{ marginTop: 22, display: "flex", gap: 22, flexWrap: "wrap" }}
        >
          <div
            id="compact-carousel"
            style={{ position: "relative", width: 600, height: 320 }}
          >
            <ArcwaveCarousel
              slides={displayedSlides}
              cardSizeMode="fillHeight"
              heightPercent={82}
              cardWidth={168}
              cardHeight={240}
              gap={6.4}
              edgeFade={16}
              sideDarken={0.12}
              autoplay={false}
              dragEnabled
              wheelEnabled
              captionMode="always"
              reveal="fade"
              initialPosition={2}
              ariaLabel="Arcwave compact demo"
            />
          </div>
          <div
            style={{
              width: 420,
              padding: "18px 20px",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.66)",
              font: "13px/1.6 Inter, Helvetica, Arial, sans-serif",
            }}
          >
            <strong style={{ color: "#fff" }}>Controls</strong>
            <div style={{ marginTop: 8 }}>
              Drag horizontally, scroll over the ring, or use ← / → when the
              carousel is focused. Click a side card to bring it to the centre;
              the centre card follows its link. Hover captions can be made
              persistent or centre-only in the strip above.
            </div>
          </div>
        </div>
      </main>

      <div
        id="golden-carousel"
        ref={goldenRootRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -20000,
          top: 0,
          width: 1465,
          height: 737,
          pointerEvents: "none",
        }}
      >
        <ArcwaveCarousel {...GOLDEN_PROPS} />
      </div>

      <pre id="golden-result" style={{ display: "none" }} />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
