"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type LiquidChromeButtonIcon = "folder" | "lightning" | "cursor";

export interface LiquidChromeButtonProps {
  /** Diameter in pixels. Values are clamped to 40–300. */
  size?: number;
  /** Visible width of the liquid-metal ring in pixels. */
  borderWidth?: number;
  /** WebGL animation multiplier. Set 0 for a static chrome surface. */
  speed?: number;
  /** Opacity of the frosted center glass, from 0 to 1. */
  glassOpacity?: number;
  /** Optional built-in icon used when customIcon is omitted. */
  icon?: LiquidChromeButtonIcon;
  /** SVG or React content placed in the center and clipped by the glass lens. */
  customIcon?: React.ReactNode;
  /** Optional destination. When present, the control renders as an anchor. */
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  /** Render a non-interactive visual version, useful for card previews. */
  decorative?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

const vertexShader = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentShader = `
precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  v += .50 * noise(p); p = p * 2.03 + 17.1;
  v += .25 * noise(p); p = p * 2.01 + 11.7;
  v += .125 * noise(p); p = p * 2.04 + 8.3;
  return v / .875;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  vec2 pointer = (u_pointer - .5) * 2.0;
  pointer.x *= u_resolution.x / u_resolution.y;
  float t = u_time * .42;
  vec2 warp = vec2(fbm(p * 2.4 + vec2(t, -t)), fbm(p * 2.2 + vec2(-t, t)));
  float field = fbm(p * 3.4 + warp * 2.8 + pointer * .18);
  float sheen = smoothstep(.28, .82, field + .18 * sin((p.x - p.y) * 5.0 + t * 2.0));
  vec3 chrome = mix(vec3(.025, .04, .065), vec3(.52, .74, .90), sheen);
  chrome = mix(chrome, vec3(.96, .985, 1.0), smoothstep(.72, .96, sheen));
  float edge = smoothstep(1.18, .18, length(p));
  gl_FragColor = vec4(chrome * (.75 + .25 * edge), 1.0);
}
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function BuiltInIcon({ icon }: { icon: LiquidChromeButtonIcon }) {
  if (icon === "folder") {
    return <path d="M4 6.8c0-1 .8-1.8 1.8-1.8h4l1.8 2H18c1 0 1.8.8 1.8 1.8v6.4c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8V6.8Z" />;
  }
  if (icon === "cursor") {
    return <path d="m5 3 11.7 11.1-4.6.8-1.8 4.3L5 3Zm5.3 10.8 1.2-2.8 2.9-.5-6.7-6.3 2.6 9.6Z" />;
  }
  return <path d="m13.2 2.8-8 10.1h5.5l-.8 8.3 8.1-10.2h-5.6l.8-8.2Z" />;
}

function ChromeCanvas({ speed }: { speed: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const speedRef = React.useRef(speed);
  speedRef.current = speed;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) {
      canvas.dataset.webgl = "unavailable";
      return;
    }
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const cursor: [number, number] = [0.5, 0.5];
    let frame = 0;
    let visible = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = (stamp: number) => {
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointer, cursor[0], cursor[1]);
      gl.uniform1f(time, (stamp / 1000) * speedRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const render = (stamp: number) => {
      draw(stamp);
      if (visible && !motion.matches && speedRef.current > 0) frame = requestAnimationFrame(render);
    };
    const updateMotion = () => {
      cancelAnimationFrame(frame);
      draw(performance.now());
      if (visible && !motion.matches && speedRef.current > 0) frame = requestAnimationFrame(render);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      updateMotion();
    });
    const resizeObserver = new ResizeObserver(resize);
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor[0] = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      cursor[1] = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
    };

    resize();
    draw(performance.now());
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    canvas.parentElement?.addEventListener("pointermove", onPointerMove, { passive: true });
    motion.addEventListener("change", updateMotion);
    if (!motion.matches && speedRef.current > 0) frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      canvas.parentElement?.removeEventListener("pointermove", onPointerMove);
      motion.removeEventListener("change", updateMotion);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas aria-hidden="true" ref={canvasRef} className="absolute inset-0 h-full w-full rounded-full" />;
}

export function LiquidChromeButton({
  size = 112,
  borderWidth = 10,
  speed = 1,
  glassOpacity = 0.42,
  icon,
  customIcon,
  href,
  target,
  rel,
  ariaLabel = "Liquid chrome button",
  decorative = false,
  className,
  onClick,
}: LiquidChromeButtonProps) {
  const diameter = clamp(size, 40, 300);
  const ring = clamp(borderWidth, 2, Math.max(2, diameter / 3));
  const glass = clamp(glassOpacity, 0, 1);
  const content = (
    <>
      <div className="absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.94),transparent_35%),linear-gradient(145deg,#dce8ef,#8ea8bb_42%,#486276_74%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.4),transparent_35%),linear-gradient(145deg,#182332,#5f7a92_36%,#0b1119_74%)]" />
      <ChromeCanvas speed={Math.max(0, speed)} />
      <span
        className="absolute grid place-items-center rounded-full border border-slate-950/15 bg-white/[var(--liquid-glass-opacity)] shadow-[inset_0_1px_0_rgba(255,255,255,.95),inset_0_-18px_32px_rgba(48,76,94,.2),0_12px_30px_rgba(38,63,80,.2)] backdrop-blur-xl dark:border-white/35 dark:bg-slate-950/[var(--liquid-glass-opacity)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-18px_32px_rgba(7,12,18,.42),0_12px_30px_rgba(11,18,28,.32)]"
        style={{ inset: ring, "--liquid-glass-opacity": glass } as React.CSSProperties}
      >
        {(customIcon || icon) && (
          <span className="grid size-[52%] place-items-center text-slate-700 drop-shadow-[0_1px_8px_rgba(255,255,255,.65)] dark:text-white dark:drop-shadow-[0_1px_8px_rgba(255,255,255,.35)] [&_svg]:size-full [&_svg]:fill-current [&_svg]:stroke-current [&_svg]:stroke-[1.4]">
            {customIcon ?? <svg viewBox="0 0 24 24" aria-hidden="true"><BuiltInIcon icon={icon!} /></svg>}
          </span>
        )}
      </span>
    </>
  );
  const shared = {
    "aria-label": ariaLabel,
    className: cn(
      "group relative inline-grid shrink-0 place-items-center rounded-full outline-none transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-[1.06] active:scale-[.94] focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-4 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:scale-100",
      className,
    ),
    style: { width: diameter, height: diameter },
    onClick,
  };
  if (decorative) return <div aria-hidden="true" className={shared.className} style={shared.style}>{content}</div>;
  if (href) return <a {...shared} href={href} target={target} rel={rel}>{content}</a>;
  return <button {...shared} type="button">{content}</button>;
}

export default LiquidChromeButton;
