"use client";

/**
 * StreamlineCarousel
 * -----------------------------------------------------------------------------
 * Web port of framer/streamline-carousel/StreamlineCarousel.tsx for the
 * davinciui design system. Same renderer; Framer-only property controls are
 * stripped and the component exports a named export.
 * An infinite, draggable, curved image/video carousel drawn on ONE WebGL
 * canvas. The centre of the strip is flat; toward the edges the cards grow
 * taller, so the top and bottom edges bow outward like a bowl. A red/blue
 * channel split (chromatic fringe) strengthens at the edges and with scroll
 * speed, and the curve exaggerates slightly while moving fast and relaxes at
 * rest.
 *
 * Usage
 *   Drop the component on the canvas and add items (or leave the empty
 *   default to preview the built-in gradient placeholders). Drag, scroll
 *   horizontally, use the arrow keys, or click a card to focus it.
 *
 * Rendering model
 *   One shared TRIANGLE_STRIP (32 segments x 2 rows) covers a card. The
 *   vertex shader bows each vertical slice by a canvas-space curve term and
 *   the fragment shader crops media cover-fit, splits R/B with a signed
 *   fringe offset, and clips to a rounded-rect SDF (in screen pixels, so the
 *   silhouette matches even mid-curve). Layout and motion are written
 *   straight to GL uniforms from one rAF loop; React is never re-rendered
 *   per frame.
 *
 * Browser support
 *   WebGL2 preferred, WebGL1 fallback. If neither exists the component
 *   renders the container background and nothing else, without throwing.
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 560
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

import * as React from "react";

/* =============================================================================
 * 1. TYPES
 * ===========================================================================*/

type StreamlineKind = "image" | "video";
type StreamlineEntrance = "none" | "lift" | "slide" | "dissolve";

export interface StreamlineItem {
  kind?: StreamlineKind;
  image?: unknown;
  video?: unknown;
  url?: string;
  link?: unknown;
  newTab?: boolean;
}

export interface StreamlineCarouselProps {
  items?: StreamlineItem[];
  background?: string;
  cardHeight?: number;
  fixedAspect?: boolean;
  aspectRatio?: number;
  gap?: number;
  radius?: number;
  flatWidth?: number;
  curvature?: number;
  colorFringe?: number;
  speedDistortion?: number;
  autoplay?: boolean;
  autoSpeed?: number;
  pauseOnHover?: boolean;
  momentum?: number;
  wheel?: boolean;
  keyboard?: boolean;
  clickToFocus?: boolean;
  entrance?: StreamlineEntrance;
  duration?: number;
  stagger?: number;
  className?: string;
}

/** A slide after URL/kind resolution, before media has loaded. */
interface ResolvedSlide {
  src: string;
  isVideo: boolean;
  link: string | null;
  newTab: boolean;
  /** Hue used for the generated gradient placeholder when src is empty. */
  hue: number;
}

interface MediaEntry {
  texture: WebGLTexture | null;
  aspect: number | null;
  video: HTMLVideoElement | null;
}

interface DrawnCard {
  index: number;
  cx: number;
  offsetY: number;
  w: number;
  base: number;
}

interface Tween {
  from: number;
  delta: number;
  start: number;
  durationMs: number;
}

/* =============================================================================
 * 2. CONSTANTS
 * ===========================================================================*/

const MAX_DPR = 2;
/** Aspect used until real media metadata arrives in natural mode. */
const PROVISIONAL_ASPECT = 1.25;
const MIN_ASPECT = 0.5;
const MAX_ASPECT = 2.5;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
/** Autoplay pauses this long after any interaction. */
const INTERACTION_PAUSE_MS = 1500;
/** Focus tweens extend the pause by an extra 2s. */
const FOCUS_PAUSE_EXTRA_MS = 2000;
const FOCUS_TWEEN_MS = 700;
const CLICK_TWEEN_MS = 800;
/** A pointer move more than this many px from press start is not a click. */
const CLICK_SLOP_PX = 5;
/** Release velocity is zeroed when the last move was this long ago. */
const STALE_RELEASE_MS = 80;
/** Empty media list shows this many gradient placeholder cards. */
const PLACEHOLDER_COUNT = 7;
const SEGMENT_COUNT = 32;

const VERTEX_SRC = `
precision highp float;

attribute vec2 aUv;

uniform float uX;           // screen-space x of the card's left edge
uniform vec2 uOffset;       // entrance offset, px
uniform float uCenterY;     // vertical centre of the canvas, px
uniform float uCardW;
uniform float uCardH;
uniform float uW2;          // canvas width / 2
uniform float uH2;          // canvas height / 2
uniform float uFlat;        // fraction of the half-width that stays flat
uniform float uCurvature;
uniform float uSpeed;       // visual speed, -1..1
uniform float uSpeedDistortion;
uniform float uFringe;

varying vec2 vUv;
varying vec2 vLocal;        // px from the card centre (screen px)
varying float vK;           // signed chromatic-fringe offset
varying float vScaleY;

void main() {
  float x = uX + aUv.x * uCardW + uOffset.x;
  float side = (x - uW2) / uW2;
  float e = clamp((abs(side) - uFlat) / max(1.0 - uFlat, 0.001), 0.0, 1.4);
  // e^2 keeps the flat centre truly flat and bows the silhouette outward.
  float scaleY = 1.0 + uCurvature * e * e * (1.0 + uSpeedDistortion * abs(uSpeed) * 1.5);
  float y = uCenterY + uOffset.y + (aUv.y - 0.5) * uCardH * scaleY;
  gl_Position = vec4(x / uW2 - 1.0, 1.0 - y / uH2, 0.0, 1.0);
  float k = uFringe * 0.035 * (e * e + abs(uSpeed) * uSpeedDistortion);
  vK = side < 0.0 ? -k : k;
  vUv = aUv;
  vScaleY = scaleY;
  // vLocal is offset from the card centre in screen px, so the SDF in the
  // fragment stage stays circular regardless of the curve.
  vLocal = vec2((aUv.x - 0.5) * uCardW, (aUv.y - 0.5) * uCardH * scaleY);
}
`;

const FRAGMENT_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
varying vec2 vLocal;
varying float vK;
varying float vScaleY;

uniform sampler2D uTexture;
uniform vec2 uCover;        // cover-fit UV scale (crop, never stretch)
uniform float uRadius;
uniform float uCardW;
uniform float uCardH;
uniform float uAlpha;

void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  float r = texture2D(uTexture, uv + vec2(vK, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(vK, 0.0)).b;

  // Rounded-rect SDF. halfSize tracks the local vertical stretch so the
  // silhouette matches the bowed edge exactly.
  vec2 halfSize = vec2(uCardW * 0.5, uCardH * 0.5 * vScaleY);
  vec2 q = abs(vLocal) - (halfSize - vec2(uRadius));
  float d = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - uRadius;
  float alpha = (1.0 - smoothstep(-0.75, 0.75, d)) * uAlpha;

  gl_FragColor = vec4(vec3(r, g, b) * alpha, alpha);
}
`;

const UNIFORM_NAMES = [
  "uX",
  "uOffset",
  "uCenterY",
  "uCardW",
  "uCardH",
  "uW2",
  "uH2",
  "uFlat",
  "uCurvature",
  "uSpeed",
  "uSpeedDistortion",
  "uFringe",
  "uRadius",
  "uAlpha",
  "uCover",
  "uTexture",
] as const;

/* =============================================================================
 * 3. MATH AND MEDIA HELPERS
 * ===========================================================================*/

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const numberOr = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Wrap a signed distance into [-P/2, P/2). */
const wrapSigned = (value: number, period: number): number => {
  if (!Number.isFinite(value) || period <= 0) return 0;
  let wrapped = ((value % period) + period) % period; // [0, P)
  if (wrapped >= period / 2) wrapped -= period;
  return wrapped;
};

/** Best-effort URL out of a String, ResponsiveImage or Link-like value. */
const resolveUrl = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  for (const key of ["src", "url", "href"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  // Some ResponsiveImage payloads expose only a srcSet; take the first URL.
  const srcSet = record["srcSet"];
  if (typeof srcSet === "string" && srcSet.trim()) {
    const first = srcSet.split(",")[0]?.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return "";
};

const isVideoUrl = (url: string): boolean =>
  VIDEO_EXT.test(url.split("?")[0]?.split("#")[0] ?? "");

/** Diagonal gradient used for items without a source, so drops never look broken. */
const createGradientPlaceholder = (hue: number): HTMLCanvasElement => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const base = ((hue % 360) + 360) % 360;
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, `hsl(${base} 45% 62%)`);
    gradient.addColorStop(1, `hsl(${(base + 40) % 360} 50% 30%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const glow = ctx.createRadialGradient(
      size * 0.35,
      size * 0.3,
      8,
      size * 0.35,
      size * 0.3,
      size * 0.75,
    );
    glow.addColorStop(0, "rgba(255,255,255,0.35)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
  }
  return canvas;
};

const resolveSlides = (
  items: StreamlineItem[] | undefined,
): ResolvedSlide[] => {
  const source = items && items.length > 0 ? items : null;
  const resolveOne = (item: StreamlineItem, index: number): ResolvedSlide => {
    const hue = (index * 47 + 200) % 360;
    const kind: StreamlineKind = item.kind === "video" ? "video" : "image";
    const override =
      typeof item.url === "string" && item.url.trim() ? item.url.trim() : "";
    const media =
      kind === "video" ? resolveUrl(item.video) : resolveUrl(item.image);
    const src = override || media;
    // A URL ending in a video extension is a video even from an image field.
    const isVideo =
      kind === "video" || (src !== "" && isVideoUrl(src));
    const link = resolveUrl(item.link) || null;
    return {
      src,
      isVideo,
      link,
      newTab: item.newTab !== false,
      hue,
    };
  };
  if (!source) {
    return Array.from({ length: PLACEHOLDER_COUNT }, (_, index) =>
      resolveOne({}, index),
    );
  }
  return source.map(resolveOne);
};

const slidesKey = (slides: ResolvedSlide[]): string =>
  slides.map((slide) => `${slide.isVideo ? "v" : "i"}:${slide.src}`).join("|");

function usePrefersReducedMotion(): boolean {
  // Read matchMedia synchronously so frame 1 honours the preference;
  // an effect-only check would let autoplay/entrance slip through briefly.
  const [reduced, setReduced] = React.useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (): void => setReduced(query.matches);
    apply();
    query.addEventListener?.("change", apply);
    return () => query.removeEventListener?.("change", apply);
  }, []);

  return reduced;
}

/* =============================================================================
 * 4. COMPONENT
 * ===========================================================================*/

const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const StreamlineCarousel: React.FC<StreamlineCarouselProps> = (rawProps) => {
  const props = { ...DEFAULT_PROPS, ...rawProps };
  const propsRef = React.useRef(props);
  React.useEffect(() => {
    propsRef.current = props;
  });

  const reduceMotion = usePrefersReducedMotion();
  const reduceMotionRef = React.useRef(reduceMotion);
  React.useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const itemsKey = React.useMemo(
    () =>
      (props.items ?? [])
        .map(
          (item) =>
            `${item.kind ?? "image"}:${resolveUrl(item.image)}:${resolveUrl(
              item.video,
            )}:${typeof item.url === "string" ? item.url : ""}`,
        )
        .join("|"),
    [props.items],
  );
  const slides = React.useMemo(
    () => resolveSlides(props.items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey],
  );
  const slidesRef = React.useRef(slides);
  React.useEffect(() => {
    slidesRef.current = slides;
  });

  const slideCount = slides.length;

  React.useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    // WebGL2 preferred, WebGL1 fallback, silent no-op otherwise.
    const contextAttributes: WebGLContextAttributes = {
      antialias: true,
      premultipliedAlpha: true,
      alpha: true,
    };
    const gl2 = canvas.getContext("webgl2", contextAttributes) as
      | WebGL2RenderingContext
      | null;
    const isWebGL2 = gl2 !== null;
    const gl: WebGL2RenderingContext | WebGLRenderingContext | null =
      gl2 ??
      (canvas.getContext("webgl", contextAttributes) as
        | WebGLRenderingContext
        | null);
    if (!gl) return;
    const glCtx: WebGL2RenderingContext | WebGLRenderingContext = gl;

    let disposed = false;
    let glLost = false;
    let inView = true;
    let raf = 0;
    let dpr = 1;
    let W = 1;
    let H = 1;

    let program: WebGLProgram | null = null;
    let stripBuffer: WebGLBuffer | null = null;
    let aUv = -1;
    const uniforms = {} as Record<
      (typeof UNIFORM_NAMES)[number],
      WebGLUniformLocation | null
    >;

    let greyTexture: WebGLTexture | null = null;
    let mediaEntries: MediaEntry[] = [];
    let mediaKey = "";
    let mediaBuildId = 0;

    // Layout state. Widths ease toward their targets so natural-aspect
    // re-layout after media loads stays smooth instead of jumping.
    let widths: number[] = [];
    let prevPos = 0;
    let pos = 0;
    // Until the first layout runs we do not know card widths; the first
    // tick seeds pos so card 0 starts centred instead of flush to the edge.
    let posSeeded = false;
    let v = 0;
    let sv = 0; // visual speed, eased toward clamp((pos - prevPos)/dt/2500)
    const mountTime = performance.now();
    let lastFrame = mountTime;

    let dragging = false;
    let dragPointerId = -1;
    let lastX = 0;
    let lastMoveTime = 0;
    let downX = 0;
    let downY = 0;
    let interactionUntil = 0;
    let hovered = false;
    let tween: Tween | null = null;

    // Copies drawn last frame; used for click hit-testing.
    const drawn: DrawnCard[] = [];

    const setTextureParams = (mipmaps: boolean): void => {
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
      // Mipmaps only on WebGL2 for still images; videos never mipmap.
      if (mipmaps && isWebGL2) {
        glCtx.texParameteri(
          glCtx.TEXTURE_2D,
          glCtx.TEXTURE_MIN_FILTER,
          glCtx.LINEAR_MIPMAP_LINEAR,
        );
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR);
      } else {
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR);
      }
    };

    const uploadSource = (
      entry: MediaEntry,
      source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
      mipmaps: boolean,
    ): void => {
      if (!entry.texture) entry.texture = glCtx.createTexture();
      if (!entry.texture) return;
      glCtx.bindTexture(glCtx.TEXTURE_2D, entry.texture);
      glCtx.texImage2D(
        glCtx.TEXTURE_2D,
        0,
        glCtx.RGBA,
        glCtx.RGBA,
        glCtx.UNSIGNED_BYTE,
        source,
      );
      setTextureParams(mipmaps);
      if (mipmaps && isWebGL2) glCtx.generateMipmap(glCtx.TEXTURE_2D);
    };

    const createGreyTexture = (): WebGLTexture | null => {
      const texture = glCtx.createTexture();
      if (!texture) return null;
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
      glCtx.texImage2D(
        glCtx.TEXTURE_2D,
        0,
        glCtx.RGBA,
        1,
        1,
        0,
        glCtx.RGBA,
        glCtx.UNSIGNED_BYTE,
        new Uint8Array([214, 214, 214, 255]), // light grey placeholder
      );
      setTextureParams(false);
      return texture;
    };

    const buildMedia = (resolved: ResolvedSlide[]): MediaEntry[] => {
      const buildId = (mediaBuildId += 1);
      return resolved.map((slide) => {
        const entry: MediaEntry = {
          texture: createGreyTexture(),
          aspect: null,
          video: null,
        };

        if (!slide.src) {
          const placeholder = createGradientPlaceholder(slide.hue);
          uploadSource(entry, placeholder, true);
          entry.aspect = 1;
          return entry;
        }

        if (slide.isVideo) {
          const video = document.createElement("video");
          video.muted = true;
          video.defaultMuted = true;
          video.loop = true;
          video.playsInline = true;
          video.preload = "auto";
          video.crossOrigin = "anonymous";
          video.setAttribute("muted", "");
          video.setAttribute("playsinline", "");
          entry.video = video;
          video.addEventListener("loadedmetadata", () => {
            if (video.videoWidth > 0 && video.videoHeight > 0)
              entry.aspect = video.videoWidth / video.videoHeight;
          });
          video.addEventListener("loadeddata", () => {
            void video.play().catch(() => {
              // Autoplay blocked; the poster-less first frame still shows.
            });
          });
          video.src = slide.src;
          return entry;
        }

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
          if (disposed || buildId !== mediaBuildId) return;
          if (image.naturalWidth > 0 && image.naturalHeight > 0)
            entry.aspect = image.naturalWidth / image.naturalHeight;
          uploadSource(entry, image, true);
        };
        image.src = slide.src;
        return entry;
      });
    };

    const disposeMedia = (entries: MediaEntry[]): void => {
      for (const entry of entries) {
        if (entry.video) {
          entry.video.pause();
          entry.video.removeAttribute("src");
          entry.video.load(); // release the decoder
          entry.video = null;
        }
        if (entry.texture) glCtx.deleteTexture(entry.texture);
        entry.texture = null;
      }
    };

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const buildProgram = (): boolean => {
      const vs = compileShader(glCtx.VERTEX_SHADER, VERTEX_SRC);
      const fs = compileShader(glCtx.FRAGMENT_SHADER, FRAGMENT_SRC);
      if (!vs || !fs) {
        if (vs) glCtx.deleteShader(vs);
        if (fs) glCtx.deleteShader(fs);
        return false;
      }
      const linked = glCtx.createProgram();
      if (!linked) {
        glCtx.deleteShader(vs);
        glCtx.deleteShader(fs);
        return false;
      }
      glCtx.attachShader(linked, vs);
      glCtx.attachShader(linked, fs);
      glCtx.linkProgram(linked);
      glCtx.deleteShader(vs);
      glCtx.deleteShader(fs);
      if (!glCtx.getProgramParameter(linked, glCtx.LINK_STATUS)) {
        glCtx.deleteProgram(linked);
        return false;
      }
      program = linked;
      glCtx.useProgram(program);
      aUv = glCtx.getAttribLocation(program, "aUv");
      for (const name of UNIFORM_NAMES) {
        uniforms[name] = glCtx.getUniformLocation(program, name);
      }
      return true;
    };

    const buildStrip = (): boolean => {
      const vertices: number[] = [];
      for (let i = 0; i <= SEGMENT_COUNT; i += 1) {
        const u = i / SEGMENT_COUNT;
        vertices.push(u, 0, u, 1);
      }
      const buffer = glCtx.createBuffer();
      if (!buffer) return false;
      stripBuffer = buffer;
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffer);
      glCtx.bufferData(
        glCtx.ARRAY_BUFFER,
        new Float32Array(vertices),
        glCtx.STATIC_DRAW,
      );
      glCtx.enableVertexAttribArray(aUv);
      glCtx.vertexAttribPointer(aUv, 2, glCtx.FLOAT, false, 0, 0);
      return true;
    };

    const buildAll = (): void => {
      if (!buildProgram()) return;
      buildStrip();
      greyTexture = createGreyTexture();
      glCtx.enable(glCtx.BLEND);
      // Premultiplied output: ONE, ONE_MINUS_SRC_ALPHA.
      glCtx.blendFunc(glCtx.ONE, glCtx.ONE_MINUS_SRC_ALPHA);
      glCtx.disable(glCtx.DEPTH_TEST);
      glCtx.disable(glCtx.CULL_FACE);
      glCtx.clearColor(0, 0, 0, 0);
      mediaKey = ""; // force media rebuild on the next frame
    };

    buildAll();

    const resize = (): void => {
      const rect = root.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      const width = Math.round(W * dpr);
      const height = Math.round(H * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      glCtx.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(root);

    /* ------------------------------------------------------------------
     * Interaction handlers. All read latest props via propsRef so Framer
     * control edits apply live without rebuilding GL resources.
     * ---------------------------------------------------------------- */

    const cancelTween = (): void => {
      tween = null;
    };

    const noteInteraction = (extraMs = INTERACTION_PAUSE_MS): void => {
      interactionUntil = performance.now() + extraMs;
    };

    const targetWidth = (index: number): number => {
      const p = propsRef.current;
      const cardH = clamp(numberOr(p.cardHeight, 220), 80, 800);
      if (p.fixedAspect !== false) {
        return cardH * clamp(numberOr(p.aspectRatio, PROVISIONAL_ASPECT), MIN_ASPECT, MAX_ASPECT);
      }
      const media = mediaEntries[index]?.aspect ?? PROVISIONAL_ASPECT;
      return cardH * clamp(media, MIN_ASPECT, MAX_ASPECT);
    };

    const layout = (): { left: number[]; period: number; step: number } => {
      const p = propsRef.current;
      const gap = clamp(numberOr(p.gap, 16), 0, 80);
      const resolved = slidesRef.current;
      const left = new Array<number>(resolved.length);
      let period = 0;
      for (let i = 0; i < resolved.length; i += 1) {
        left[i] = period;
        period += (widths[i] ?? 0) + gap;
      }
      return { left, period, step: resolved.length > 0 ? period / resolved.length : 1 };
    };

    const startTween = (delta: number, durationMs: number): void => {
      tween = { from: pos, delta, start: performance.now(), durationMs };
      v = 0;
      noteInteraction(durationMs + FOCUS_PAUSE_EXTRA_MS);
    };

    const focusCard = (index: number): void => {
      const { left, period } = layout();
      if (period <= 0) return;
      const centre = (left[index] ?? 0) + (widths[index] ?? 0) / 2;
      startTween(wrapSigned(centre - pos, period), FOCUS_TWEEN_MS);
    };

    const nearestCardIndex = (): number => {
      const { left, period } = layout();
      let best = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < left.length; i += 1) {
        const centre = (left[i] ?? 0) + (widths[i] ?? 0) / 2;
        const distance = Math.abs(wrapSigned(centre - pos, period));
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      return best;
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (!event.isPrimary) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Capture can fail for synthetic events; dragging still works.
      }
      dragging = true;
      dragPointerId = event.pointerId;
      downX = event.clientX;
      downY = event.clientY;
      lastX = event.clientX;
      lastMoveTime = performance.now();
      v = 0;
      cancelTween();
      noteInteraction();
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent): void => {
      if (!dragging || event.pointerId !== dragPointerId) return;
      const now = performance.now();
      const dx = event.clientX - lastX;
      const elapsed = Math.max(0.001, (now - lastMoveTime) / 1000);
      pos -= dx;
      const instant = -dx / elapsed;
      v = 0.6 * v + 0.4 * instant;
      lastX = event.clientX;
      lastMoveTime = now;
      noteInteraction();
    };

    /** Hit-test the copies drawn last frame using the same curve formula. */
    const hitTest = (
      px: number,
      py: number,
    ): { index: number; base: number; cx: number; w: number } | null => {
      const p = propsRef.current;
      const flat = clamp(numberOr(p.flatWidth, 0.4), 0, 0.9);
      const curvature = clamp(numberOr(p.curvature, 1.4), 0, 4);
      const speedDistortion = clamp(numberOr(p.speedDistortion, 0.5), 0, 2);
      const cardH = clamp(numberOr(p.cardHeight, 220), 80, 800);
      const side = clamp((px - W / 2) / (W / 2), -1.4, 1.4);
      const e = clamp((Math.abs(side) - flat) / Math.max(1 - flat, 0.001), 0, 1.4);
      const scaleY =
        1 + curvature * e * e * (1 + speedDistortion * Math.abs(sv) * 1.5);

      let best: DrawnCard | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const card of drawn) {
        if (Math.abs(px - card.cx) > card.w / 2) continue;
        const cy = H / 2 + card.offsetY;
        if (Math.abs(py - cy) > (cardH * scaleY) / 2) continue;
        const distance = Math.abs(card.cx - W / 2);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = card;
        }
      }
      return best ? { index: best.index, base: best.base, cx: best.cx, w: best.w } : null;
    };

    const openLink = (href: string, newTab: boolean): void => {
      if (newTab) {
        window.open(href, "_blank", "noopener");
      } else {
        window.location.assign(href);
      }
    };

    const handleTap = (event: PointerEvent): void => {
      const p = propsRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      const hit = hitTest(px, py);
      if (!hit) return;
      noteInteraction();
      const resolved = slidesRef.current;
      const slide = resolved[hit.index];
      if (!slide) return;
      const centred = Math.abs(hit.cx - W / 2) <= hit.w / 2;
      if (centred && slide.link) {
        openLink(slide.link, slide.newTab);
        return;
      }
      if (p.clickToFocus !== false) {
        startTween(hit.base, CLICK_TWEEN_MS);
      }
    };

    const onPointerUp = (event: PointerEvent): void => {
      if (!dragging || event.pointerId !== dragPointerId) return;
      const wasTap =
        Math.hypot(event.clientX - downX, event.clientY - downY) < CLICK_SLOP_PX;
      dragging = false;
      dragPointerId = -1;
      try {
        if (canvas.hasPointerCapture(event.pointerId))
          canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore capture edge cases (synthetic events, older browsers).
      }
      canvas.style.cursor = "grab";
      if (performance.now() - lastMoveTime > STALE_RELEASE_MS) v = 0;
      noteInteraction();
      if (wasTap && event.type === "pointerup") handleTap(event);
    };

    const onPointerCancel = (event: PointerEvent): void => {
      if (!dragging || event.pointerId !== dragPointerId) return;
      dragging = false;
      dragPointerId = -1;
      v = 0;
      canvas.style.cursor = "grab";
      noteInteraction();
    };

    const onPointerEnter = (): void => {
      hovered = true;
    };

    const onPointerLeave = (): void => {
      hovered = false;
    };

    const onWheel = (event: WheelEvent): void => {
      const p = propsRef.current;
      if (p.wheel === false) return;
      // Horizontal delta, or Shift+vertical. Plain vertical scroll is never hijacked.
      let delta = 0;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
        delta = event.deltaX;
      } else if (event.shiftKey) {
        delta = event.deltaY;
      } else {
        return;
      }
      if (event.deltaMode === 1) delta *= 16; // lines -> px (simplest robust option)
      if (!delta) return;
      event.preventDefault();
      cancelTween();
      v = clamp(v + delta * 6, -5000, 5000);
      noteInteraction();
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      const p = propsRef.current;
      if (p.keyboard === false) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const current = nearestCardIndex();
      if (current < 0) return;
      event.preventDefault();
      const count = slidesRef.current.length;
      const next =
        event.key === "ArrowRight"
          ? (current + 1) % count
          : (current - 1 + count) % count;
      focusCard(next);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("keydown", onKeyDown);

    /* ------------------------------------------------------------------
     * Frame loop
     * ---------------------------------------------------------------- */

    const entranceFor = (
      screenCx: number,
      step: number,
      now: number,
    ): { alpha: number; offsetX: number; offsetY: number } => {
      const p = propsRef.current;
      if (reduceMotionRef.current) return { alpha: 1, offsetX: 0, offsetY: 0 };
      const mode = p.entrance ?? "lift";
      if (mode === "none") return { alpha: 1, offsetX: 0, offsetY: 0 };
      const duration = Math.max(numberOr(p.duration, 0.9), 0.1) * 1000;
      const stagger = clamp(numberOr(p.stagger, 0.08), 0, 0.5) * 1000;
      const cardH = clamp(numberOr(p.cardHeight, 220), 80, 800);
      const delay = (Math.abs(screenCx) / Math.max(step, 1)) * stagger;
      const raw = clamp((now - mountTime - delay) / duration, 0, 1);
      const eased = easeOutCubic(raw);
      const inverse = 1 - eased;
      const direction = screenCx >= W / 2 ? 1 : -1;
      if (mode === "lift")
        return { alpha: eased, offsetX: 0, offsetY: inverse * cardH * 0.35 };
      // Slide starts off to the nearest side and settles into place.
      if (mode === "slide")
        return { alpha: eased, offsetX: direction * inverse * W * 0.12, offsetY: 0 };
      return { alpha: eased, offsetX: 0, offsetY: 0 }; // dissolve
    };

    const drawCard = (
      index: number,
      uX: number,
      width: number,
      cardH: number,
      alpha: number,
      offsetX: number,
      offsetY: number,
      beta: {
        flat: number;
        curvature: number;
        speedDistortion: number;
        fringe: number;
        radius: number;
        coverX: number;
        coverY: number;
      },
    ): void => {
      if (!program) return;
      glCtx.uniform1f(uniforms.uX, uX);
      glCtx.uniform2f(uniforms.uOffset, offsetX, offsetY);
      glCtx.uniform1f(uniforms.uCenterY, H / 2);
      glCtx.uniform1f(uniforms.uCardW, width);
      glCtx.uniform1f(uniforms.uCardH, cardH);
      glCtx.uniform1f(uniforms.uW2, W / 2);
      glCtx.uniform1f(uniforms.uH2, H / 2);
      glCtx.uniform1f(uniforms.uFlat, beta.flat);
      glCtx.uniform1f(uniforms.uCurvature, beta.curvature);
      glCtx.uniform1f(uniforms.uSpeed, sv);
      glCtx.uniform1f(uniforms.uSpeedDistortion, beta.speedDistortion);
      glCtx.uniform1f(uniforms.uFringe, beta.fringe);
      glCtx.uniform1f(uniforms.uRadius, beta.radius);
      glCtx.uniform1f(uniforms.uAlpha, alpha);
      glCtx.uniform2f(uniforms.uCover, beta.coverX, beta.coverY);
      glCtx.activeTexture(glCtx.TEXTURE0);
      glCtx.bindTexture(
        glCtx.TEXTURE_2D,
        mediaEntries[index]?.texture ?? greyTexture,
      );
      glCtx.uniform1i(uniforms.uTexture, 0);
      glCtx.drawArrays(glCtx.TRIANGLE_STRIP, 0, (SEGMENT_COUNT + 1) * 2);
    };

    const renderFrame = (now: number): void => {
      const p = propsRef.current;
      const resolved = slidesRef.current;
      const cardH = clamp(numberOr(p.cardHeight, 220), 80, 800);
      const beta = {
        flat: clamp(numberOr(p.flatWidth, 0.4), 0, 0.9),
        curvature: clamp(numberOr(p.curvature, 1.4), 0, 4),
        speedDistortion: clamp(numberOr(p.speedDistortion, 0.5), 0, 2),
        fringe: clamp(numberOr(p.colorFringe, 0.6), 0, 2),
        radius: clamp(numberOr(p.radius, 0), 0, 80),
        coverX: 1,
        coverY: 1,
      };

      glCtx.clear(glCtx.COLOR_BUFFER_BIT);
      drawn.length = 0;

      const { left, period, step } = layout();
      if (period <= 0) return;

      for (let i = 0; i < resolved.length; i += 1) {
        const width = widths[i] ?? 0;
        if (width <= 0) continue;
        const centre = (left[i] ?? 0) + width / 2;
        const base = wrapSigned(centre - pos, period);
        const halfW = width / 2;
        const mMin = Math.ceil((-W / 2 - halfW - base) / period);
        const mMax = Math.floor((W / 2 + halfW - base) / period);

        const imgAspect = mediaEntries[i]?.aspect;
        const cardAspect = width / cardH;
        if (imgAspect && imgAspect > 0) {
          if (cardAspect > imgAspect) {
            beta.coverX = 1;
            beta.coverY = imgAspect / cardAspect;
          } else {
            beta.coverX = cardAspect / imgAspect;
            beta.coverY = 1;
          }
        } else {
          beta.coverX = 1;
          beta.coverY = 1;
        }

        for (let m = mMin; m <= mMax; m += 1) {
          const offset = base + m * period;
          const screenCx = W / 2 + offset;
          const entrance = entranceFor(screenCx, step, now);
          drawCard(
            i,
            screenCx - halfW,
            width,
            cardH,
            entrance.alpha,
            entrance.offsetX,
            entrance.offsetY,
            beta,
          );
          if (drawn.length < 512) {
            drawn.push({
              index: i,
              cx: screenCx + entrance.offsetX,
              offsetY: entrance.offsetY,
              w: width,
              base,
            });
          }
        }
      }
    };

    const tick = (now: number): void => {
      raf = requestAnimationFrame(tick);
      if (disposed) return;
      const dt = clamp((now - lastFrame) / 1000, 0, 0.05);
      lastFrame = now;
      if (!inView || glLost) return; // RAF stays alive; work is skipped.

      const p = propsRef.current;
      const resolved = slidesRef.current;

      // Rebuild media only when sources change (or after a context restore).
      const key = slidesKey(resolved);
      if (key !== mediaKey) {
        disposeMedia(mediaEntries);
        mediaEntries = buildMedia(resolved);
        mediaKey = key;
        widths = resolved.map(() => 0).map((_, index) => targetWidth(index));
      }

      if (!posSeeded && widths.length > 0) {
        pos = (widths[0] ?? 0) / 2;
        prevPos = pos;
        posSeeded = true;
      }

      // Ease widths toward targets (smooth re-layout once media loads).
      const resizeBlend = 1 - Math.exp(-dt * 8);
      for (let i = 0; i < resolved.length; i += 1) {
        widths[i] = (widths[i] ?? targetWidth(i)) + (targetWidth(i) - (widths[i] ?? 0)) * resizeBlend;
      }

      // Physics.
      const reduce = reduceMotionRef.current;
      const autoWanted = p.autoplay !== false && !reduce;
      const pausedForHover = p.pauseOnHover !== false && hovered;
      const pausedForInteraction = now < interactionUntil;
      const autoTarget =
        autoWanted && !pausedForHover && !pausedForInteraction && !dragging
          ? clamp(numberOr(p.autoSpeed, 40), -400, 400)
          : 0;

      if (tween) {
        const t = clamp((now - tween.start) / tween.durationMs, 0, 1);
        pos = tween.from + tween.delta * easeInOutCubic(t);
        v = 0;
        if (t >= 1) tween = null;
      } else if (!dragging) {
        // Weightier momentum glides longer: release rate drops as it rises.
        const rate = 9 - 7 * clamp(numberOr(p.momentum, 0.6), 0, 1);
        v += (autoTarget - v) * (1 - Math.exp(-dt * rate));
        pos += v * dt;
      }

      const instantSpeed = dt > 0 ? (pos - prevPos) / dt : 0;
      prevPos = pos;
      const svTarget = clamp(instantSpeed / 2500, -1, 1);
      sv += (svTarget - sv) * (1 - Math.exp(-dt * 12));

      // Videos re-upload every frame, only while actually playing.
      for (const entry of mediaEntries) {
        const video = entry.video;
        if (video && video.readyState >= 2 && !video.paused) {
          uploadSource(entry, video, false);
        }
      }

      renderFrame(now);
    };

    const onContextLost = (event: Event): void => {
      event.preventDefault(); // enables webglcontextrestored
      glLost = true;
      cancelAnimationFrame(raf);
    };

    const onContextRestored = (): void => {
      if (disposed) return;
      mediaKey = "";
      buildAll();
      resize();
      glLost = false;
      lastFrame = performance.now();
      prevPos = pos;
      raf = requestAnimationFrame(tick);
    };

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      disposeMedia(mediaEntries);
      if (greyTexture) glCtx.deleteTexture(greyTexture);
      if (stripBuffer) glCtx.deleteBuffer(stripBuffer);
      if (program) glCtx.deleteProgram(program);
    };
    // The mount effect owns all GL state; prop changes flow through refs.
  }, []);

  return (
    <div
      ref={rootRef}
      className={props.className}
      role="region"
      aria-roledescription="media carousel"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: props.background ?? "#ececec",
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Drag or use the arrow keys to browse"
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "grab",
          touchAction: "pan-y",
          userSelect: "none",
          WebkitUserSelect: "none",
          outline: "none",
        }}
      />
      <ol style={srOnlyStyle}>
        {Array.from({ length: slideCount }, (_, index) => (
          <li key={index}>{`Slide ${index + 1}`}</li>
        ))}
      </ol>
    </div>
  );
};

/* =============================================================================
 * 5. DEFAULTS AND EXPORT
 * ===========================================================================*/

const DEFAULT_PROPS = {
  items: [] as StreamlineItem[],
  background: "#ececec",
  cardHeight: 220,
  fixedAspect: true,
  aspectRatio: 1.25,
  gap: 16,
  radius: 0,
  flatWidth: 0.4,
  curvature: 1.4,
  colorFringe: 0.6,
  speedDistortion: 0.5,
  autoplay: true,
  autoSpeed: 40,
  pauseOnHover: true,
  momentum: 0.6,
  wheel: true,
  keyboard: true,
  clickToFocus: true,
  entrance: "lift" as StreamlineEntrance,
  duration: 0.9,
  stagger: 0.08,
};

export { StreamlineCarousel };
