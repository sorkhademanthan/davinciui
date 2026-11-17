import * as React from "react";
import { createRoot } from "react-dom/client";
import FannedDeck, { type FannedDeckItem } from "../FannedDeck";

declare global {
  interface Window {
    __opened: Array<[string, string?, string?]>;
  }
}
window.__opened = [];
const nativeOpen = window.open.bind(window);
window.open = ((...args: Parameters<typeof window.open>) => {
  window.__opened.push(args as [string, string?, string?]);
  return null;
}) as typeof window.open;
void nativeOpen;

const params = new URLSearchParams(window.location.search);
const entranceParam = params.get("entrance");
const entrance =
  entranceParam === "flip" ||
  entranceParam === "rise" ||
  entranceParam === "sweep"
    ? entranceParam
    : "deal";

// Repo images mapped to the 7 reference cards (left -> right = back -> front).
const items: FannedDeckItem[] = [
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/blue-profile.webp", alt: "Blue-lit profile portrait" },
    label: "@inkhouse",
    link: "https://example.com",
    newTab: true,
    color: "#2f6bff",
  },
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/red-echo.webp", alt: "Red fashion portrait" },
    label: "@paperlab",
    link: "https://example.com",
    newTab: true,
    color: "#ff5a3c",
  },
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/orange-haze.webp", alt: "Orange haze portrait" },
    label: "@softfocus",
    link: "https://example.com",
    newTab: true,
    color: "#e8890c",
  },
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/prism-portrait.webp", alt: "Prism-lit portrait" },
    label: "@dreamstate",
    link: "https://example.com",
    newTab: true,
    color: "#ff4f9a",
  },
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/crimson-profile.webp", alt: "Crimson profile portrait" },
    label: "@redroom",
    link: "https://example.com",
    newTab: true,
    color: "#d7263d",
  },
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/red-blue-figure.webp", alt: "Red and blue figure" },
    label: "@posterclub",
    link: "https://example.com",
    newTab: true,
    color: "#7b5cff",
  },
  {
    type: "image",
    image: { src: "/images/spiral-3d-slider/green-portrait.webp", alt: "Green-lit portrait" },
    label: "@greenline",
    link: "https://example.com",
    newTab: true,
    color: "#5e9c78",
  },
];

function App() {
  const [mounted, setMounted] = React.useState(true);
  return (
    <main>
      <h1>FannedDeck · local demo</h1>
      <div className="hud">
        entrance={entrance} — hover cards, focus with Tab, click linked cards
      </div>
      <p>
        <button id="toggle-mounted" type="button" onClick={() => setMounted((v) => !v)}>
          {mounted ? "Unmount deck" : "Remount deck"}
        </button>
        <button
          id="replay-entrance"
          type="button"
          style={{ marginLeft: 8 }}
          onClick={() => {
            setMounted(false);
            window.setTimeout(() => setMounted(true), 120);
          }}
        >
          Replay entrance
        </button>
      </p>
      {mounted ? (
        <div className="stage" id="stage">
          <FannedDeck items={items} entrance={entrance} />
        </div>
      ) : null}
    </main>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
