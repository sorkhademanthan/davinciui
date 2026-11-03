/**
 * CrumpledPaperReveal
 * -----------------------------------------------------------------------------
 * A Framer code component that turns one image into a tactile paper reveal.
 * At progress 0 the image is a tight, faceted paper wad. Hovering (or clicking,
 * scrolling into view, etc.) unfolds it into a flat print that keeps its creases.
 *
 * Usage
 *   Drop the component on a canvas, pick an image, choose a trigger and tune the
 *   paper controls. Everything is procedural: no external assets are required.
 *
 * Browser support
 *   WebGL2 (Chrome, Edge, Firefox, Safari 15+). If WebGL2 or the image texture
 *   is unavailable, the component renders a flat CSS print instead.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 320
 * @framerDisableUnlink
 */

import * as React from "react";
import { addPropertyControls, ControlType, RenderTarget } from "framer";

/* =============================================================================
 * 1. CONSTANTS
 * ===========================================================================*/

const INTRINSIC_WIDTH = 320;

// [MEASURED] from the reference recording
const BALL_WIDTH_RATIO = 0.5; // ball width / sheet width
const BALL_HEIGHT_RATIO = 0.65; // ball height / sheet height
const SHADOW_OFFSET_X = 0.05; // of sheet width, down-right
const SHADOW_OFFSET_Y = 0.06; // of sheet height
const SHADOW_BLUR = 0.045; // of sheet width
const SHADOW_OPACITY = 0.35; // at shadow = 0.5
const FLAT_MARGIN_RATIO = 0.05; // baked photo margin, informational

// [MEASURED] timing, in seconds at duration = 1
const REVEAL_DURATION = 1.0;
const COLLAPSE_RATIO = 0.6;
const NEAR_FLAT_POINT = 0.6;
const SETTLE_POINT = 0.9;

// [ASSUMED] organic feel
const STAGGER = 0.35;
const BILLOW_AMOUNT = 0.14;
const BILLOW_RIPPLE = 0.11; // [ASSUMED] out-of-plane ripple amplitude
const BILLOW_DOME = 0.075; // [ASSUMED] centre dome amplitude
const ANTICIPATION_AMOUNT = 0.1;
const ANTICIPATION_WINDOW = 0.4;
const SPRING_DAMPING = 0.58; // [ASSUMED] ~10-12% first overshoot
const SPRING_OMEGA = 7.0;

// Canvas padding. The reference check in the brief says 128px must contain the
// billow at a 320px sheet. It does (0.15 * 400px = 60px total, 30px per side),
// but we scale it up on larger sheets so the shadow and curl never clip.
const MIN_PAD = 128;
const PAD_RATIO = 0.4;

const MAX_TEXTURE_SIZE = 2048;

// [ASSUMED] values used by the reference look. Kept here so they are easy to tune.
const BALL_FACET_FREQ = 9; // ~9 x 11 cells => 45-70 visible facets on a 4:5 sheet
const BALL_FACET_AMP = 0.042;
const CREASE_LINE_COUNT = 3;
const CREASE_LINE_WIDTH_PX = 1.35;
const FOLD_LINE_WIDTH_PX = 1.6;
const CURL_LIFT = 0.2; // [ASSUMED] out-of-plane corner lift
const CURL_PULL = 0.04; // [ASSUMED] in-plane corner pull
const FLAT_SHADOW_OPACITY = 0.22; // at shadow = 1
const FLAT_SHADOW_OFFSET_X = 0.01; // [ASSUMED] of sheet width
const FLAT_SHADOW_OFFSET_Y = 0.014; // [ASSUMED] of sheet height

/* =============================================================================
 * 2. TYPES
 * ===========================================================================*/

type Trigger = "hover" | "click" | "inView" | "scroll";
type EasingName = "Smooth" | "Snappy" | "Springy";
type FoldMode = "none" | "half" | "thirds";
type FinishName = "matte" | "satin" | "gloss";
type AspectName = "1:1" | "4:5" | "3:4" | "4:3" | "3:2" | "16:9";
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

type ImageProp =
  | string
  | { src?: string; srcSet?: string; alt?: string; sizes?: string }
  | null
  | undefined;

type LinkProp = string | { href?: string; target?: string } | null | undefined;

interface Props {
  image?: ImageProp;
  alt?: string;
  focalX?: number;
  focalY?: number;
  link?: LinkProp;
  trigger?: Trigger;
  replay?: boolean;
  duration?: number;
  easing?: EasingName;
  scrollStart?: number;
  scrollEnd?: number;
  fold?: FoldMode;
  shape?: ShapeName;
  aspect?: AspectName;
  paperColor?: string;
  backColor?: string;
  margin?: number;
  radius?: number;
  finish?: FinishName;
  creaseDepth?: number;
  ballSize?: number;
  shadow?: number;
  curl?: number;
  pointerLight?: boolean;
}

const DEFAULTS: Required<Omit<Props, "image" | "link">> = {
  alt: "",
  focalX: 50,
  focalY: 50,
  trigger: "hover",
  replay: false,
  duration: 1.0,
  easing: "Springy",
  scrollStart: 85,
  scrollEnd: 25,
  fold: "none",
  shape: "Tight Wad",
  aspect: "4:5",
  paperColor: "#F4EFE4",
  backColor: "#EFE8D8",
  margin: 0,
  radius: 0,
  finish: "matte",
  creaseDepth: 0.5,
  ballSize: 0.45,
  shadow: 0.5,
  curl: 0.3,
  pointerLight: true,
};

const ASPECTS: Record<AspectName, [number, number]> = {
  "1:1": [1, 1],
  "4:5": [4, 5],
  "3:4": [3, 4],
  "4:3": [4, 3],
  "3:2": [3, 2],
  "16:9": [16, 9],
};

interface ShapeParams {
  ax: number;
  ay: number;
  az: number;
  n: number;
  taper: number;
  twist: number;
  freq: number;
  amp: number;
}

/**
 * Shape parameter table.
 *   ax/ay/az : ellipsoid radius multipliers (x, y, depth)
 *   n        : superellipsoid exponent (2 = round, higher = boxier)
 *   taper    : positive narrows the top, negative narrows the bottom
 *   twist    : radians of y-dependent twist
 *   freq     : faceting frequency across the sheet width
 *   amp      : facet displacement, in world units (sheet height = 1)
 * Tight Wad reproduces the reference ball: 0.5 x sheet width, 0.65 x height.
 */
const SHAPES: Record<ShapeName, ShapeParams> = {
  Sphere: { ax: 1.35, ay: 0.85, az: 1.0, n: 2.0, taper: 0, twist: 0, freq: 12, amp: 0.018 },
  "Tight Wad": { ax: 1.0, ay: 1.0, az: 1.0, n: 2.2, taper: 0, twist: 0, freq: BALL_FACET_FREQ, amp: BALL_FACET_AMP },
  "Loose Wad": { ax: 1.15, ay: 1.05, az: 1.0, n: 1.9, taper: 0, twist: 0, freq: 6.5, amp: 0.038 },
  Egg: { ax: 1.0, ay: 1.12, az: 0.95, n: 2.05, taper: 0.55, twist: 0, freq: 8, amp: 0.032 },
  Pebble: { ax: 1.3, ay: 0.85, az: 0.8, n: 2.3, taper: 0, twist: 0, freq: 6, amp: 0.03 },
  Pillow: { ax: 1.2, ay: 1.05, az: 0.68, n: 2.5, taper: 0, twist: 0, freq: 4.2, amp: 0.022 },
  Cube: { ax: 1.1, ay: 1.0, az: 1.0, n: 8.0, taper: 0, twist: 0, freq: 3.5, amp: 0.02 },
  Shard: { ax: 1.1, ay: 1.15, az: 0.8, n: 3.2, taper: -0.35, twist: 0.2, freq: 5, amp: 0.075 },
  Cone: { ax: 0.95, ay: 1.25, az: 0.85, n: 2.2, taper: 0.95, twist: 0, freq: 7, amp: 0.038 },
  Disc: { ax: 1.35, ay: 0.75, az: 0.55, n: 2.2, taper: 0, twist: 0, freq: 6, amp: 0.03 },
  Twist: { ax: 1.0, ay: 1.0, az: 0.9, n: 2.2, taper: 0, twist: 0.85, freq: 7, amp: 0.045 },
  Burst: { ax: 1.05, ay: 1.05, az: 1.0, n: 2.6, taper: 0, twist: 0, freq: 13, amp: 0.085 },
};

const FINISH_INDEX: Record<FinishName, number> = { matte: 0, satin: 1, gloss: 2 };
const FOLD_INDEX: Record<FoldMode, number> = { none: 0, half: 1, thirds: 2 };

const CSS = `.crumple-reveal-sheet{position:absolute;inset:0;display:block;outline:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
.crumple-reveal-sheet:focus-visible{outline:2px solid var(--crumple-focus,#0A84FF);outline-offset:4px}`;

/* =============================================================================
 * 3. GLSL
 * ===========================================================================*/

const COMMON_GLSL = `
float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
vec4 voronoi(vec2 x, float seed){
  vec2 n = floor(x);
  vec2 f = fract(x);
  float f1 = 8.0;
  float f2 = 8.0;
  vec2 cell = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g + seed * 0.137);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; cell = n + g; }
      else if (d < f2) { f2 = d; }
    }
  }
  f1 = sqrt(f1);
  f2 = sqrt(f2);
  return vec4(f1, f2, hash12(cell + seed * 0.71), hash12(cell * 1.37 + seed + 7.1));
}
float sdRoundBox(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}
`;

const SHEET_VS = `#version 300 es
precision highp float;

in vec2 aUv;

uniform float uProgress;
uniform vec2 uScale;
uniform float uAspect;
uniform float uBallSize;
uniform vec2 uShapeAspect;
uniform float uShapeZ;
uniform float uShapeN;
uniform float uShapeTaper;
uniform float uShapeTwist;
uniform float uFacetFreq;
uniform float uFacetAmp;
uniform float uSeed;
uniform float uStagger;
uniform float uCurl;
uniform float uFoldMode;
uniform float uFlight;
uniform vec3 uLight;

out vec2 vUv;
out vec3 vWorld;
out float vBall;
out float vProgress;

${COMMON_GLSL}

float crumple(vec2 uv){
  vec2 fc = vec2(uFacetFreq, uFacetFreq / max(uAspect, 0.35));
  vec4 v1 = voronoi(uv * fc + uSeed * 0.7, uSeed);
  float w1 = smoothstep(0.0, 0.20, v1.y - v1.x);
  vec4 v2 = voronoi(uv * fc * 2.31 + 5.3 + uSeed, uSeed * 1.7);
  float w2 = smoothstep(0.0, 0.24, v2.y - v2.x);
  return ((v1.z - 0.5) * w1 + (v2.z - 0.5) * w2 * 0.28) * uFacetAmp;
}

vec3 ballBase(vec2 uv){
  vec2 p = (uv - 0.5) * 2.0;
  float ang = uShapeTwist * p.y;
  float c = cos(ang);
  float s = sin(ang);
  p = mat2(c, -s, s, c) * p;

  vec2 e = sign(p) * pow(abs(p), vec2(2.0 / uShapeN));
  float taper = 1.0 + uShapeTaper * (-p.y) * 0.5;
  e.x *= clamp(taper, 0.2, 1.9);

  float a = uAspect;
  float rx = ${BALL_WIDTH_RATIO} * a * uBallSize * uShapeAspect.x;
  float ry = ${BALL_HEIGHT_RATIO} * uBallSize * uShapeAspect.y;
  float rz = 0.45 * uBallSize * max(uShapeZ, 0.2);

  vec2 lat = e * vec2(rx, ry);
  vec2 q = lat / vec2(max(rx, 1e-4), max(ry, 1e-4));
  float n = length(q);
  if (n > 1.0) { lat /= n; q /= n; }
  float t = clamp(1.0 - dot(q, q), 0.0, 1.0);
  float z = rz * sqrt(t);

  vec3 pos = vec3(lat, z);
  vec3 nrm = normalize(vec3(
    lat.x / (rx * rx + 1e-4),
    lat.y / (ry * ry + 1e-4),
    z / (rz * rz + 1e-4) + 0.18
  ));
  pos += nrm * crumple(uv);

  float ax = (fract(uSeed * 0.731) * 2.0 - 1.0) * 0.16;
  float az = (fract(uSeed * 0.377) * 2.0 - 1.0) * 0.22;
  float cx = cos(ax);
  float sx = sin(ax);
  pos.yz = mat2(cx, -sx, sx, cx) * pos.yz;
  float cz = cos(az);
  float sz = sin(az);
  pos.xy = mat2(cz, -sz, sz, cz) * pos.xy;
  return pos;
}

vec3 flatPos(vec2 uv, float lp, float p){
  vec3 f = vec3((uv - 0.5) * vec2(uAspect, 1.0), 0.0);
  f.z += crumple(uv) * 0.05;

  float rip = sin(uv.x * 11.0 + uSeed) * sin(uv.y * 10.0 + uSeed * 1.7)
            + 0.5 * sin(uv.x * 19.0 - uSeed * 2.1) * sin(uv.y * 17.0 + uSeed);
  float billowEnv = sin(3.14159265 * clamp(uFlight / 0.85, 0.0, 1.0));
  float rr = length((uv - 0.5) * 2.0);
  f.z += ${BILLOW_RIPPLE} * billowEnv * rip;
  f.z += ${BILLOW_DOME} * billowEnv * (1.0 - rr * rr * 0.8);

  vec2 corner = vec2(uAspect, 1.0) * 0.5;
  vec2 dvc = (uv - 0.5) * vec2(uAspect, 1.0) - corner;
  float dc = length(dvc);
  float pointerCurl = 1.0 + 0.45
    * smoothstep(0.0, 0.7, uLight.x) * smoothstep(0.0, 0.7, -uLight.y);
  float cm = smoothstep(0.42, 0.0, dc) * uCurl * mix(0.4, 1.0, p) * pointerCurl;
  f.z += ${CURL_LIFT} * cm;
  f.xy += normalize(dvc + vec2(1e-4, 1e-4)) * ${CURL_PULL} * cm;

  if (uFoldMode > 0.5) {
    f.z += 0.004 * exp(-pow((uv.y - 0.5) / 0.004, 2.0)) * (0.5 + 0.5 * (1.0 - p));
    if (uFoldMode > 1.5) {
      f.z += 0.0035 * exp(-pow((uv.y - 0.33333) / 0.003, 2.0)) * (0.5 + 0.5 * (1.0 - p));
      f.z += 0.0035 * exp(-pow((uv.y - 0.66667) / 0.003, 2.0)) * (0.5 + 0.5 * (1.0 - p));
    }
  }
  return f;
}

void main(){
  float p = clamp(uProgress, 0.0, 1.0);
  float dist = length((aUv - 0.5) * vec2(max(uAspect, 0.35), 1.0))
             / length(vec2(max(uAspect, 0.35), 1.0) * 0.5);
  float delay = uStagger * clamp(0.62 * dist + 0.38 * vnoise(aUv * 3.1 + uSeed), 0.0, 1.0);
  float lp = clamp(uProgress * (1.0 + uStagger) - delay, 0.0, 1.0);
  float lps = smoothstep(0.0, 1.0, lp);

  vec3 fp = flatPos(aUv, lps, p);
  vec3 bp = ballBase(aUv);
  vec3 pos = mix(bp, fp, lps);

  float squeeze = 1.0 - ${ANTICIPATION_AMOUNT} * sin(3.14159265 * clamp(p / ${ANTICIPATION_WINDOW}, 0.0, 1.0));
  float billow = 1.0 + ${BILLOW_AMOUNT} * sin(3.14159265 * clamp(uFlight / 0.85, 0.0, 1.0));
  pos *= squeeze * billow;

  vUv = aUv;
  vWorld = pos;
  vBall = 1.0 - lps;
  vProgress = p;

  gl_Position = vec4(pos.xy * uScale, -pos.z * 0.6, 1.0);
}
`;

const SHADOW_VS = `#version 300 es
precision highp float;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const SHADOW_FS = `#version 300 es
precision highp float;

uniform vec2 uScale;
uniform vec2 uPx;
uniform float uProgress;
uniform float uAspect;
uniform float uBallSize;
uniform vec2 uShapeAspect;
uniform float uRadiusWorld;
uniform float uShadow;
uniform float uFlight;

out vec4 fragColor;

${COMMON_GLSL}

void main(){
  vec2 ndc = (gl_FragCoord.xy / uPx) * 2.0 - 1.0;
  vec2 world = ndc / uScale;

  float p = clamp(uProgress, 0.0, 1.0);
  float flatMix = smoothstep(0.25, 0.85, p);

  float rx = ${BALL_WIDTH_RATIO} * uAspect * uBallSize * uShapeAspect.x;
  float ry = ${BALL_HEIGHT_RATIO} * uBallSize * uShapeAspect.y;
  vec2 halfBall = vec2(rx, ry) * 0.98;
  vec2 halfFlat = vec2(uAspect * 0.5, 0.5);
  vec2 halfSize = mix(halfBall, halfFlat, flatMix);
  halfSize *= 1.0 + ${BILLOW_AMOUNT} * sin(3.14159265 * clamp(uFlight / 0.85, 0.0, 1.0));

  float radius = mix(min(rx, ry) * 0.85, uRadiusWorld, flatMix);
  vec2 center = mix(vec2(${SHADOW_OFFSET_X} * uAspect, -${SHADOW_OFFSET_Y}), vec2(${FLAT_SHADOW_OFFSET_X} * uAspect, -${FLAT_SHADOW_OFFSET_Y}), flatMix);
  float blur = mix(${SHADOW_BLUR} * uAspect, 0.0065, flatMix);
  float op = mix(${SHADOW_OPACITY * 2}, ${FLAT_SHADOW_OPACITY}, flatMix) * uShadow;

  float sd = sdRoundBox(world - center, halfSize, max(0.0, radius));
  float a = (1.0 - smoothstep(-blur * 0.5, blur, sd)) * op;
  fragColor = vec4(vec3(0.275, 0.227, 0.176) * a, a);
}
`;

const SHEET_FS = `#version 300 es
precision highp float;

in vec2 vUv;
in vec3 vWorld;
in float vBall;
in float vProgress;

uniform sampler2D uImage;
uniform float uImageAspect;
uniform vec2 uFocal;
uniform float uAspect;
uniform vec2 uMarginWorld;
uniform float uRadiusWorld;
uniform float uPxWorld;
uniform vec3 uPaperColor;
uniform vec3 uBackColor;
uniform float uFinish;
uniform float uCreaseDepth;
uniform float uFacetFreq;
uniform float uSeed;
uniform float uFoldMode;
uniform vec3 uLight;
uniform vec4 uLine0;
uniform vec4 uLine1;
uniform vec4 uLine2;

out vec4 fragColor;

${COMMON_GLSL}

void main(){
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)) + vec3(1e-6, 1e-6, 1e-6));
  bool isBack = n.z < -0.28;
  vec3 ng = isBack ? -n : n;

  vec2 fc = vec2(uFacetFreq, uFacetFreq / max(uAspect, 0.35));
  vec4 vor = voronoi(vUv * fc + uSeed * 0.7, uSeed);
  float edge = smoothstep(0.0, 0.16, vor.y - vor.x);
  vec2 tilt = vec2(
    hash12(vec2(vor.z * 37.1, 3.1) + uSeed),
    hash12(vec2(vor.z * 61.7, 9.7) + uSeed)
  ) * 2.0 - 1.0;
  float facetAmp = mix(0.055, 0.42, vBall) * (0.2 + 0.8 * uCreaseDepth);
  vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), ng) + vec3(1e-4, 0.0, 0.0));
  vec3 B = normalize(cross(ng, T));
  n = normalize(ng + (T * tilt.x + B * tilt.y) * facetAmp);

  vec4 lines[3] = vec4[3](uLine0, uLine1, uLine2);
  float lineShade = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 ln = lines[i];
    if (ln.w <= 0.001) continue;
    vec2 dir = normalize(ln.xy + 1e-5);
    float d = dot((vUv - 0.5) * vec2(uAspect, 1.0), dir) - ln.z;
    float w = max(${CREASE_LINE_WIDTH_PX} * uPxWorld, 0.0012);
    float m = (1.0 - smoothstep(0.0, w, abs(d))) * ln.w;
    lineShade += m;
    n = normalize(n + vec3(-dir.y * sign(d), dir.x * sign(d), 0.0) * m * 0.8 * uCreaseDepth);
  }

  float foldShade = 0.0;
  if (uFoldMode > 0.5) {
    float w = max(${FOLD_LINE_WIDTH_PX} * uPxWorld, 0.0014);
    float dy = vUv.y - 0.5;
    float m = 1.0 - smoothstep(0.0, w, abs(dy));
    foldShade += m;
    n = normalize(n + vec3(0.0, sign(dy) * m * 0.7 * uCreaseDepth, 0.0));
    if (uFoldMode > 1.5) {
      float d1 = vUv.y - 0.33333;
      float d2 = vUv.y - 0.66667;
      float m1 = (1.0 - smoothstep(0.0, w, abs(d1))) * 0.9;
      float m2 = (1.0 - smoothstep(0.0, w, abs(d2))) * 0.9;
      foldShade += m1 + m2;
      n = normalize(n + vec3(0.0, (sign(d1) * m1 + sign(d2) * m2) * 0.6 * uCreaseDepth, 0.0));
    }
  }

  vec2 iuv = (vUv - uMarginWorld) / max(vec2(1.0 - 2.0 * uMarginWorld), vec2(1e-4));
  float innerAspect = uAspect * (1.0 - 2.0 * uMarginWorld.x) / max(1.0 - 2.0 * uMarginWorld.y, 0.05);
  vec2 s = vec2(1.0);
  if (uImageAspect > innerAspect) s.x = innerAspect / uImageAspect;
  else s.y = uImageAspect / innerAspect;
  vec2 origin = clamp(uFocal - 0.5 * s, vec2(0.0), vec2(1.0) - s);
  vec2 tuv = origin + iuv * s;
  vec3 tex = texture(uImage, tuv).rgb;

  vec2 lp = (vUv - 0.5) * vec2(uAspect, 1.0);
  vec2 innerHalf = vec2(uAspect * (0.5 - uMarginWorld.x), 0.5 - uMarginWorld.y);
  float sdInner = sdRoundBox(lp, innerHalf, max(0.0, uRadiusWorld - uMarginWorld.y));
  float aa = max(1.25 * uPxWorld, 0.0008);
  float inMask = 1.0 - smoothstep(-aa, aa, sdInner);

  float grain = hash12(vUv * 511.0 + uSeed);
  vec3 marginCol = uPaperColor * (0.985 + 0.03 * grain);
  vec3 base = mix(marginCol, tex, inMask);
  if (isBack) base = uBackColor * (0.965 + 0.035 * grain);

  vec3 L = normalize(uLight);
  float diff = max(dot(n, L), 0.0);
  float flatLum = 0.72 + 0.34 * diff;
  float ballLum = 0.38 + 0.82 * pow(diff, 0.85);
  float lum = mix(flatLum, ballLum, vBall);

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float shin = mix(18.0, 55.0, vBall);
  float spec = pow(max(dot(n, H), 0.0), shin);
  float specK = uFinish < 0.5 ? 0.05 : (uFinish < 1.5 ? 0.22 : 0.65);

  vec3 col = base * lum;
  col += vec3(spec * specK * mix(0.55, 1.0, vBall));

  float cavity = (1.0 - edge) * mix(0.025, 0.34, vBall);
  col *= 1.0 - cavity;
  col *= 1.0 - (lineShade + foldShade) * mix(0.11, 0.17, vBall);
  col *= 0.985 + 0.03 * grain;
  col = max(col, vec3(0.0));

  float sd = sdRoundBox(lp, vec2(uAspect * 0.5, 0.5), max(0.0, uRadiusWorld));
  float alpha = 1.0 - smoothstep(-aa, aa, sd);
  alpha = mix(1.0, alpha, smoothstep(0.55, 0.9, clamp(vProgress, 0.0, 1.0)));
  if (alpha <= 0.002) discard;

  fragColor = vec4(col * alpha, alpha);
}
`;

/* =============================================================================
 * 4. MATH / EASING
 * ===========================================================================*/

const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Critically-underdamped spring step response. Damping ratio 0.58 gives a
 * first overshoot of ~1 + e^(-zeta*pi/sqrt(1-zeta^2)) = 1.11, matching the
 * 10-15% billow in the reference. The final 14% is blended to exactly 1 so
 * the component settles cleanly.
 */
function springEase(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const z = SPRING_DAMPING;
  const w = SPRING_OMEGA;
  const wd = w * Math.sqrt(1 - z * z);
  // Time-warp the spring: slow enough that the sheet reads flat around 0.6s,
  // then overshoots ~11% near 0.7s and settles by the end of the duration.
  const u = Math.pow(t, 1.9);
  const e = Math.exp(-z * w * u);
  const v = 1 - e * (Math.cos(wd * u) + ((z * w) / wd) * Math.sin(wd * u));
  return lerp(v, 1, smoothstep(0.9, 1, t));
}

function easingFn(name: EasingName): (t: number) => number {
  if (name === "Smooth") return easeInOutCubic;
  if (name === "Snappy") return easeOutExpo;
  return springEase;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type CreaseLine = [number, number, number, number];

function createCreaseLines(seed: number): CreaseLine[] {
  const rand = mulberry32(Math.floor(seed * 100000) + 17);
  const lines: CreaseLine[] = [];
  for (let i = 0; i < CREASE_LINE_COUNT; i++) {
    const angle = Math.PI * (0.15 + rand() * 0.7);
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    const offset = (rand() * 2 - 1) * 0.33;
    const strength = 0.55 + rand() * 0.45;
    lines.push([nx, ny, offset, strength]);
  }
  return lines;
}

function parseColor(input: string | undefined, fallback: [number, number, number]): [number, number, number] {
  if (!input) return fallback;
  const value = input.trim();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      if ([r, g, b].every((n) => Number.isFinite(n))) return [r, g, b];
    }
  }
  const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (match) {
    return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
  }
  return fallback;
}

function getImageSrc(image: ImageProp): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.src ?? "";
}

function getHref(link: LinkProp): string {
  if (!link) return "";
  if (typeof link === "string") return link;
  return link.href ?? "";
}

/* =============================================================================
 * 5. WEBGL HELPERS
 * ===========================================================================*/

interface RenderOptions {
  aspect: number;
  ballSize: number;
  shape: ShapeParams;
  paper: [number, number, number];
  back: [number, number, number];
  marginWorld: [number, number];
  radiusWorld: number;
  finish: number;
  creaseDepth: number;
  fold: number;
  shadow: number;
  curl: number;
  focal: [number, number];
  lines: CreaseLine[];
  pointerLight: boolean;
  seed: number;
}

type Uniforms = Map<string, WebGLUniformLocation | null>;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(`CrumpledPaperReveal: ${label} shader failed\n${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
  label: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource, `${label} vertex`);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource, `${label} fragment`);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(`CrumpledPaperReveal: ${label} program failed\n${gl.getProgramInfoLog(program)}`);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function collectUniforms(gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]): Uniforms {
  const map: Uniforms = new Map();
  for (const name of names) map.set(name, gl.getUniformLocation(program, name));
  return map;
}

const SHEET_UNIFORMS = [
  "uProgress", "uScale", "uAspect", "uBallSize", "uShapeAspect", "uShapeZ",
  "uShapeN", "uShapeTaper", "uShapeTwist", "uFacetFreq", "uFacetAmp", "uSeed",
  "uStagger", "uCurl", "uFoldMode", "uImage", "uImageAspect", "uFocal",
  "uMarginWorld", "uRadiusWorld", "uPxWorld", "uPaperColor", "uBackColor",
  "uFinish", "uCreaseDepth", "uLight", "uLine0", "uLine1", "uLine2", "uFlight",
];

const SHADOW_UNIFORMS = [
  "uScale", "uPx", "uProgress", "uAspect", "uBallSize", "uShapeAspect",
  "uRadiusWorld", "uShadow", "uFlight",
];

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(() => resolve(img)).catch(() => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function makePlaceholderCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#fbf7ee");
  grad.addColorStop(0.55, "#f2ebdc");
  grad.addColorStop(1, "#e7dcc7");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(43,58,91,0.16)";
  ctx.font = "italic 42px Georgia, 'Times New Roman', serif";
  const rows = [210, 300, 390, 480, 570, 660, 750, 900];
  const widths = [720, 800, 690, 780, 620, 760, 540, 360];
  rows.forEach((y, i) => {
    ctx.fillRect(120, y, widths[i] ?? 600, 14);
  });

  ctx.fillStyle = "rgba(43,58,91,0.28)";
  ctx.font = "italic 54px 'Snell Roundhand', 'Brush Script MT', cursive";
  ctx.fillText("with love", 610, 1100);

  return canvas;
}

class PaperRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private sheetProgram: WebGLProgram | null = null;
  private shadowProgram: WebGLProgram | null = null;
  private sheetVao: WebGLVertexArrayObject | null = null;
  private shadowVao: WebGLVertexArrayObject | null = null;
  private uvBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private indexCount = 0;
  private texture: WebGLTexture | null = null;
  private uniforms: Uniforms = new Map();
  private shadowUniforms: Uniforms = new Map();
  private attrUv = -1;

  private cssW = 1;
  private cssH = 1;
  private sheetH = 1;
  private dpr = 1;
  private pxW = 1;
  private pxH = 1;

  private options: RenderOptions | null = null;
  private imageAspect = 0.8;
  private imageSrc = "";
  private failedSrc = "";
  private disposed = false;
  private textureReady = false;
  private seed: number;

  constructor(canvas: HTMLCanvasElement, seed: number) {
    this.canvas = canvas;
    this.seed = seed;
  }

  init(): boolean {
    if (this.disposed) return false;
    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = this.canvas.getContext("webgl2", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        depth: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      console.warn("CrumpledPaperReveal: WebGL2 is unavailable, using the flat fallback.");
      return false;
    }
    this.gl = gl;

    const sheet = createProgram(gl, SHEET_VS, SHEET_FS, "sheet");
    const shadow = createProgram(gl, SHADOW_VS, SHADOW_FS, "shadow");
    if (!sheet || !shadow) {
      if (sheet) gl.deleteProgram(sheet);
      if (shadow) gl.deleteProgram(shadow);
      this.gl = null;
      return false;
    }
    this.sheetProgram = sheet;
    this.shadowProgram = shadow;
    this.uniforms = collectUniforms(gl, sheet, SHEET_UNIFORMS);
    this.shadowUniforms = collectUniforms(gl, shadow, SHADOW_UNIFORMS);

    this.buildGeometry();
    this.shadowVao = gl.createVertexArray();

    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    this.uploadPlaceholder();
    this.textureReady = true;
    return true;
  }

  private buildGeometry(): void {
    const gl = this.gl;
    if (!gl) return;
    const nx = 96;
    const ny = 120;
    const verts = new Float32Array((nx + 1) * (ny + 1) * 2);
    let p = 0;
    for (let y = 0; y <= ny; y++) {
      for (let x = 0; x <= nx; x++) {
        verts[p++] = x / nx;
        verts[p++] = y / ny;
      }
    }
    const indices = new Uint16Array(nx * ny * 6);
    let q = 0;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const a = y * (nx + 1) + x;
        const b = a + 1;
        const c = a + (nx + 1);
        const d = c + 1;
        indices[q++] = a;
        indices[q++] = b;
        indices[q++] = d;
        indices[q++] = a;
        indices[q++] = d;
        indices[q++] = c;
      }
    }
    this.indexCount = indices.length;
    this.uvBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.sheetVao = gl.createVertexArray();
    gl.bindVertexArray(this.sheetVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    this.attrUv = gl.getAttribLocation(this.sheetProgram!, "aUv");
    gl.enableVertexAttribArray(this.attrUv);
    gl.vertexAttribPointer(this.attrUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }

  setSize(cssW: number, cssH: number, dpr: number, sheetH: number): void {
    this.cssW = Math.max(1, cssW);
    this.cssH = Math.max(1, cssH);
    this.sheetH = Math.max(1, sheetH);
    this.dpr = Math.max(0.5, dpr);
    this.pxW = Math.max(1, Math.round(this.cssW * this.dpr));
    this.pxH = Math.max(1, Math.round(this.cssH * this.dpr));
    if (this.canvas.width !== this.pxW) this.canvas.width = this.pxW;
    if (this.canvas.height !== this.pxH) this.canvas.height = this.pxH;
    const gl = this.gl;
    if (gl) gl.viewport(0, 0, this.pxW, this.pxH);
  }

  setOptions(options: RenderOptions): void {
    this.options = options;
  }

  async setImage(src: string, onResult: (ok: boolean) => void): Promise<void> {
    if (this.disposed) return;
    const normalized = src.trim();
    if (!normalized) {
      if (!this.texture) this.uploadPlaceholder();
      this.textureReady = true;
      onResult(true);
      return;
    }
    if (normalized === this.imageSrc) {
      onResult(true);
      return;
    }
    if (normalized === this.failedSrc) {
      onResult(false);
      return;
    }
    this.imageSrc = normalized;
    try {
      const img = await loadImageElement(normalized);
      if (this.disposed) return;
      const max = MAX_TEXTURE_SIZE;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (!w || !h) throw new Error("empty image");
      const scale = Math.min(1, max / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2d context unavailable");
      ctx.drawImage(img, 0, 0, w, h);
      this.uploadCanvas(canvas);
      this.imageAspect = w / h;
      this.textureReady = true;
      onResult(true);
    } catch (error) {
      this.failedSrc = normalized;
      console.warn("CrumpledPaperReveal: image failed to load, using the flat fallback.", error);
      onResult(false);
    }
  }

  private uploadPlaceholder(): void {
    const canvas = makePlaceholderCanvas();
    this.uploadCanvas(canvas);
    this.imageAspect = canvas.width / canvas.height;
    this.textureReady = true;
  }

  private uploadCanvas(canvas: HTMLCanvasElement): void {
    const gl = this.gl;
    if (!gl) return;
    const texture = this.texture ?? gl.createTexture();
    if (!texture) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.texture = texture;
  }

  draw(progress: number, light: [number, number, number], flight = 0): void {
    const gl = this.gl;
    const o = this.options;
    if (!gl || !o || !this.sheetProgram || !this.shadowProgram) return;
    if (!this.texture) this.uploadPlaceholder();

    const scaleX = (2 * this.sheetH) / this.cssW;
    const scaleY = (2 * this.sheetH) / this.cssH;
    const pxWorld = 1 / this.sheetH;
    const p = clamp(progress, 0, 1);

    gl.viewport(0, 0, this.pxW, this.pxH);
    gl.clearColor(0, 0, 0, 0);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Shadow pass
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.useProgram(this.shadowProgram);
    this.setShadowUniform("uScale", () => gl.uniform2f(this.shadowU("uScale"), scaleX, scaleY));
    this.setShadowUniform("uPx", () => gl.uniform2f(this.shadowU("uPx"), this.pxW, this.pxH));
    this.setShadowUniform("uProgress", () => gl.uniform1f(this.shadowU("uProgress"), progress));
    this.setShadowUniform("uAspect", () => gl.uniform1f(this.shadowU("uAspect"), o.aspect));
    this.setShadowUniform("uBallSize", () => gl.uniform1f(this.shadowU("uBallSize"), o.ballSize));
    this.setShadowUniform("uShapeAspect", () => gl.uniform2f(this.shadowU("uShapeAspect"), o.shape.ax, o.shape.ay));
    this.setShadowUniform("uRadiusWorld", () => gl.uniform1f(this.shadowU("uRadiusWorld"), o.radiusWorld));
    this.setShadowUniform("uShadow", () => gl.uniform1f(this.shadowU("uShadow"), o.shadow));
    this.setShadowUniform("uFlight", () => gl.uniform1f(this.shadowU("uFlight"), flight));
    gl.bindVertexArray(this.shadowVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Sheet pass
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(true);
    gl.useProgram(this.sheetProgram);
    gl.bindVertexArray(this.sheetVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    const uf = (name: string, apply: (loc: WebGLUniformLocation | null) => void): void => {
      apply(this.uniforms.get(name) ?? null);
    };

    uf("uProgress", (l) => gl.uniform1f(l, progress));
    uf("uScale", (l) => gl.uniform2f(l, scaleX, scaleY));
    uf("uAspect", (l) => gl.uniform1f(l, o.aspect));
    uf("uBallSize", (l) => gl.uniform1f(l, o.ballSize));
    uf("uShapeAspect", (l) => gl.uniform2f(l, o.shape.ax, o.shape.ay));
    uf("uShapeZ", (l) => gl.uniform1f(l, o.shape.az));
    uf("uShapeN", (l) => gl.uniform1f(l, o.shape.n));
    uf("uShapeTaper", (l) => gl.uniform1f(l, o.shape.taper));
    uf("uShapeTwist", (l) => gl.uniform1f(l, o.shape.twist));
    uf("uFacetFreq", (l) => gl.uniform1f(l, o.shape.freq));
    uf("uFacetAmp", (l) => gl.uniform1f(l, o.shape.amp));
    uf("uSeed", (l) => gl.uniform1f(l, o.seed));
    uf("uStagger", (l) => gl.uniform1f(l, STAGGER));
    uf("uCurl", (l) => gl.uniform1f(l, o.curl));
    uf("uFoldMode", (l) => gl.uniform1f(l, o.fold));
    uf("uImage", (l) => gl.uniform1i(l, 0));
    uf("uImageAspect", (l) => gl.uniform1f(l, this.imageAspect || 0.8));
    uf("uFocal", (l) => gl.uniform2f(l, o.focal[0], o.focal[1]));
    uf("uMarginWorld", (l) => gl.uniform2f(l, o.marginWorld[0], o.marginWorld[1]));
    uf("uRadiusWorld", (l) => gl.uniform1f(l, o.radiusWorld));
    uf("uPxWorld", (l) => gl.uniform1f(l, pxWorld));
    uf("uPaperColor", (l) => gl.uniform3f(l, o.paper[0], o.paper[1], o.paper[2]));
    uf("uBackColor", (l) => gl.uniform3f(l, o.back[0], o.back[1], o.back[2]));
    uf("uFinish", (l) => gl.uniform1f(l, o.finish));
    uf("uCreaseDepth", (l) => gl.uniform1f(l, o.creaseDepth));
    uf("uLight", (l) => gl.uniform3f(l, light[0], light[1], light[2]));
    uf("uLine0", (l) => {
      const line = o.lines[0] ?? [0, 0, 0, 0];
      gl.uniform4f(l, line[0], line[1], line[2], line[3]);
    });
    uf("uLine1", (l) => {
      const line = o.lines[1] ?? [0, 0, 0, 0];
      gl.uniform4f(l, line[0], line[1], line[2], line[3]);
    });
    uf("uLine2", (l) => {
      const line = o.lines[2] ?? [0, 0, 0, 0];
      gl.uniform4f(l, line[0], line[1], line[2], line[3]);
    });
    uf("uFlight", (l) => gl.uniform1f(l, flight));

    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  private shadowU(name: string): WebGLUniformLocation | null {
    return this.shadowUniforms.get(name) ?? null;
  }

  private setShadowUniform(_name: string, apply: () => void): void {
    apply();
  }

  handleRestored(): void {
    if (this.disposed) return;
    this.disposeResources();
    const gl = this.canvas.getContext("webgl2");
    if (!gl) return;
    this.gl = gl;
    const sheet = createProgram(gl, SHEET_VS, SHEET_FS, "sheet");
    const shadow = createProgram(gl, SHADOW_VS, SHADOW_FS, "shadow");
    if (!sheet || !shadow) return;
    this.sheetProgram = sheet;
    this.shadowProgram = shadow;
    this.uniforms = collectUniforms(gl, sheet, SHEET_UNIFORMS);
    this.shadowUniforms = collectUniforms(gl, shadow, SHADOW_UNIFORMS);
    this.texture = null;
    this.buildGeometry();
    this.shadowVao = gl.createVertexArray();
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (this.imageSrc && this.imageSrc !== this.failedSrc) {
      void this.setImage(this.imageSrc, () => undefined);
    } else {
      this.uploadPlaceholder();
    }
  }

  private disposeResources(): void {
    const gl = this.gl;
    if (!gl) return;
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
    if (this.sheetVao) gl.deleteVertexArray(this.sheetVao);
    if (this.shadowVao) gl.deleteVertexArray(this.shadowVao);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.sheetProgram) gl.deleteProgram(this.sheetProgram);
    if (this.shadowProgram) gl.deleteProgram(this.shadowProgram);
    this.indexBuffer = null;
    this.uvBuffer = null;
    this.sheetVao = null;
    this.shadowVao = null;
    this.texture = null;
    this.sheetProgram = null;
    this.shadowProgram = null;
    this.uniforms = new Map();
    this.shadowUniforms = new Map();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    this.disposeResources();
    try {
      const lose = gl?.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    } catch {
      /* no-op */
    }
    this.gl = null;
  }
}

/* =============================================================================
 * 6. HOOKS
 * ===========================================================================*/

interface RevealConfig {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  height: number;
  dpr: number;
  pad: number;
  opts: RenderOptions;
  imageSrc: string;
  reduced: boolean;
  isCanvasTarget: boolean;
  trigger: Trigger;
  replay: boolean;
  duration: number;
  easing: EasingName;
  scrollStart: number;
  scrollEnd: number;
}

interface RevealApi {
  progressRef: React.MutableRefObject<number>;
  canvasReady: boolean;
  imageFailed: boolean;
  reveal: () => void;
  collapse: () => void;
  toggle: () => void;
  setPointer: (x: number, y: number) => void;
  resetPointer: () => void;
}

interface Anim {
  from: number;
  to: number;
  start: number;
  dur: number;
  ease: (t: number) => number;
}

const DEFAULT_LIGHT: [number, number, number] = [-0.42, 0.55, 0.72];

function useReveal(config: RevealConfig): RevealApi {
  const {
    canvasRef,
    wrapperRef,
    width,
    height,
    dpr,
    pad,
    opts,
    imageSrc,
    reduced,
    isCanvasTarget,
    trigger,
    replay,
    duration,
    easing,
    scrollStart,
    scrollEnd,
  } = config;

  const rendererRef = React.useRef<PaperRenderer | null>(null);
  const progressRef = React.useRef(reduced ? 1 : 0);
  const animRef = React.useRef<Anim | null>(null);
  const rafRef = React.useRef(0);
  const lightRef = React.useRef<[number, number, number]>([...DEFAULT_LIGHT]);
  const lightTargetRef = React.useRef<[number, number, number]>([...DEFAULT_LIGHT]);
  const optsRef = React.useRef(opts);
  optsRef.current = opts;
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  const visibleRef = React.useRef(true);
  const scrollTargetRef = React.useRef<number | null>(null);
  const flightRef = React.useRef(0);
  const pausedAtRef = React.useRef(0);
  const durationRef = React.useRef(duration);
  durationRef.current = duration;
  const easingRef = React.useRef(easing);
  easingRef.current = easing;
  const scrollStartRef = React.useRef(scrollStart);
  scrollStartRef.current = scrollStart;
  const scrollEndRef = React.useRef(scrollEnd);
  scrollEndRef.current = scrollEnd;

  const [canvasReady, setCanvasReady] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);
  const imageFailedRef = React.useRef(false);

  const drawNow = React.useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setOptions(optsRef.current);
    renderer.draw(progressRef.current, lightRef.current, flightRef.current);
  }, []);

  const tickRef = React.useRef<() => void>(() => undefined);
  tickRef.current = () => {
    rafRef.current = 0;
    if (reducedRef.current) return;
    if (!visibleRef.current || (typeof document !== "undefined" && document.hidden)) {
      if (!pausedAtRef.current) pausedAtRef.current = performance.now();
      return;
    }

    const now = performance.now();
    let busy = false;

    const anim = animRef.current;
    flightRef.current = 0;
    if (anim) {
      const t = Math.min(1, (now - anim.start) / Math.max(1, anim.dur));
      if (anim.to > 0.5) flightRef.current = t;
      if (t >= 1) {
        progressRef.current = anim.to;
        animRef.current = null;
      } else {
        progressRef.current = anim.from + (anim.to - anim.from) * anim.ease(t);
        busy = true;
      }
    }

    if (scrollTargetRef.current !== null) {
      const target = scrollTargetRef.current;
      const delta = target - progressRef.current;
      if (Math.abs(delta) < 0.0015) {
        progressRef.current = target;
        scrollTargetRef.current = null;
      } else {
        progressRef.current += delta * 0.16;
        busy = true;
      }
      flightRef.current = progressRef.current;
    }

    const light = lightRef.current;
    const target = lightTargetRef.current;
    const dx = target[0] - light[0];
    const dy = target[1] - light[1];
    const dz = target[2] - light[2];
    if (dx * dx + dy * dy + dz * dz > 1e-6) {
      light[0] += dx * 0.14;
      light[1] += dy * 0.14;
      light[2] += dz * 0.14;
      busy = true;
    } else {
      light[0] = target[0];
      light[1] = target[1];
      light[2] = target[2];
    }

    drawNow();
    if (busy && !rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        tickRef.current();
      });
    }
  };

  const kick = React.useCallback(() => {
    if (rafRef.current || reducedRef.current || !visibleRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;
    if (pausedAtRef.current) {
      const delta = performance.now() - pausedAtRef.current;
      pausedAtRef.current = 0;
      if (animRef.current) animRef.current.start += delta;
    }
    rafRef.current = requestAnimationFrame(() => {
      tickRef.current();
    });
  }, []);

  const startAnim = React.useCallback((target: number) => {
    if (reducedRef.current) {
      progressRef.current = 1;
      return;
    }
    const from = progressRef.current;
    const distance = Math.abs(target - from);
    if (distance < 0.002) {
      progressRef.current = target;
      return;
    }
    const base = target > from ? durationRef.current : durationRef.current * COLLAPSE_RATIO;
    const scaled = base * (0.35 + 0.65 * Math.min(1, distance));
    flightRef.current = target > from ? 0 : 0;
    animRef.current = {
      from,
      to: target,
      start: performance.now(),
      dur: Math.max(140, scaled * 1000),
      ease: target > from ? easingFn(easingRef.current) : easeInOutCubic,
    };
    kick();
  }, [kick]);

  const reveal = React.useCallback(() => startAnim(1), [startAnim]);
  const collapse = React.useCallback(() => startAnim(0), [startAnim]);
  const toggle = React.useCallback(() => {
    if (progressRef.current > 0.995) startAnim(0);
    else startAnim(1);
  }, [startAnim]);

  const setPointer = React.useCallback((x: number, y: number) => {
    if (!optsRef.current.pointerLight || reducedRef.current) return;
    const len = Math.hypot(x, y, 0.85) || 1;
    lightTargetRef.current = [x / len, y / len, 0.85 / len];
    kick();
  }, [kick]);

  const resetPointer = React.useCallback(() => {
    lightTargetRef.current = [...DEFAULT_LIGHT];
    kick();
  }, [kick]);

  // Reduced motion: show the finished sheet and stop all animation.
  React.useEffect(() => {
    if (reduced) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      animRef.current = null;
      scrollTargetRef.current = null;
      flightRef.current = 0;
      progressRef.current = 1;
      drawNow();
    }
  }, [reduced, drawNow]);

  // Lazy renderer creation near the viewport.
  React.useEffect(() => {
    if (isCanvasTarget) return;
    if (typeof IntersectionObserver === "undefined") return;
    const el = wrapperRef.current;
    if (!el) return;
    let cancelled = false;

    const ensure = (): void => {
      if (cancelled || isCanvasTarget || rendererRef.current || !canvasRef.current) return;
      const renderer = new PaperRenderer(canvasRef.current, optsRef.current.seed);
      if (!renderer.init()) {
        renderer.dispose();
        return;
      }
      rendererRef.current = renderer;
      renderer.setSize(width + pad * 2, height + pad * 2, dpr, height);
      renderer.setOptions(optsRef.current);

      const finish = (ok: boolean): void => {
        if (cancelled) return;
        setImageFailed(!ok);
        imageFailedRef.current = !ok;
        if (!ok) {
          setCanvasReady(false);
          return;
        }
        renderer.draw(progressRef.current, lightRef.current, flightRef.current);
        setCanvasReady(true);
        kick();
      };

      renderer.draw(progressRef.current, lightRef.current, flightRef.current);
      setCanvasReady(true);
      void renderer.setImage(imageSrc, finish).then(() => {
        if (!cancelled && !imageFailedRef.current) {
          renderer.draw(progressRef.current, lightRef.current, flightRef.current);
        }
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          ensure();
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
    // Size/image changes are handled by dedicated effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCanvasTarget]);

  // Resize the backing store when the measured size or DPR changes.
  React.useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setSize(width + pad * 2, height + pad * 2, dpr, height);
    renderer.setOptions(optsRef.current);
    renderer.draw(progressRef.current, lightRef.current, flightRef.current);
  }, [width, height, dpr, pad]);

  // Uniform-only prop updates never rebuild the GL context.
  React.useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setOptions(opts);
    if (!animRef.current && scrollTargetRef.current === null) {
      renderer.draw(progressRef.current, lightRef.current, flightRef.current);
    }
  }, [opts]);

  // Re-upload the texture when the image source changes.
  React.useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    setImageFailed(false);
    imageFailedRef.current = false;
    void renderer.setImage(imageSrc, (ok) => {
      setImageFailed(!ok);
      imageFailedRef.current = !ok;
      if (ok) {
        setCanvasReady(true);
        renderer.draw(progressRef.current, lightRef.current, flightRef.current);
      } else {
        setCanvasReady(false);
      }
    });
  }, [imageSrc]);

  // Visibility: pause when the tab or the instance is off-screen.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = (): void => {
      visibleRef.current = !document.hidden;
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && wrapperRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          visibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) kick();
        },
        { rootMargin: "120px" }
      );
      io.observe(wrapperRef.current);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [kick, wrapperRef]);

  // In-view trigger.
  React.useEffect(() => {
    if (isCanvasTarget || reduced || trigger !== "inView") return;
    if (typeof IntersectionObserver === "undefined") return;
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          startAnim(1);
        } else if (replay) {
          startAnim(0);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isCanvasTarget, reduced, trigger, replay, startAnim, wrapperRef]);

  // Scroll trigger.
  React.useEffect(() => {
    if (isCanvasTarget || reduced || trigger !== "scroll") return;
    const update = (): void => {
      const el = wrapperRef.current;
      if (!el) return;
      animRef.current = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * (scrollStartRef.current / 100);
      const end = vh * (scrollEndRef.current / 100);
      const raw = (start - rect.top) / Math.max(1, start - end);
      scrollTargetRef.current = clamp(raw, 0, 1);
      kick();
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      scrollTargetRef.current = null;
    };
  }, [isCanvasTarget, reduced, trigger, kick, wrapperRef]);

  // Context loss / restore.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onLost = (event: Event): void => {
      event.preventDefault();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    const onRestored = (): void => {
      const renderer = rendererRef.current;
      if (!renderer) return;
      renderer.handleRestored();
      renderer.draw(progressRef.current, lightRef.current, flightRef.current);
      kick();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [canvasRef, kick]);

  // Full cleanup on unmount.
  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  return {
    progressRef,
    canvasReady,
    imageFailed,
    reveal,
    collapse,
    toggle,
    setPointer,
    resetPointer,
  };
}

function useMeasuredWidth(
  ref: React.RefObject<HTMLDivElement | null>,
  initial: number
): number {
  const [width, setWidth] = React.useState(initial);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (w: number): void => {
      if (!Number.isFinite(w) || w <= 0) return;
      setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
    };
    apply(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

function useDevicePixelRatio(): number {
  const [dpr, setDpr] = React.useState(1);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const update = (): void => setDpr(Math.min(window.devicePixelRatio || 1, 2));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return dpr;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReduced(query.matches);
    update();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    query.addListener(update);
    return () => query.removeListener(update);
  }, []);
  return reduced;
}

function isCanvasTarget(): boolean {
  try {
    return RenderTarget.current() === RenderTarget.canvas;
  } catch {
    return false;
  }
}

/* =============================================================================
 * 7. COMPONENT
 * ===========================================================================*/

export default function CrumpledPaperReveal(rawProps: Props): React.ReactElement {
  const props = { ...DEFAULTS, ...rawProps };
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const width = useMeasuredWidth(wrapperRef, INTRINSIC_WIDTH);
  const dpr = useDevicePixelRatio();
  const reduced = useReducedMotion();
  const canvasTarget = isCanvasTarget();

  const aspectPair = ASPECTS[props.aspect] ?? ASPECTS["4:5"];
  const [aspectW, aspectH] = aspectPair;
  const aspect = aspectW / aspectH;
  const height = Math.max(1, width * (aspectH / aspectW));
  const pad = Math.max(MIN_PAD, PAD_RATIO * width);
  const cssW = width + pad * 2;
  const cssH = height + pad * 2;

  const seedRef = React.useRef<number | undefined>(undefined);
  if (seedRef.current === undefined) {
    seedRef.current = 1 + Math.random() * 997;
  }
  const seed = seedRef.current;

  const linesRef = React.useRef<CreaseLine[]>([]);
  const linesSeedRef = React.useRef(-1);
  if (linesSeedRef.current !== seed) {
    linesSeedRef.current = seed;
    linesRef.current = createCreaseLines(seed);
  }

  const imageSrc = getImageSrc(props.image);
  const href = getHref(props.link);

  const margin = clamp(Number(props.margin) || 0, 0, 80);
  const radius = clamp(Number(props.radius) || 0, 0, 48);
  const creaseDepth = clamp(Number(props.creaseDepth) || 0, 0, 1);
  const ballSize = clamp(Number(props.ballSize) || 0.45, 0.2, 1);
  const shadow = clamp(Number(props.shadow) || 0, 0, 1);
  const curl = clamp(Number(props.curl) || 0, 0, 1);
  const focalX = clamp(Number(props.focalX) || 50, 0, 100);
  const focalY = clamp(Number(props.focalY) || 50, 0, 100);
  const duration = clamp(Number(props.duration) || REVEAL_DURATION, 0.4, 4);
  const scrollStart = clamp(Number(props.scrollStart) || 85, 0, 100);
  const scrollEnd = clamp(Number(props.scrollEnd) || 25, 0, 100);

  const opts = React.useMemo<RenderOptions>(
    () => ({
      aspect,
      ballSize,
      shape: SHAPES[props.shape] ?? SHAPES["Tight Wad"],
      paper: parseColor(props.paperColor, [0.956, 0.937, 0.894]),
      back: parseColor(props.backColor, [0.937, 0.91, 0.847]),
      marginWorld: [margin / width, margin / height],
      radiusWorld: radius / height,
      finish: FINISH_INDEX[props.finish] ?? 0,
      creaseDepth,
      fold: FOLD_INDEX[props.fold] ?? 0,
      shadow,
      curl,
      focal: [focalX / 100, focalY / 100],
      lines: linesRef.current,
      pointerLight: props.pointerLight !== false,
      seed,
    }),
    [
      aspect,
      ballSize,
      props.shape,
      props.paperColor,
      props.backColor,
      height,
      margin,
      radius,
      props.finish,
      creaseDepth,
      props.fold,
      shadow,
      curl,
      focalX,
      focalY,
      props.pointerLight,
      seed,
    ]
  );

  const reveal = useReveal({
    canvasRef,
    wrapperRef,
    width,
    height,
    dpr,
    pad,
    opts,
    imageSrc,
    reduced,
    isCanvasTarget: canvasTarget,
    trigger: props.trigger,
    replay: props.replay,
    duration,
    easing: props.easing,
    scrollStart,
    scrollEnd,
  });

  const pointerTypeRef = React.useRef<string>("mouse");

  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    pointerTypeRef.current = event.pointerType || "mouse";
  }, []);

  const handlePointerEnter = React.useCallback(() => {
    if (props.trigger === "hover" && !reduced) reveal.reveal();
  }, [props.trigger, reduced, reveal]);

  const handlePointerLeave = React.useCallback(() => {
    reveal.resetPointer();
    if (props.trigger === "hover" && !reduced) reveal.collapse();
  }, [props.trigger, reduced, reveal]);

  const handleFocus = React.useCallback(() => {
    if (props.trigger === "hover" && !reduced) reveal.reveal();
  }, [props.trigger, reduced, reveal]);

  const handleBlur = React.useCallback(() => {
    if (props.trigger === "hover" && !reduced) reveal.collapse();
  }, [props.trigger, reduced, reveal]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const touch = pointerTypeRef.current === "touch";
      const progress = reveal.progressRef.current;

      if (props.trigger === "hover" && !touch) return;

      if (props.trigger === "click" || touch) {
        if (progress < 0.995) {
          event.preventDefault();
          reveal.reveal();
          return;
        }
        if (href) return;
        event.preventDefault();
        reveal.collapse();
        return;
      }

      if (href && progress < 0.995) {
        event.preventDefault();
        reveal.reveal();
      }
    },
    [props.trigger, href, reveal]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
      const progress = reveal.progressRef.current;
      if (props.trigger === "click" || !href) {
        event.preventDefault();
        if (progress > 0.995) reveal.collapse();
        else reveal.reveal();
      } else if (href && progress < 0.995) {
        event.preventDefault();
        reveal.reveal();
      }
    },
    [props.trigger, href, reveal]
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!props.pointerLight || reduced) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const u = (event.clientX - rect.left) / Math.max(1, rect.width);
      const v = (event.clientY - rect.top) / Math.max(1, rect.height);
      reveal.setPointer((u - 0.5) * 1.2, -(v - 0.5) * 1.2);
    },
    [props.pointerLight, reduced, reveal]
  );

  const interactive = !!href || props.trigger === "hover" || props.trigger === "click";
  const radiusCss = `${radius}px`;
  const fallbackSrc = reveal.imageFailed ? "" : imageSrc;

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height,
    ["--crumple-focus" as any]: "#0A84FF",
  } as React.CSSProperties;

  const flatFallback = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: radiusCss,
        opacity: canvasTarget || !reveal.canvasReady ? 1 : 0,
        transition: "opacity 0.35s",
        background: props.paperColor,
        padding: margin,
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: `0 ${Math.max(1, height * 0.012)}px ${Math.max(2, height * 0.022)}px rgba(60, 50, 40, 0.12)`,
        pointerEvents: "none",
      }}
    >
      {fallbackSrc ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: `${Math.max(0, radius - margin)}px`,
            backgroundImage: `url("${fallbackSrc.replace(/"/g, "%22")}")`,
            backgroundSize: "cover",
            backgroundPosition: `${focalX}% ${focalY}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: `${Math.max(0, radius - margin)}px`,
            background: `linear-gradient(155deg, #fffdf8 0%, ${props.paperColor} 62%, #e8dcc6 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {[0.22, 0.32, 0.42, 0.52, 0.62, 0.72].map((top, index) => (
            <div
              key={top}
              style={{
                position: "absolute",
                left: "12%",
                right: `${index === 5 ? 46 : 12}%`,
                top: `${top * 100}%`,
                height: Math.max(1, height * 0.004),
                background: "rgba(43,58,91,0.16)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const commonHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    className: "crumple-reveal-sheet",
    style: {
      cursor: interactive ? "pointer" : "default",
      borderRadius: radiusCss,
    } as React.CSSProperties,
  };

  const overlay = href ? (
    <a
      {...commonHandlers}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={props.alt || "Crumpled paper reveal"}
    />
  ) : (
    <div {...commonHandlers} role="img" tabIndex={0} aria-label={props.alt || "Crumpled paper reveal"} />
  );

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <style>{CSS}</style>
      {flatFallback}
      {!canvasTarget && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -pad,
            top: -pad,
            width: cssW,
            height: cssH,
            pointerEvents: "none",
            opacity: reveal.canvasReady ? 1 : 0,
            transition: "opacity 0.35s",
            display: "block",
          }}
          width={Math.round(cssW * dpr)}
          height={Math.round(cssH * dpr)}
        />
      )}
      {overlay}
    </div>
  );
}

/* =============================================================================
 * 8. PROPERTY CONTROLS
 * ===========================================================================*/

addPropertyControls(CrumpledPaperReveal, {
  image: {
    type: ControlType.ResponsiveImage,
    title: "Image",
  },
  alt: {
    type: ControlType.String,
    title: "Alt Text",
    defaultValue: "",
    displayTextArea: false,
  },
  focalX: {
    type: ControlType.Number,
    title: "Focal X",
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
  },
  focalY: {
    type: ControlType.Number,
    title: "Focal Y",
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
  },
  link: {
    type: ControlType.Link,
    title: "Link",
  },
  trigger: {
    type: ControlType.Enum,
    title: "Trigger",
    options: ["hover", "click", "inView", "scroll"],
    optionTitles: ["Hover", "Click", "In View", "Scroll"],
    defaultValue: "hover",
  },
  replay: {
    type: ControlType.Boolean,
    title: "Replay",
    defaultValue: false,
    enabledTitle: "On",
    disabledTitle: "Off",
    hidden: (props: Props) => props.trigger !== "inView",
  },
  duration: {
    type: ControlType.Number,
    title: "Duration",
    defaultValue: 1.0,
    min: 0.4,
    max: 4,
    step: 0.1,
    unit: "s",
  },
  easing: {
    type: ControlType.Enum,
    title: "Easing",
    options: ["Smooth", "Snappy", "Springy"],
    defaultValue: "Springy",
  },
  scrollStart: {
    type: ControlType.Number,
    title: "Scroll Start",
    defaultValue: 85,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    hidden: (props: Props) => props.trigger !== "scroll",
  },
  scrollEnd: {
    type: ControlType.Number,
    title: "Scroll End",
    defaultValue: 25,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    hidden: (props: Props) => props.trigger !== "scroll",
  },
  fold: {
    type: ControlType.Enum,
    title: "Fold",
    options: ["none", "half", "thirds"],
    optionTitles: ["None", "Half", "Thirds"],
    defaultValue: "none",
  },
  shape: {
    type: ControlType.Enum,
    title: "Shape",
    options: [
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
    ],
    defaultValue: "Tight Wad",
  },
  aspect: {
    type: ControlType.Enum,
    title: "Aspect",
    options: ["1:1", "4:5", "3:4", "4:3", "3:2", "16:9"],
    defaultValue: "4:5",
  },
  paperColor: {
    type: ControlType.Color,
    title: "Paper",
    defaultValue: "#F4EFE4",
  },
  backColor: {
    type: ControlType.Color,
    title: "Reverse",
    defaultValue: "#EFE8D8",
  },
  margin: {
    type: ControlType.Number,
    title: "Margin",
    defaultValue: 0,
    min: 0,
    max: 80,
    step: 1,
    unit: "px",
  },
  radius: {
    type: ControlType.Number,
    title: "Radius",
    defaultValue: 0,
    min: 0,
    max: 48,
    step: 1,
    unit: "px",
  },
  finish: {
    type: ControlType.Enum,
    title: "Finish",
    options: ["matte", "satin", "gloss"],
    optionTitles: ["Matte", "Satin", "Gloss"],
    defaultValue: "matte",
  },
  creaseDepth: {
    type: ControlType.Number,
    title: "Creases",
    defaultValue: 0.5,
    min: 0,
    max: 1,
    step: 0.05,
  },
  ballSize: {
    type: ControlType.Number,
    title: "Ball Size",
    defaultValue: 0.45,
    min: 0.2,
    max: 1,
    step: 0.05,
  },
  shadow: {
    type: ControlType.Number,
    title: "Shadow",
    defaultValue: 0.5,
    min: 0,
    max: 1,
    step: 0.05,
  },
  curl: {
    type: ControlType.Number,
    title: "Curl",
    defaultValue: 0.3,
    min: 0,
    max: 1,
    step: 0.05,
  },
  pointerLight: {
    type: ControlType.Boolean,
    title: "Pointer Light",
    defaultValue: true,
    enabledTitle: "On",
    disabledTitle: "Off",
  },
});

