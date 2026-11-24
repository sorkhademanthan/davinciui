"use client";

/* eslint-disable react/no-unknown-property */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  WebGLErrorBoundary,
  WebGLFallback,
} from "@workspace/ui/components/webgl-error-boundary";
import { cn } from "@workspace/ui/lib/utils";
import {
  DoubleSide,
  LinearFilter,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  PerspectiveCamera,
  TextureLoader,
} from "three";
import {
  Suspense,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface OrbitSpiralSlide {
  /** Image source rendered inside the slide. */
  src: string;
  /** Accessible description for the image. */
  alt: string;
}

export interface OrbitSpiralGalleryProps {
  /** Images arranged along the spiral. */
  items?: OrbitSpiralSlide[];
  /** Alias for items. */
  images?: OrbitSpiralSlide[];
  /** Additional classes for the WebGL stage. */
  className?: string;
  /** Horizontal radius of the spiral in world units. */
  radius?: number;
  /** Legacy alias for verticalSpacing. */
  verticalGap?: number;
  /** Vertical pitch between adjacent panels in world units. */
  verticalSpacing?: number;
  /** Legacy alias for panelWidth. */
  cardWidth?: number;
  /** Width of each image panel in world units. */
  panelWidth?: number;
  /** Legacy alias for panel aspect ratio used to derive panelHeight. */
  cardAspectRatio?: number;
  /** Height of each image panel in world units. */
  panelHeight?: number;
  /** Subtle panel curvature amount (0-1). */
  panelCurvature?: number;
  /** Legacy alias for panelCurvature. */
  bend?: number;
  /** Perspective camera field of view in degrees. */
  perspective?: number;
  /** Legacy alias for perspective. */
  fov?: number;
  /** Camera distance from the spiral center. */
  cameraDistance?: number;
  /** Whether the spiral advances automatically while idle. */
  autoRotate?: boolean;
  /** Legacy alias for rotationSpeed. */
  autoSpeed?: number;
  /** Automatic rotation speed in slides per second. */
  rotationSpeed?: number;
  /** Rotation direction for auto-rotation. */
  direction?: "clockwise" | "counterclockwise";
  /** Scroll/wheel sensitivity. */
  scrollSensitivity?: number;
  /** Enable pointer drag rotation. */
  dragEnabled?: boolean;
  /** Enable touch swipe rotation. */
  swipeEnabled?: boolean;
  /** Motion smoothing between 0 and 1. */
  smoothing?: number;
  /** Legacy alias for smoothing. */
  blurStrength?: number;
  /** Optional stage theme. Defaults to the current document theme. */
  theme?: "light" | "dark";
  /** Accessible name for the gallery region. */
  ariaLabel?: string;
}

const DEFAULT_IMAGES: OrbitSpiralSlide[] = [
  { src: "/images/spiral-3d-slider/red-echo.webp", alt: "Red fashion portrait swept through a long exposure" },
  { src: "/images/spiral-3d-slider/blue-profile.webp", alt: "Profile illuminated by vivid blue motion trails" },
  { src: "/images/spiral-3d-slider/ghosted-portrait.webp", alt: "Portrait fragmented by layered horizontal motion" },
  { src: "/images/spiral-3d-slider/teal-echo.webp", alt: "Teal portrait captured with an expressive camera blur" },
  { src: "/images/spiral-3d-slider/camera-reflection.webp", alt: "Monochrome photographer reflected through moving glass" },
  { src: "/images/spiral-3d-slider/orange-haze.webp", alt: "Warm portrait dissolving through a soft orange exposure" },
  { src: "/images/spiral-3d-slider/blue-double.webp", alt: "Blue studio portrait split into a double exposure" },
  { src: "/images/spiral-3d-slider/dark-glitch.webp", alt: "Editorial portrait crossed by dark crimson light trails" },
  { src: "/images/spiral-3d-slider/red-blue-figure.webp", alt: "Figure lit by saturated red and electric blue light" },
  { src: "/images/spiral-3d-slider/green-portrait.webp", alt: "Shadowed portrait traced by muted green light" },
  { src: "/images/spiral-3d-slider/silver-motion.webp", alt: "Silver portrait stretched into a quiet horizontal blur" },
  { src: "/images/spiral-3d-slider/crimson-profile.webp", alt: "Crimson profile emerging from a green studio shadow" },
  { src: "/images/spiral-3d-slider/blue-motion.webp", alt: "Blue portrait stretched through a long exposure" },
  { src: "/images/spiral-3d-slider/prism-portrait.webp", alt: "Portrait washed in green light and a magenta prism haze" },
  { src: "/images/spiral-3d-slider/white-motion.webp", alt: "White-clad figure swept into a luminous studio motion" },
  { src: "/images/spiral-3d-slider/visor-portrait.webp", alt: "Portrait distorted through a translucent silver visor" },
];

const vertexShader = `
  uniform float uBend;
  uniform float uWidth;
  varying vec2 vUv;
  varying float vDepthShade;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    // Subtle cylindrical curvature: bend panel back at horizontal edges
    float nx = position.x / max(uWidth * 0.5, 0.0001);
    float curve = nx * nx;
    transformed.z -= curve * uBend;
    // slight vertical wrap to feel attached to spiral
    transformed.z -= abs(position.y) * uBend * 0.08;

    vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
    vec4 mvPosition = viewMatrix * worldPos;
    vDepthShade = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uOpacity;
  uniform float uShade;
  uniform float uDark;
  varying vec2 vUv;
  varying float vDepthShade;

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uImageAspect > uPlaneAspect) {
      scale.x = uPlaneAspect / uImageAspect;
    } else {
      scale.y = uImageAspect / uPlaneAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    vec4 color = texture2D(uTexture, uv);

    float depthFade = smoothstep(18.0, 5.0, vDepthShade);
    float darkShade = mix(1.0, 1.22, depthFade) * uShade;
    float lightShade = mix(0.94, 1.03, depthFade) * uShade;
    float shade = mix(lightShade, darkShade, uDark);
    color.rgb *= shade;
    color.rgb = clamp(color.rgb, 0.0, 1.0);

    gl_FragColor = vec4(color.rgb, uOpacity);
  }
`;

function wrapIndex(value: number, length: number) {
  const m = ((value % length) + length) % length;
  return m > length / 2 ? m - length : m;
}

function imageAspect(texture: Texture) {
  const image = texture.image as
    | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
    | undefined;
  const width = image?.naturalWidth ?? image?.width ?? 1;
  const height = image?.naturalHeight ?? image?.height ?? 1;
  return width / Math.max(height, 1);
}

interface SceneProps {
  items: OrbitSpiralSlide[];
  targetProgress: MutableRefObject<number>;
  velocity: MutableRefObject<number>;
  radius: number;
  verticalSpacing: number;
  panelWidth: number;
  panelHeight: number;
  panelCurvature: number;
  autoRotate: boolean;
  rotationSpeed: number;
  direction: "clockwise" | "counterclockwise";
  smoothing: number;
  reducedMotion: MutableRefObject<boolean>;
  lastInteraction: MutableRefObject<number>;
  isDragging: MutableRefObject<boolean>;
  perspective: number;
  cameraDistance: number;
  isDark: boolean;
}

function OrbitScene({
  items,
  targetProgress,
  velocity,
  radius,
  verticalSpacing,
  panelWidth,
  panelHeight,
  panelCurvature,
  autoRotate,
  rotationSpeed,
  direction,
  smoothing,
  reducedMotion,
  lastInteraction,
  isDragging,
  perspective,
  cameraDistance,
  isDark,
}: SceneProps) {
  const sceneItems = useMemo(() => {
    const base = items.length ? items : DEFAULT_IMAGES;
    const minCount = 20;
    if (base.length >= minCount) return base;
    const out: OrbitSpiralSlide[] = [];
    for (let i = 0; i < minCount; i++) out.push(base[i % base.length]!);
    return out;
  }, [items]);

  const [textures, setTextures] = useState<Texture[]>([]);
  const texturesRef = useRef<Texture[]>([]);
  const { gl, camera, viewport, size } = useThree();
  const lastSize = useRef({ w: 0, h: 0 });
  const progress = useRef(0);
  const meshes = useRef<(Mesh | null)[]>([]);
  const materials = useRef<(ShaderMaterial | null)[]>([]);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    let cancelled = false;
    const loaded: Texture[] = [];

    Promise.all(
      sceneItems.map(
        (item) =>
          new Promise<Texture>((resolve) => {
            loader.load(
              item.src,
              (tex) => {
                tex.colorSpace = SRGBColorSpace;
                tex.minFilter = LinearFilter;
                tex.magFilter = LinearFilter;
                tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
                tex.needsUpdate = true;
                resolve(tex);
              },
              undefined,
              () => {
                // fallback: tiny dark texture
                const canvas = document.createElement("canvas");
                canvas.width = 2;
                canvas.height = 2;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.fillStyle = "#111";
                  ctx.fillRect(0, 0, 2, 2);
                }
                const fallback = new Texture(canvas);
                fallback.needsUpdate = true;
                resolve(fallback);
              },
            );
          }),
      ),
    ).then((result) => {
      if (cancelled) {
        result.forEach((t) => t.dispose());
        return;
      }
      loaded.push(...result);
      texturesRef.current = result;
      setTextures(result);
    });

    return () => {
      cancelled = true;
      loaded.forEach((t) => t.dispose());
      texturesRef.current = [];
    };
  }, [sceneItems, gl]);

  const uniforms = useMemo(
    () =>
      textures.map((texture) => ({
        uTexture: { value: texture },
        uImageAspect: { value: imageAspect(texture) },
        uPlaneAspect: { value: panelWidth / Math.max(panelHeight, 0.0001) },
        uOpacity: { value: 1 },
        uShade: { value: 1 },
        uBend: { value: panelCurvature * panelWidth * 0.18 },
        uWidth: { value: panelWidth },
        uDark: { value: isDark ? 1 : 0 },
      })),
    [textures, panelWidth, panelHeight, panelCurvature, isDark],
  );

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    const el = gl.domElement;
    const parent = el.parentElement;
    const cw = parent?.clientWidth ?? size.width;
    const ch = parent?.clientHeight ?? size.height;
    if (cw > 0 && ch > 0 && (cw !== lastSize.current.w || ch !== lastSize.current.h || size.width !== cw || size.height !== ch)) {
      lastSize.current = { w: cw, h: ch };
      gl.setSize(cw, ch, false);
      if ("aspect" in camera) (camera as unknown as PerspectiveCamera).aspect = cw / Math.max(ch, 1);
      camera.updateProjectionMatrix?.();
    }
    const now = performance.now();
    const idle = now - lastInteraction.current > 900;

    if (!reducedMotion.current) {
      if (autoRotate && idle && !isDragging.current) {
        const dir = direction === "counterclockwise" ? -1 : 1;
        targetProgress.current += dir * rotationSpeed * dt;
      }
      if (!isDragging.current && Math.abs(velocity.current) > 0.0001) {
        targetProgress.current += velocity.current * dt * 60;
        velocity.current *= Math.pow(0.9, dt * 60);
        if (Math.abs(velocity.current) < 0.0001) velocity.current = 0;
      }
    }

    const ease = reducedMotion.current ? 1 : 1 - Math.pow(1 - smoothing, dt * 60);
    progress.current += (targetProgress.current - progress.current) * ease;

    // Responsive scaling: keep spiral compact and centered at all viewports
    const vW = viewport.width;
    const vH = viewport.height;
    const aspect = vW / Math.max(vH, 0.001);
    const mobile = aspect < 0.75;
    const wide = aspect > 1.35;
    const base = mobile
      ? Math.min(vW / 6.8, vH / 10.2)
      : wide
        ? Math.min(vW / 11.8, vH / 9.4)
        : Math.min(vW / 10.4, vH / 9.8);
    const s = mobile
      ? Math.max(0.58, Math.min(0.92, base))
      : Math.max(0.82, Math.min(wide ? 1.28 : 1.12, base));
    const rX = radius * s * (mobile ? 0.84 : wide ? 1.08 : 1);
    const rZ = radius * 0.78 * s * (mobile ? 0.84 : wide ? 1.08 : 1);
    const pW = panelWidth * s;
    const pH = panelHeight * s;
    const vGap = verticalSpacing * s * (mobile ? 0.95 : 1);

    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(0, 0, 0);
    if ("fov" in camera) (camera as unknown as PerspectiveCamera).fov = perspective;
    camera.updateProjectionMatrix?.();

    const count = sceneItems.length;
    const angleStep = 0.68;

    meshes.current.forEach((mesh, index) => {
      const material = materials.current[index];
      if (!mesh || !material) return;
      const u = material.uniforms as Record<string, { value: number }>;

      const p = wrapIndex(index - progress.current, count);
      const angle = p * angleStep;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const x = sinA * rX;
      const y = -p * vGap;
      const z = cosA * rZ;

      mesh.position.set(x, y, z);

      // orient along spiral: face outward with a natural wrap
      const facing = Math.atan2(x, z);
      const tilt = -p * 0.018;
      mesh.rotation.set(tilt, facing, 0);

      const depthNorm = (cosA + 1) / 2; // 1 front, 0 back
      const scale = 0.78 + depthNorm * 0.22;
      mesh.scale.set(pW * scale, pH * scale, 1);

      const shade = isDark ? (0.86 + depthNorm * 0.28) : (0.9 + depthNorm * 0.14);
      const opacity = isDark ? (0.72 + depthNorm * 0.28) : (0.7 + depthNorm * 0.3);

      if (u.uShade) u.uShade.value = shade;
      if (u.uOpacity) u.uOpacity.value = opacity;
      if (u.uBend) u.uBend.value = panelCurvature * pW * 0.22;
      if (u.uWidth) u.uWidth.value = pW;
      if (u.uPlaneAspect) u.uPlaneAspect.value = pW / Math.max(pH, 0.0001);

      mesh.visible = Math.abs(p) < count * 0.62;
      mesh.renderOrder = Math.round(depthNorm * 1000);
    });
  });

  if (!textures.length) return null;

  return (
    <>
      {sceneItems.map((item, index) => (
        <mesh
          key={`${item.src}-${index}`}
          ref={(node) => {
            meshes.current[index] = node as unknown as Mesh | null;
          }}
          frustumCulled={false}
        >
          <planeGeometry args={[1, 1, 32, 8]} />
          <shaderMaterial
            ref={(node) => {
              materials.current[index] = node as unknown as ShaderMaterial | null;
            }}
            uniforms={uniforms[index]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            transparent
            depthTest
            depthWrite
          />
        </mesh>
      ))}
    </>
  );
}

export function OrbitSpiralGallery({
  items,
  images,
  className,
  radius = 2.85,
  verticalGap,
  verticalSpacing = verticalGap ?? 0.62,
  cardWidth,
  panelWidth = cardWidth ? Math.max(0.5, cardWidth / 120) : 3.35,
  cardAspectRatio,
  panelHeight = cardAspectRatio ? panelWidth / Math.max(cardAspectRatio, 0.1) : 2.25,
  bend,
  panelCurvature = bend ?? 0.35,
  fov,
  perspective = fov ?? 42,
  cameraDistance = 9.5,
  autoSpeed,
  autoRotate = true,
  rotationSpeed = autoSpeed ?? 0.22,
  direction = "clockwise",
  scrollSensitivity = 0.0022,
  dragEnabled = true,
  swipeEnabled = true,
  smoothing = 0.075,
  blurStrength: _legacyBlurStrength,
  theme,
  ariaLabel = "Spiral image gallery",
}: OrbitSpiralGalleryProps) {
  void _legacyBlurStrength;
  const stageRef = useRef<HTMLDivElement>(null);
  const targetProgress = useRef(0);
  const velocity = useRef(0);
  const lastInteraction = useRef(0);
  const isDragging = useRef(false);
  const dragPointer = useRef<number | null>(null);
  const dragLastX = useRef(0);
  const dragLastTime = useRef(0);
  const visible = useRef(false);
  const reducedMotion = useRef(false);
  const lastWheelTime = useRef(0);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(theme ?? "dark");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reducedMotion.current = motionQuery.matches;
    };
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.08 },
    );
    observer.observe(stage);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    if (theme) {
      setResolvedTheme(theme);
      return;
    }
    const root = document.documentElement;
    const sync = () => setResolvedTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [theme]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    const triggerResize = () => {
      window.dispatchEvent(new Event("resize"));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    };
    triggerResize();
    const ro = new ResizeObserver(triggerResize);
    ro.observe(stage);
    const io = new IntersectionObserver(() => triggerResize());
    io.observe(stage);
    window.addEventListener("orientationchange", triggerResize);
    const t1 = window.setTimeout(triggerResize, 60);
    const t2 = window.setTimeout(triggerResize, 220);
    const t3 = window.setTimeout(triggerResize, 500);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("orientationchange", triggerResize);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  // wheel / trackpad scroll over the stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      // allow page scroll when not really over interaction intent? keep smooth control
      event.preventDefault();
      lastWheelTime.current = performance.now();
      lastInteraction.current = lastWheelTime.current;
      const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
      const bounded = Math.sign(delta) * Math.min(Math.abs(delta), 140);
      targetProgress.current += bounded * scrollSensitivity;
      velocity.current = bounded * scrollSensitivity * 0.35;
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [scrollSensitivity]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && !dragEnabled) return;
      if (e.pointerType !== "mouse" && !swipeEnabled) return;
      isDragging.current = true;
      dragPointer.current = e.pointerId;
      dragLastX.current = e.clientX;
      dragLastTime.current = performance.now();
      lastInteraction.current = dragLastTime.current;
      velocity.current = 0;
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [dragEnabled, swipeEnabled],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || dragPointer.current !== e.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - dragLastX.current;
    const dt = Math.max(now - dragLastTime.current, 1);
    const deltaProgress = -dx * 0.008;
    targetProgress.current += deltaProgress;
    velocity.current = (deltaProgress / dt) * 16;
    dragLastX.current = e.clientX;
    dragLastTime.current = now;
    lastInteraction.current = now;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointer.current !== e.pointerId) return;
    isDragging.current = false;
    dragPointer.current = null;
    lastInteraction.current = performance.now();
    if ((e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  const resolvedItems = (items && items.length ? items : images && images.length ? images : DEFAULT_IMAGES);

  if (!resolvedItems.length) return null;

  const isDark = resolvedTheme === "dark";
  const stageBg = isDark ? "#1c1c1f" : "#f3f3f3";
  const fallbackClass = isDark ? "bg-[#1c1c1f] text-white/75" : "bg-[#f3f3f3] text-black/70";

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "relative h-full min-h-[420px] w-full overflow-hidden select-none touch-none",
        "cursor-grab active:cursor-grabbing",
        isDark ? "bg-[#1c1c1f]" : "bg-[#f3f3f3]",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <WebGLErrorBoundary
        fallback={<WebGLFallback className={cn("absolute inset-0 h-full w-full", fallbackClass)} />}
      >
        <div className="absolute inset-0">
          <Canvas
            key={resolvedTheme}
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, cameraDistance], fov: perspective, near: 0.1, far: 100 }}
            gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
            resize={{ scroll: false, debounce: 0 }}
            onCreated={({ gl }) => {
              gl.setClearColor(stageBg, 1);
            }}
          >
            <Suspense fallback={null}>
              <OrbitScene
                items={resolvedItems}
                targetProgress={targetProgress}
                velocity={velocity}
                radius={radius}
                verticalSpacing={verticalSpacing}
                panelWidth={panelWidth}
                panelHeight={panelHeight}
                panelCurvature={panelCurvature}
                autoRotate={autoRotate}
                rotationSpeed={rotationSpeed}
                direction={direction}
                smoothing={smoothing}
                reducedMotion={reducedMotion}
                lastInteraction={lastInteraction}
                isDragging={isDragging}
                perspective={perspective}
                cameraDistance={cameraDistance}
                isDark={isDark}
              />
            </Suspense>
          </Canvas>
        </div>
      </WebGLErrorBoundary>

      <div className="sr-only">
        <p>{ariaLabel}</p>
        <ul>
          {resolvedItems.map((item, index) => (
            <li key={`${item.src}-description-${index}`}>{item.alt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OrbitSpiralGallery;
