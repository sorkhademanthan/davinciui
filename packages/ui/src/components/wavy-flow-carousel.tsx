"use client";

import * as React from "react";
import * as THREE from "three";

export type WavyFlowCarouselSlideType = "image" | "video";

export interface WavyFlowCarouselSlide {
  src: string;
  type: WavyFlowCarouselSlideType;
}

export interface WavyFlowCarouselProps {
  slides?: WavyFlowCarouselSlide[];
  slideWidth?: number;
  slideHeight?: number;
  spacing?: number;
  waveStretch?: number;
  waveHeight?: number;
  waveFrequency?: number;
  wavePhase?: number;
  autoRotate?: boolean;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  dragEnabled?: boolean;
  momentum?: boolean;
  wheelEnabled?: boolean;
  background?: string;
  fit?: "cover" | "contain";
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const DEFAULT_SLIDES: WavyFlowCarouselSlide[] = [
  { src: "/images/spiral-3d-slider/orange-haze.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/blue-double.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/white-motion.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/camera-reflection.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/silver-motion.jpg", type: "image" },
  { src: "/images/spiral-3d-slider/green-portrait.jpg", type: "image" },
];

export const DEFAULT_PROPS = {
  slideWidth: 0.407,
  slideHeight: 0.5,
  spacing: 0,
  waveStretch: 0.25,
  waveHeight: 0.15,
  waveFrequency: 1 / 3.86,
  wavePhase: 1.2,
  speed: 0.149,
  background: "var(--background, #ffffff)",
} as const;

const BASE_CENTER = 0.514;
const DEFAULT_FIT = "cover" as const;

const vertexShader = /* glsl */ `
uniform float uLambda;
uniform float uPhase;
uniform float uStretch;
uniform float uSlideW;
uniform float uBaseH;
uniform float uTopY;
uniform float uAnchor;
uniform float uImageAspect;
uniform float uFit;

varying vec2 vUv;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float x = wp.x;
  float w = sin(6.28318530718 * x / uLambda + uPhase);
  float s = 1.0 + uStretch * w;
  float v = 1.0 - uv.y;
  float yTop = uAnchor - s * (uAnchor - uTopY);
  float yBottom = uAnchor - s * (uAnchor - (uTopY + uBaseH));
  float y = yTop + v * (yBottom - yTop);

  float h = yBottom - yTop;
  float slideAspect = uSlideW / max(h, 1.0);
  float a = uImageAspect;
  vec2 suv = uv;
  if (uFit < 0.5) {
    if (a > slideAspect) {
      suv.x = 0.5 + (uv.x - 0.5) * (slideAspect / a);
    } else {
      suv.y = 0.5 + (uv.y - 0.5) * (a / slideAspect);
    }
  } else {
    if (a > slideAspect) {
      suv.y = 0.5 + (uv.y - 0.5) * (a / slideAspect);
    } else {
      suv.x = 0.5 + (uv.x - 0.5) * (slideAspect / a);
    }
  }
  vUv = suv;
  gl_Position = projectionMatrix * viewMatrix * vec4(x, y, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(uMap, vUv);
}
`;

function resolveCssColor(value: string, scope: Element): string {
  try {
    const needsProbe =
      value.includes("var(") ||
      value.includes("color-mix(") ||
      value.includes("oklch") ||
      value.includes("oklab") ||
      value.includes("lch(") ||
      value.includes("lab(");
    if (!needsProbe) return value;
    const probe = document.createElement("span");
    probe.style.background = value;
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    scope.appendChild(probe);
    const resolved = getComputedStyle(probe).backgroundColor || value;
    probe.remove();
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return resolved;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = resolved;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
  } catch {
    return "#ffffff";
  }
}

function imageAspectOfTexture(texture: THREE.Texture): number {
  const image = texture.image as
    | { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
    | undefined;
  if (!image) return 3 / 4;
  const w = image.naturalWidth ?? image.width ?? 3;
  const h = image.naturalHeight ?? image.height ?? 4;
  if (!w || !h) return 3 / 4;
  return w / h;
}

export function WavyFlowCarousel(props: WavyFlowCarouselProps) {
  const {
    slides,
    slideWidth = DEFAULT_PROPS.slideWidth,
    slideHeight = DEFAULT_PROPS.slideHeight,
    spacing = DEFAULT_PROPS.spacing,
    waveStretch = DEFAULT_PROPS.waveStretch,
    waveHeight = DEFAULT_PROPS.waveHeight,
    waveFrequency = DEFAULT_PROPS.waveFrequency,
    wavePhase = DEFAULT_PROPS.wavePhase,
    autoRotate = true,
    speed = DEFAULT_PROPS.speed,
    direction = "left",
    pauseOnHover = false,
    dragEnabled = true,
    momentum = true,
    wheelEnabled = true,
    background = DEFAULT_PROPS.background,
    fit = DEFAULT_FIT,
    className,
    style,
    ariaLabel = "Wavy flow carousel",
  } = props;

  const resolvedSlides =
    slides && slides.length >= 3 ? slides : DEFAULT_SLIDES;

  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const stateRef = React.useRef({
    offset: 0,
    velocity: 0,
    autoWeight: autoRotate ? 1 : 0,
    dragging: false,
    hovering: false,
    pendingWheel: 0,
    running: false,
    raf: 0,
    last: 0,
    waveSpring: { value: 0, velocity: 0 },
  });

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const state = stateRef.current;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = reducedMotionQuery.matches;
    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    const applyBackground = () => {
      renderer.setClearColor(new THREE.Color(resolveCssColor(background, wrapper)), 1);
    };
    applyBackground();
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const themeObserver = new MutationObserver(() => {
      if (background.includes("var(")) applyBackground();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1);

    const shared = {
      uLambda: { value: 1 },
      uPhase: { value: wavePhase },
      uStretch: { value: waveStretch },
      uSlideW: { value: 1 },
      uBaseH: { value: 1 },
      uTopY: { value: 0 },
      uAnchor: { value: 1 },
      uFit: { value: fit === "cover" ? 0 : 1 },
    };

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const slideCount = resolvedSlides.length;

    const textures: THREE.Texture[] = [];
    const videos: HTMLVideoElement[] = [];
    const materials: THREE.ShaderMaterial[] = [];
    let geometry: THREE.PlaneGeometry | null = null;
    const meshes: THREE.Mesh[] = [];

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const buildMaterials = () => {
      materials.forEach((material) => material.dispose());
      materials.length = 0;
      return resolvedSlides.map(() => {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            ...shared,
            uMap: { value: null as THREE.Texture | null },
            uImageAspect: { value: 3 / 4 },
          },
          vertexShader,
          fragmentShader,
        });
        materials.push(material);
        return material;
      });
    };

    const slideMaterials = buildMaterials();

    const prepareTexture = (
      texture: THREE.Texture,
      material: THREE.ShaderMaterial,
    ) => {
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = Math.min(16, maxAnisotropy);
      texture.needsUpdate = true;
      material.uniforms.uMap!.value = texture;
      material.uniforms.uImageAspect!.value = imageAspectOfTexture(texture);
      textures.push(texture);
    };

    resolvedSlides.forEach((slide, index) => {
      const material = slideMaterials[index]!;
      if (slide.type === "video") {
        const video = document.createElement("video");
        video.src = slide.src;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        video.crossOrigin = "anonymous";
        const texture = new THREE.VideoTexture(video);
        prepareTexture(texture, material);
        video.addEventListener("loadeddata", () => {
          material.uniforms.uImageAspect!.value =
            imageAspectOfTexture(texture);
        });
        videos.push(video);
      } else {
        loader.load(slide.src, (texture) => {
          prepareTexture(texture, material);
        });
      }
    });

    let width = 0;
    let height = 0;

    const layout = () => {
      const rect = wrapper.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const h = height;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);

      camera.left = 0;
      camera.right = width;
      camera.top = 0;
      camera.bottom = height;
      camera.updateProjectionMatrix();

      const baseH = slideHeight * h;
      const anchor = BASE_CENTER * h + (waveHeight * h) / waveStretch;
      shared.uBaseH.value = baseH;
      shared.uTopY.value = anchor - (waveHeight * h) / waveStretch - baseH / 2;
      shared.uAnchor.value = anchor;
      shared.uSlideW.value = slideWidth * h;
      shared.uLambda.value = h / waveFrequency;
      shared.uStretch.value = waveStretch;
      shared.uFit.value = fit === "cover" ? 0 : 1;

      const slideW = slideWidth * h;
      const pitch = slideW + spacing;
      const count = Math.ceil(width / pitch) + 3;

      geometry?.dispose();
      geometry = new THREE.PlaneGeometry(slideW, 1, 24, 1);
      meshes.forEach((mesh) => {
        mesh.geometry = geometry!;
      });
      while (meshes.length < count) {
        const index = meshes.length;
        const slideIndex = index % slideCount;
        const mesh = new THREE.Mesh(
          geometry,
          slideMaterials[slideIndex],
        );
        mesh.frustumCulled = false;
        meshes.push(mesh);
      }
      while (meshes.length > count) {
        meshes.pop();
      }
      meshes.forEach((mesh, index) => {
        mesh.material = slideMaterials[index % slideCount]!;
      });
      return pitch;
    };

    let pitch = layout();

    const resizeObserver = new ResizeObserver(() => {
      pitch = layout();
    });
    resizeObserver.observe(wrapper);

    const total = () => meshes.length * pitch;

    const placeMeshes = () => {
      const totalWidth = total();
      for (let index = 0; index < meshes.length; index += 1) {
        let x = (index * pitch - state.offset) % totalWidth;
        if (x < 0) x += totalWidth;
        meshes[index]!.position.x = x - pitch;
      }
    };

    const scene = new THREE.Scene();
    const attachMeshes = () => {
      meshes.forEach((mesh) => {
        if (!mesh.parent) scene.add(mesh);
      });
    };
    attachMeshes();

    const render = () => {
      meshes.forEach((mesh) => {
        if (!mesh.parent) scene.add(mesh);
      });
      renderer.render(scene, camera);
    };

    const setVideosPlaying = (playing: boolean) => {
      videos.forEach((video) => {
        if (playing) {
          const result = video.play();
          if (result && typeof result.catch === "function") {
            result.catch(() => {});
          }
        } else {
          video.pause();
        }
      });
    };

    let inView = true;
    let documentHidden = document.hidden;

    const shouldRun = () => inView && !documentHidden;

    const tick = (now: number) => {
      state.raf = window.requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.0001, (now - state.last) / 1000));
      state.last = now;

      if (!state.dragging && momentum && Math.abs(state.velocity) > 0.5) {
        state.offset += state.velocity * dt;
        state.velocity *= Math.pow(0.95, dt * 60);
        if (Math.abs(state.velocity) <= 0.5) state.velocity = 0;
      }

      if (Math.abs(state.pendingWheel) > 0.01) {
        const take = state.pendingWheel * Math.min(1, dt * 12);
        state.offset += take;
        state.pendingWheel -= take;
      }

      const autoTarget =
        autoRotate &&
        !reducedMotion &&
        !state.dragging &&
        (!pauseOnHover || !state.hovering)
          ? 1
          : 0;
      state.autoWeight += (autoTarget - state.autoWeight) * Math.min(1, dt * 4);
      if (state.autoWeight < 0.001) state.autoWeight = autoTarget === 0 ? 0 : state.autoWeight;

      const dir = direction === "left" ? 1 : -1;
      state.offset += dir * speed * height * state.autoWeight * dt;

      if (reducedMotion) {
        state.waveSpring.value = state.offset;
        state.waveSpring.velocity = 0;
      } else {
        const stiffness = 20;
        const damping = 23.6;
        const mass = 1;
        const subSteps = 4;
        const subDt = dt / subSteps;
        for (let step = 0; step < subSteps; step += 1) {
          const acceleration =
            (-stiffness * (state.waveSpring.value - state.offset) -
              damping * state.waveSpring.velocity) /
            mass;
          state.waveSpring.velocity += acceleration * subDt;
          state.waveSpring.value += state.waveSpring.velocity * subDt;
        }
        if (
          Math.abs(state.waveSpring.value - state.offset) < 0.001 &&
          Math.abs(state.waveSpring.velocity) < 0.01
        ) {
          state.waveSpring.value = state.offset;
          state.waveSpring.velocity = 0;
        }
      }

      shared.uPhase.value =
        wavePhase + (state.waveSpring.value * ((2 * Math.PI) / shared.uLambda.value));

      placeMeshes();
      render();
    };

    const start = () => {
      if (state.running) return;
      state.running = true;
      state.last = performance.now();
      setVideosPlaying(true);
      state.raf = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!state.running) return;
      state.running = false;
      window.cancelAnimationFrame(state.raf);
      setVideosPlaying(false);
    };

    const updateRunning = () => {
      if (shouldRun()) start();
      else stop();
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        updateRunning();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(wrapper);

    const onVisibilityChange = () => {
      documentHidden = document.hidden;
      updateRunning();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let lastPointerX = 0;
    let lastPointerTime = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (!dragEnabled) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      state.dragging = true;
      state.velocity = 0;
      lastPointerX = event.clientX;
      lastPointerTime = performance.now();
      wrapper.setPointerCapture(event.pointerId);
      wrapper.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!state.dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastPointerTime) / 1000;
      const dx = event.clientX - lastPointerX;
      state.offset -= dx;
      const instantVelocity = -dx / dt;
      state.velocity = state.velocity * 0.75 + instantVelocity * 0.25;
      lastPointerX = event.clientX;
      lastPointerTime = now;
    };

    const endDrag = (event: PointerEvent) => {
      if (!state.dragging) return;
      state.dragging = false;
      if (wrapper.hasPointerCapture(event.pointerId)) {
        wrapper.releasePointerCapture(event.pointerId);
      }
      wrapper.style.cursor = "grab";
      if (!momentum) state.velocity = 0;
    };

    const onPointerEnter = () => {
      state.hovering = true;
    };
    const onPointerLeave = () => {
      state.hovering = false;
    };

    const onWheel = (event: WheelEvent) => {
      if (!wheelEnabled) return;
      const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      event.preventDefault();
      state.pendingWheel += delta;
    };

    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerup", endDrag);
    wrapper.addEventListener("pointercancel", endDrag);
    wrapper.addEventListener("pointerenter", onPointerEnter);
    wrapper.addEventListener("pointerleave", onPointerLeave);
    wrapper.addEventListener("wheel", onWheel, { passive: false });

    placeMeshes();
    render();
    updateRunning();

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerup", endDrag);
      wrapper.removeEventListener("pointercancel", endDrag);
      wrapper.removeEventListener("pointerenter", onPointerEnter);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      wrapper.removeEventListener("wheel", onWheel);
      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      meshes.forEach((mesh) => scene.remove(mesh));
      geometry?.dispose();
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      state.pendingWheel = 0;
      state.velocity = 0;
      state.waveSpring.value = 0;
      state.waveSpring.velocity = 0;
      state.autoWeight = autoRotate ? 1 : 0;
    };
  }, [
    resolvedSlides,
    slideWidth,
    slideHeight,
    spacing,
    waveStretch,
    waveHeight,
    waveFrequency,
    wavePhase,
    autoRotate,
    speed,
    direction,
    pauseOnHover,
    dragEnabled,
    momentum,
    wheelEnabled,
    background,
    fit,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      role="region"
      aria-label={ariaLabel}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background,
        cursor: "grab",
        touchAction: "pan-y",
        userSelect: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default WavyFlowCarousel;
