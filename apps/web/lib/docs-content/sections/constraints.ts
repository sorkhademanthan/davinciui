import type { DocsContentMap } from "../types";

// Real, source-verified limitations. Keep entries alphabetical and phrase
// each item as something a consumer must plan around, not a bug report.
export const constraints = {
  "chromatic-cursor": {
    constraints: [
      "Skips initialization on coarse pointers, so touch devices keep the native cursor.",
      "When reduced motion is requested the canvas stays idle instead of animating.",
      "The canvas is decorative and should not be the only target for pointer interactions.",
    ],
  },
  "circle-cursor": {
    constraints: [
      "Mouse-only: the effect never runs on touch or other coarse pointers.",
      "Reduced motion disables the follow animation and leaves the native cursor in place.",
      "The overlay is decorative, so interactive elements still need their own visible affordances.",
    ],
  },
  "elastic-blob-cursor": {
    constraints: [
      "Runs only for fine pointers and restores the native cursor on touch devices.",
      "Reduced motion skips the pointer loop rather than slowing it down.",
      "The blob is an overlay; it does not replace hover or focus styles on the underlying page.",
    ],
  },
  "electric-vijdi-cursor": {
    constraints: [
      "Coarse pointers skip the canvas entirely, so there is no touch equivalent.",
      "Reduced motion keeps the effect idle instead of running a subtler animation.",
      "The canvas is decorative and should sit behind the content it accompanies.",
    ],
  },
  "fluid-cursor": {
    constraints: [
      "WebGL is required for the simulation; when the context is unavailable the effect cannot render.",
      "Coarse pointers and small viewports drop the simulation and dye resolution to keep the frame rate usable.",
      "The canvas is decorative, so pointer interactions must still work without it.",
    ],
  },
  "geometric-trail-cursor": {
    constraints: [
      "Touch movement does not generate trails unless enableTouch is set.",
      "Reduced motion requests are honored by skipping the animated trail.",
      "The trail is decorative; it should not be the only feedback for a pointer action.",
    ],
  },
  "ink-flow": {
    constraints: [
      "Requires WebGL; the component shows a fallback surface when the context cannot be created.",
      "The simulation is decorative and is skipped or simplified when reduced motion is requested.",
      "Keep the host sized by layout, because the canvas follows its container rather than driving height.",
    ],
  },
  "liquid-chrome": {
    constraints: [
      "Requires WebGL. If the context or shader compilation fails, the component logs an error and renders no effect.",
      "There is no CSS-only fallback, so pair it with a background color or image on the host.",
      "The canvas is decorative and should not be the only content in the section.",
    ],
  },
  "magic-cursor-pro": {
    constraints: [
      "Hidden by default on coarse pointers and portrait layouts, so mobile users get the native cursor.",
      "Reduced motion keeps the effect from animating even when the pointer is fine.",
      "The effect is an overlay; links and buttons still need their own hover and focus states.",
    ],
  },
  "neon-mesh-bg": {
    constraints: [
      "Requires WebGL. When the context is unavailable the host switches to a CSS gradient fallback automatically.",
      "Reduced motion freezes the shader instead of animating it.",
      "The canvas paints behind content, so the host needs an explicit height or a sized parent.",
    ],
  },
  noiser: {
    constraints: [
      "The animation stops when the element leaves the viewport, so offscreen instances are not paused manually.",
      "Reduced motion prevents the animation from starting.",
      "The pattern is decorative and should stay behind the readable content layer.",
    ],
  },
  "pixel-flow": {
    constraints: [
      "Requires WebGL; when the context is unavailable the host marks the fallback state and skips the shader.",
      "Reduced motion stops the flow animation while preserving the rendered frame.",
      "The canvas is sized by its host, so give the section a height before mounting it.",
    ],
  },
  "shader-text": {
    constraints: [
      "The shader fill needs WebGL. Without it the effect is skipped rather than replaced by an image.",
      "Rendering pauses when the element is offscreen or the page is hidden.",
      "Reduced motion keeps the text readable but stops the animated fill.",
    ],
  },
  "silk-aurora": {
    constraints: [
      "Requires WebGL; the shared error boundary renders a fallback when the shader cannot start.",
      "Reduced motion is honored by the animation loop rather than by a separate static component.",
      "The canvas is decorative and needs a sized host container.",
    ],
  },
  "soft-fluid-gradient": {
    constraints: [
      "Requires WebGL; when initialization fails the component keeps a fallback surface instead of the shader.",
      "Reduced motion stops the fluid animation.",
      "The gradient is a background layer, so content needs its own contrast and stacking context.",
    ],
  },
  "spectra-noise": {
    constraints: [
      "Requires WebGL. If the context is unavailable the component renders its fallback state.",
      "Invalid hex colors are replaced with defaults instead of throwing.",
      "Reduced motion stops the noise animation while keeping the surface visible.",
    ],
  },
  "tubes-cursor": {
    constraints: [
      "Requires WebGL for the tube renderer.",
      "Reduced motion returns before the animation loop starts, so the effect is skipped entirely.",
      "The canvas is decorative; interactive content still needs normal hover and focus feedback.",
    ],
  },
} satisfies DocsContentMap;
