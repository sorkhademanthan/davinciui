import * as React from "react";
import { createRoot } from "react-dom/client";
import DepthCarousel3D, {
  DEFAULT_LAYOUT,
  computeDepthLayout,
  wrapSignedDistance,
  type DepthCarousel3DItem,
} from "../DepthCarousel3D";

/* RAF instrumentation: lets the test suite verify unmount stops the loops. */
let rafCalls = 0;
const nativeRaf = window.requestAnimationFrame.bind(window);
window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
  rafCalls += 1;
  return nativeRaf(callback);
}) as typeof window.requestAnimationFrame;

declare global {
  interface Window {
    __rafCalls: () => number;
    __opened: Array<[string, string?, string?]>;
  }
}
window.__rafCalls = () => rafCalls;
window.__opened = [];
// Expose the pure layout math so the golden table can be asserted in-browser.
(window as unknown as Record<string, unknown>).__gold = {
  computeDepthLayout,
  wrapSignedDistance,
  DEFAULT_LAYOUT,
};
const nativeOpen = window.open.bind(window);
window.open = ((...args: Parameters<typeof window.open>) => {
  window.__opened.push(args as [string, string?, string?]);
  return null;
}) as typeof window.open;
void nativeOpen;

/* -----------------------------------------------------------------------------
 * Procedural portraits (data URLs) so the demo needs no network assets.
 * -------------------------------------------------------------------------- */

const PALETTES: ReadonlyArray<[string, string, string]> = [
  ["#E5A87C", "#8E3C42", "#18181D"],
  ["#A7C4B5", "#285A55", "#16181D"],
  ["#E0B34B", "#8C3F2B", "#18151A"],
  ["#9BB7D4", "#3C4A7E", "#17171C"],
  ["#D5A9C6", "#6B355E", "#18151B"],
  ["#C5B3DB", "#4F3D78", "#17161D"],
  ["#B5D4C0", "#356B5F", "#16181C"],
  ["#E8C48F", "#92552E", "#181614"],
  ["#B9C6D8", "#44566A", "#15181C"],
  ["#D8A3A0", "#74393C", "#181518"],
];

const NAMES = [
  "Mara Okafor",
  "Nora Vance",
  "Julian Reyes",
  "Kai Nakamura",
  "Iris Calder",
  "Lena Moreau",
  "Sofia Lind",
  "Amara Diallo",
  "Elias Hart",
  "Theo Brandt",
];

function makePortrait(name: string, index: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const palette = PALETTES[index % PALETTES.length]!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 320);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.55, palette[1]);
  gradient.addColorStop(1, palette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 320);

  ctx.globalAlpha = 0.85;
  const glow = ctx.createRadialGradient(96, 96, 8, 96, 96, 170);
  glow.addColorStop(0, palette[0]);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 256, 320);

  ctx.globalAlpha = 0.6;
  ctx.fillStyle = palette[0];
  ctx.beginPath();
  ctx.arc(128, 120, 46, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.75;
  ctx.fillStyle = palette[2];
  ctx.beginPath();
  ctx.moveTo(28, 320);
  ctx.bezierCurveTo(34, 218, 78, 188, 128, 188);
  ctx.bezierCurveTo(178, 188, 222, 218, 228, 320);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 22px ui-sans-serif, system-ui, sans-serif";
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");
  ctx.fillText(initials, 18, 40);
  ctx.globalAlpha = 1;
  return canvas.toDataURL("image/jpeg", 0.82);
}

const PORTRAITS = NAMES.map(makePortrait);

const params = new URLSearchParams(window.location.search);
const cardCount = Number.parseInt(params.get("cards") ?? "5", 10) || 5;
const withLink = params.get("link") === "1";
const empty = params.get("empty") === "1";
const autoplay = params.get("autoplay") === "1";

const items: DepthCarousel3DItem[] = empty
  ? []
  : Array.from({ length: cardCount }, (_, i) => ({
      image: { src: PORTRAITS[i % PORTRAITS.length], width: 256, height: 320 },
      alt: `Portrait ${i + 1}`,
      ...(withLink && i === 0 ? { link: "https://example.com", newTab: true } : {}),
    }));

function App() {
  const [mounted, setMounted] = React.useState(true);
  return (
    <main>
      <h1>DepthCarousel3D · local demo</h1>
      <div className="hud" id="hud">
        cards={cardCount} link={String(withLink)} empty={String(empty)} autoplay={String(autoplay)}{" "}
        rafCalls=<span id="raf">0</span>
      </div>
      <p>
        <button id="toggle-mounted" type="button" onClick={() => setMounted((value) => !value)}>
          {mounted ? "Unmount carousel" : "Remount carousel"}
        </button>
      </p>
      {
        mounted ? (
          <div className="stage" id="stage">
            <DepthCarousel3D
              items={items}
              ariaLabel="Depth carousel demo"
              autoplay={autoplay}
              autoplayInterval={2}
            />
          </div>
        ) : null
      }
      <p className="scroll-note">
        This paragraph exists so the page is taller than the viewport. Plain
        vertical wheel scrolling over the carousel scrolls this text, not the
        ring. Horizontal wheel (or Shift + vertical) rotates the deck. Arrow
        keys navigate, Home and End jump to the first and last slots, and a
        drag flicks the deck with momentum before snapping to the nearest slot.
      </p>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
  window.setInterval(() => {
    const node = document.getElementById("raf");
    if (node) node.textContent = String(rafCalls);
  }, 500);
}
