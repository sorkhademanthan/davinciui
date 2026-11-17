"use client";

import * as React from "react";
import * as THREE from "three";
import { cn } from "@workspace/ui/lib/utils";

/**
 * Six repo-owned portraits cycled through the tunnel in file order.
 */
export const FLOW_GALLERY_DEFAULT_IMAGES: string[] = [
  "/images/spiral-3d-slider/ghosted-portrait.webp",
  "/images/spiral-3d-slider/orange-haze.webp",
  "/images/spiral-3d-slider/blue-double.webp",
  "/images/spiral-3d-slider/prism-portrait.webp",
  "/images/spiral-3d-slider/visor-portrait.webp",
  "/images/spiral-3d-slider/white-motion.webp",
];

export interface FlowGalleryProps {
  /** Image sources cycled through the panels. */
  images?: string[];
  /** Radius of the tunnel wall. */
  tunnelRadius?: number;
  /** Number of ring segments in the loop. Rounded up to an even number. */
  ringCount?: number;
  /** Distance between adjacent rings along Z. */
  ringSpacing?: number;
  /** Filled image panels per ring. Slots are twice this value. */
  panelsPerRing?: number;
  /** Perspective camera field of view in degrees. */
  fov?: number;
  /** Automatic flow in world units per second. */
  autoSpeed?: number;
  /** World units added per pixel of wheel delta. */
  wheelSensitivity?: number;
  /** World units removed per pixel of vertical drag. */
  dragSensitivity?: number;
  /** Colour scheme for the tunnel. `system` follows the site theme. */
  theme?: "light" | "dark" | "system";
  /** Scene and canvas clear colour. Defaults to the active theme background. */
  backgroundColor?: string;
  /** Hairline grid colour. Defaults to the active theme grid colour. */
  gridColor?: string;
  /** Corner radius of the clipping surface. */
  borderRadius?: number;
  /** Accessible name for the canvas. */
  ariaLabel?: string;
  /** Additional classes for the component root. */
  className?: string;
}

const TAU = Math.PI * 2;

const LIGHT_BACKGROUND = "#ffffff";
const DARK_BACKGROUND = "#080808";
const LIGHT_GRID = "#555555";
const DARK_GRID = "#8a8a8a";

function resolveTheme(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof document === "undefined") return "light";

  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function positiveModulo(value: number, period: number) {
  return ((value % period) + period) % period;
}

function applyCoverFit(
  texture: THREE.Texture,
  imageAspect: number,
  panelAspect: number,
) {
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  if (imageAspect > panelAspect) {
    const repeatX = panelAspect / imageAspect;
    texture.repeat.set(repeatX, 1);
    texture.offset.set((1 - repeatX) / 2, 0);
  } else {
    const repeatY = imageAspect / panelAspect;
    texture.repeat.set(1, repeatY);
    texture.offset.set(0, (1 - repeatY) / 2);
  }
}

/**
 * An infinite tunnel seen from the inside. Image panels and a hairline grid
 * stream along Z toward the camera, with no roll, fog, or lighting. The
 * surface follows the site theme by default and can be pinned with `theme`.
 */
export function FlowGallery({
  images = FLOW_GALLERY_DEFAULT_IMAGES,
  tunnelRadius = 20,
  ringCount = 32,
  ringSpacing = 20,
  panelsPerRing = 5,
  fov = 60,
  autoSpeed = 2,
  wheelSensitivity = 0.02,
  dragSensitivity = 0.05,
  theme = "system",
  backgroundColor,
  gridColor,
  borderRadius = 12,
  ariaLabel = "3D flow gallery",
  className,
}: FlowGalleryProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const motionConfigRef = React.useRef({
    autoSpeed,
    wheelSensitivity,
    dragSensitivity,
  });
  motionConfigRef.current = {
    autoSpeed,
    wheelSensitivity,
    dragSensitivity,
  };

  const imagesRef = React.useRef(images);
  imagesRef.current = images;
  const imagesKey = images.join("\u0000");
  const [themeRevision, setThemeRevision] = React.useState(0);

  React.useEffect(() => {
    if (theme !== "system") return;

    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const bumpThemeRevision = () => {
      setThemeRevision((value) => value + 1);
    };

    const observer = new MutationObserver(bumpThemeRevision);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    media.addEventListener("change", bumpThemeRevision);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", bumpThemeRevision);
    };
  }, [theme]);

  React.useEffect(() => {
    const root = rootRef.current;
    const container = containerRef.current;
    if (!root || !container) return;

    setFailed(false);

    const activeTheme = resolveTheme(theme);
    const resolvedBackground =
      backgroundColor ??
      (activeTheme === "dark" ? DARK_BACKGROUND : LIGHT_BACKGROUND);
    const resolvedGrid =
      gridColor ?? (activeTheme === "dark" ? DARK_GRID : LIGHT_GRID);
    const sourceImages = imagesRef.current;
    const safeRadius = Math.max(0.1, tunnelRadius);
    const safeSpacing = Math.max(0.1, ringSpacing);
    const requestedRings = Math.max(4, Math.round(ringCount));
    const safeRingCount =
      requestedRings % 2 === 0 ? requestedRings : requestedRings + 1;
    const safePanelsPerRing = Math.max(1, Math.round(panelsPerRing));
    const slotCount = safePanelsPerRing * 2;
    const arcRadians = TAU / slotCount;
    const panelAspect = (safeRadius * arcRadians) / safeSpacing;
    const period = safeRingCount * safeSpacing;
    const gridRadius = Math.max(
      0.001,
      safeRadius - Math.min(0.02, safeRadius * 0.002),
    );
    const safeFov = Math.min(120, Math.max(10, fov));

    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(new THREE.Color(resolvedBackground), 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(resolvedBackground);

    const camera = new THREE.PerspectiveCamera(
      safeFov,
      1,
      0.1,
      period + safeSpacing * 2,
    );
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);

    const resize = () => {
      const width = Math.max(1, Math.floor(root.clientWidth));
      const height = Math.max(1, Math.floor(root.clientHeight));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const materials: THREE.MeshBasicMaterial[] =
      sourceImages.length > 0
        ? sourceImages.map(
            () =>
              new THREE.MeshBasicMaterial({
                side: THREE.BackSide,
                toneMapped: false,
              }),
          )
        : [
            new THREE.MeshBasicMaterial({
              side: THREE.BackSide,
              color: 0xffffff,
              toneMapped: false,
            }),
          ];

    const textures: THREE.Texture[] = [];
    let cancelled = false;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const loader = new THREE.TextureLoader();

    sourceImages.forEach((src, index) => {
      loader.load(src, (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;

        const image = texture.image as
          | {
              naturalWidth?: number;
              naturalHeight?: number;
              width?: number;
              height?: number;
            }
          | undefined;
        const width = image?.naturalWidth ?? image?.width ?? 1;
        const height = image?.naturalHeight ?? image?.height ?? 1;
        applyCoverFit(texture, width / Math.max(1, height), panelAspect);
        texture.needsUpdate = true;
        textures.push(texture);

        const material = materials[index % materials.length];
        if (!material) return;
        material.map = texture;
        material.needsUpdate = true;
      });
    });

    const panelGeometries = Array.from(
      { length: slotCount },
      (_, slot) =>
        new THREE.CylinderGeometry(
          safeRadius,
          safeRadius,
          safeSpacing,
          16,
          1,
          true,
          slot * arcRadians,
          arcRadians,
        ),
    );

    const panelEntries: { mesh: THREE.Mesh; ring: number }[] = [];

    for (let ring = 0; ring < safeRingCount; ring += 1) {
      let ordinal = 0;

      for (let slot = 0; slot < slotCount; slot += 1) {
        if ((slot + ring) % 2 !== 0) continue;

        const imageIndex =
          sourceImages.length > 0
            ? (ring * safePanelsPerRing + ordinal) % sourceImages.length
            : 0;
        const mesh = new THREE.Mesh(
          panelGeometries[slot],
          materials[imageIndex % materials.length],
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.frustumCulled = false;
        scene.add(mesh);
        panelEntries.push({ mesh, ring });
        ordinal += 1;
      }
    }

    const gridMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(resolvedGrid),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      toneMapped: false,
    });

    const circleSegments = 128;
    const circlePositions: number[] = [];

    for (let index = 0; index < circleSegments; index += 1) {
      const start = (index / circleSegments) * TAU;
      const end = ((index + 1) / circleSegments) * TAU;
      circlePositions.push(
        gridRadius * Math.sin(start),
        gridRadius * Math.cos(start),
        0,
        gridRadius * Math.sin(end),
        gridRadius * Math.cos(end),
        0,
      );
    }

    const circleGeometry = new THREE.BufferGeometry();
    circleGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(circlePositions, 3),
    );

    const ringCircles: THREE.LineSegments[] = [];

    for (let ring = 0; ring < safeRingCount; ring += 1) {
      const circle = new THREE.LineSegments(circleGeometry, gridMaterial);
      circle.frustumCulled = false;
      circle.renderOrder = 1;
      scene.add(circle);
      ringCircles.push(circle);
    }

    const longitudinalPositions: number[] = [];
    const nearZ = safeSpacing;
    const farZ = -period - safeSpacing;

    for (let slot = 0; slot < slotCount; slot += 1) {
      const theta = slot * arcRadians;
      const x = gridRadius * Math.sin(theta);
      const y = gridRadius * Math.cos(theta);
      longitudinalPositions.push(x, y, nearZ, x, y, farZ);
    }

    const longitudinalGeometry = new THREE.BufferGeometry();
    longitudinalGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(longitudinalPositions, 3),
    );

    const longitudinalLines = new THREE.LineSegments(
      longitudinalGeometry,
      gridMaterial,
    );
    longitudinalLines.frustumCulled = false;
    longitudinalLines.renderOrder = 1;
    scene.add(longitudinalLines);

    let flow = 0;
    let displayFlow = 0;
    let inertia = 0;
    let draggingNow = false;
    let lastPointerY = 0;
    let lastPointerTime = 0;
    let dragVelocity = 0;
    let lastFrameTime = 0;
    let rafId: number | null = null;
    let running = false;
    let visible = true;
    let reducedMotion = false;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updateReducedMotion = () => {
      reducedMotion = reducedMotionQuery.matches;
    };
    updateReducedMotion();
    reducedMotionQuery.addEventListener("change", updateReducedMotion);

    const updatePositions = (value: number) => {
      for (const entry of panelEntries) {
        entry.mesh.position.z = -positiveModulo(
          (entry.ring + 0.5) * safeSpacing - value,
          period,
        );
      }

      for (let ring = 0; ring < ringCircles.length; ring += 1) {
        const circle = ringCircles[ring];
        if (!circle) continue;
        circle.position.z = -positiveModulo(ring * safeSpacing - value, period);
      }
    };

    const renderFrame = (now: number) => {
      const motion = motionConfigRef.current;
      const previous = lastFrameTime || now;
      const delta = Math.min(0.1, Math.max(0.001, (now - previous) / 1000));
      lastFrameTime = now;

      if (!draggingNow) {
        if (!reducedMotion) {
          flow += motion.autoSpeed * delta;
        }

        if (Math.abs(inertia) > 0.001) {
          flow += inertia * delta;
          inertia *= Math.pow(0.92, delta * 60);
          if (Math.abs(inertia) <= 0.001) inertia = 0;
        }
      }

      const smoothing = 1 - Math.pow(1 - 0.1, delta * 60);
      displayFlow += (flow - displayFlow) * smoothing;
      updatePositions(displayFlow);
      renderer.render(scene, camera);

      if (running && visible && !document.hidden) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        running = false;
        rafId = null;
        lastFrameTime = 0;
      }
    };

    const start = () => {
      if (running) return;
      if (!visible) return;
      if (document.hidden) return;
      running = true;
      lastFrameTime = 0;
      rafId = window.requestAnimationFrame(renderFrame);
    };

    const stop = () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
      running = false;
      lastFrameTime = 0;
    };

    const handleWheel = (event: WheelEvent) => {
      const motion = motionConfigRef.current;
      if (motion.wheelSensitivity === 0) return;
      event.preventDefault();
      flow += event.deltaY * motion.wheelSensitivity;
      start();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      draggingNow = true;
      setDragging(true);
      lastPointerY = event.clientY;
      lastPointerTime = performance.now();
      dragVelocity = 0;
      inertia = 0;

      try {
        root.setPointerCapture(event.pointerId);
      } catch {
        /* Pointer capture is best-effort. */
      }

      start();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingNow) return;

      const motion = motionConfigRef.current;
      const dy = event.clientY - lastPointerY;
      if (dy === 0) return;

      const deltaFlow = -dy * motion.dragSensitivity;
      flow += deltaFlow;

      const now = performance.now();
      const elapsed = Math.max(8, now - lastPointerTime);
      dragVelocity = dragVelocity * 0.7 + (deltaFlow / (elapsed / 1000)) * 0.3;
      lastPointerY = event.clientY;
      lastPointerTime = now;
      start();
    };

    const endDrag = (event: PointerEvent) => {
      if (!draggingNow) return;

      draggingNow = false;
      setDragging(false);

      try {
        root.releasePointerCapture(event.pointerId);
      } catch {
        /* Pointer capture is best-effort. */
      }

      const idle = performance.now() - lastPointerTime;
      inertia = event.type === "pointercancel" || idle > 90 ? 0 : dragVelocity;
      start();
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    root.addEventListener("pointerdown", handlePointerDown);
    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible) start();
        else stop();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(root);

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    updatePositions(displayFlow);
    renderer.render(scene, camera);
    start();

    return () => {
      cancelled = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery.removeEventListener("change", updateReducedMotion);
      root.removeEventListener("wheel", handleWheel);
      root.removeEventListener("pointerdown", handlePointerDown);
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);

      panelGeometries.forEach((geometry) => geometry.dispose());
      circleGeometry.dispose();
      longitudinalGeometry.dispose();
      gridMaterial.dispose();
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }

      renderer.dispose();
      scene.clear();
    };
  }, [
    imagesKey,
    tunnelRadius,
    ringCount,
    ringSpacing,
    panelsPerRing,
    fov,
    theme,
    themeRevision,
    backgroundColor,
    gridColor,
  ]);

  const rootBackground =
    backgroundColor ??
    (theme === "dark"
      ? DARK_BACKGROUND
      : theme === "light"
        ? LIGHT_BACKGROUND
        : undefined);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={ariaLabel}
      data-flow-gallery=""
      className={cn(
        "relative h-full w-full select-none overflow-hidden",
        rootBackground ? null : "bg-white dark:bg-[#080808]",
        className,
      )}
      style={{
        ...(rootBackground ? { backgroundColor: rootBackground } : {}),
        borderRadius,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <div ref={containerRef} className="h-full w-full" />

      {failed ? (
        <div
          role="status"
          className={cn(
            "absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-neutral-500 dark:text-neutral-400",
            rootBackground ? null : "bg-white dark:bg-[#080808]",
          )}
          style={
            rootBackground ? { backgroundColor: rootBackground } : undefined
          }
        >
          Interactive 3D is unavailable on this device/browser.
        </div>
      ) : null}
    </div>
  );
}

/** Reference-name alias. */
export const ThreeDFlowGallery = FlowGallery;

export default FlowGallery;
