/**
 * Minimal local stand-in for the "framer" module. The real module is supplied
 * by Framer in the canvas and in published sites. This shim only exists so the
 * component can be bundled and tested outside Framer.
 */

export const RenderTarget = {
  canvas: "canvas",
  web: "web",
  export: "export",
  current(): string {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("canvas") === "1") return RenderTarget.canvas;
    }
    return RenderTarget.web;
  },
};

export const ControlType = {
  Array: "array",
  Object: "object",
  Boolean: "boolean",
  Color: "color",
  Number: "number",
  String: "string",
  Enum: "enum",
  ResponsiveImage: "responsiveimage",
  Image: "image",
  Link: "link",
  File: "file",
  Font: "font",
} as const;

export function addPropertyControls(
  component: unknown,
  controls: unknown,
): unknown {
  void controls;
  return component;
}
