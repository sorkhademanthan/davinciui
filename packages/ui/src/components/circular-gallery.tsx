"use client";

import { cn } from "@workspace/ui/lib/utils";
import {
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  NoToneMapping,
  PerspectiveCamera,
  Raycaster,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  VideoTexture,
  WebGLRenderer,
  type Object3D,
} from "three";
import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

export interface CircularGalleryItem {
  /** Image or video source rendered inside the panel. */
  src: string;
  /** Media kind. Defaults to "image". */
  type?: "image" | "video";
  /** Accessible description for the media. */
  alt: string;
  /** Optional destination for the panel. */
  href?: string;
  /** Open the destination in a new tab. Defaults to false. */
  newTab?: boolean;
}

export interface CircularGalleryProps {
  /** Media arranged around the ring. Panel 0 starts at the front. */
  items: CircularGalleryItem[];
  /** Additional classes for the stage. */
  className?: string;
  /** Angular fill of each 360 / N slot, between 0 and 1. */
  panelWidth?: number;
  /** Panel height relative to the orbit radius. */
  panelHeight?: number;
  /** Rounded-corner radius relative to the panel height. */
  cornerRadius?: number;
  /** Orbit radius in world units. */
  orbitRadius?: number;
  /** Perspective camera settings. */
  perspective?: { fov?: number; distance?: number } | number;
  /** Vertical offset of the ring, relative to the orbit radius. */
  viewOffset?: number;
  /** Ring tilt around the view axis, in degrees. */
  ringTilt?: number;
  /** Darken panels according to their distance from the camera. */
  depthShading?: boolean;
  /** Maximum darkening applied to the far side of the ring. */
  shadeStrength?: number;
  /** Render a faded mirror of the ring underneath it. */
  reflection?: boolean;
  /** Opacity of the reflection. */
  reflectionOpacity?: number;
  /** Whether the ring rotates while idle. */
  autoSpin?: boolean;
  /** Idle rotation speed in degrees per second. */
  spinSpeed?: number;
  /** Pause the idle rotation while a panel is hovered. */
  pauseOnHover?: boolean;
  /** Motion smoothing constant. Higher is snappier. */
  motionSmoothing?: number;
  /** Allow the ring to be rotated by dragging. */
  dragRotation?: boolean;
  /** Multiplier applied to drag movement. */
  dragMultiplier?: number;
  /** Toggle or scale the release momentum. */
  releaseMomentum?: boolean | number;
  /** Horizontal alignment of the ring within the stage. */
  alignment?: "center" | "left" | "right";
  /** Allow rotation with the mouse wheel / trackpad. */
  wheelRotation?: boolean;
  /** Accessible name for the gallery region. */
  ariaLabel?: string;
  /** Enable pointer, wheel, and keyboard interaction. */
  interactive?: boolean;
}

const TAU = Math.PI * 2;
const MAX_PANELS = 12;
const MIN_PANELS = 3;
const FALLBACK_SIZE = 64;
const EMPTY_ITEM: CircularGalleryItem = { src: "", alt: "Gallery panel" };

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPanelAspect;
  uniform float uCornerRadius;
  uniform float uRadius;
  uniform float uCameraDistance;
  uniform float uShadeStrength;
  uniform float uDepthShading;
  uniform float uIsReflection;
  uniform float uReflectionOpacity;
  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec2 coverScale = vec2(1.0);
    if (uImageAspect > uPanelAspect) {
      coverScale.x = uPanelAspect / uImageAspect;
    } else {
      coverScale.y = uImageAspect / uPanelAspect;
    }
    vec2 uv = (vUv - 0.5) * coverScale + 0.5;

    vec4 texel;
    if (uIsReflection > 0.5) {
      vec2 blur = vec2(0.0, 0.007);
      texel = texture2D(uTexture, uv) * 0.5;
      texel += texture2D(uTexture, uv + blur) * 0.25;
      texel += texture2D(uTexture, uv - blur) * 0.25;
    } else {
      texel = texture2D(uTexture, uv);
    }

    vec3 color = texel.rgb;

    if (uDepthShading > 0.5) {
      float distanceToCamera = distance(vWorldPosition, uCameraPosition);
      float shade = 1.0 - uShadeStrength * smoothstep(
        uCameraDistance - uRadius,
        uCameraDistance + uRadius,
        distanceToCamera
      );
      color *= shade;
    }

    float alpha = texel.a;

    if (uCornerRadius > 0.0) {
      vec2 point = abs(vUv - 0.5) * vec2(uPanelAspect, 1.0);
      vec2 halfSize = vec2(uPanelAspect * 0.5, 0.5);
      vec2 corner = point - (halfSize - vec2(uCornerRadius));
      float distanceToEdge =
        length(max(corner, 0.0)) +
        min(max(corner.x, corner.y), 0.0) -
        uCornerRadius;
      float aa = max(fwidth(distanceToEdge), 0.0001);
      alpha *= 1.0 - smoothstep(-aa, aa, distanceToEdge);
    }

    if (uIsReflection > 0.5) {
      alpha *= uReflectionOpacity * (1.0 - smoothstep(0.0, 0.92, vUv.y));
    }

    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

interface GalleryRuntime {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  ring: Group;
  reflection: Group | null;
  materials: ShaderMaterial[];
  panelMeshes: Object3D[];
  geometries: CylinderGeometry[];
  textures: Texture[];
  videos: HTMLVideoElement[];
  targetRotation: number;
  displayRotation: number;
  velocity: number;
  spinScale: number;
  momentum: boolean;
  dragging: boolean;
  hovered: boolean;
  focused: boolean;
  ready: boolean;
  visible: boolean;
  reducedMotion: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function panelCount(items: CircularGalleryItem[]) {
  return clamp(items.length, MIN_PANELS, MAX_PANELS);
}

function createFallbackTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = FALLBACK_SIZE;
  canvas.height = FALLBACK_SIZE;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, FALLBACK_SIZE);
    gradient.addColorStop(0, "#d9d9d9");
    gradient.addColorStop(1, "#9c9c9c");
    context.fillStyle = gradient;
    context.fillRect(0, 0, FALLBACK_SIZE, FALLBACK_SIZE);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function applyImageSettings(texture: Texture, renderer: WebGLRenderer) {
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;
}

function isVideoItem(item: CircularGalleryItem) {
  return item.type === "video";
}

function loadImageTexture(
  src: string,
  loader: TextureLoader,
  renderer: WebGLRenderer,
) {
  return loader.loadAsync(src).then((texture) => {
    applyImageSettings(texture, renderer);
    return texture;
  });
}

function loadVideoTexture(
  src: string,
  renderer: WebGLRenderer,
): { texture: VideoTexture; video: HTMLVideoElement } {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.src = src;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = "auto";
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  const texture = new VideoTexture(video);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;

  const play = () => {
    const promise = video.play();
    if (promise) promise.catch(() => undefined);
  };
  video.addEventListener("canplay", play, { once: true });
  video.load();

  return { texture, video };
}

function imageAspect(texture: Texture) {
  const image = texture.image as
    | {
        naturalWidth?: number;
        naturalHeight?: number;
        videoWidth?: number;
        videoHeight?: number;
        width?: number;
        height?: number;
      }
    | undefined;
  const width = image?.videoWidth ?? image?.naturalWidth ?? image?.width ?? 1;
  const height =
    image?.videoHeight ?? image?.naturalHeight ?? image?.height ?? 1;
  return width / Math.max(height, 1);
}

function waitForVideo(video: HTMLVideoElement) {
  if (video.readyState >= 1) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let timeout = 0;
    const done = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", done);
      video.removeEventListener("error", done);
      resolve();
    };
    video.addEventListener("loadedmetadata", done, { once: true });
    video.addEventListener("error", done, { once: true });
    timeout = window.setTimeout(done, 4000);
  });
}

export function CircularGallery({
  items,
  className,
  panelWidth = 0.92,
  panelHeight = 1.45,
  cornerRadius = 0,
  orbitRadius = 1,
  perspective = { fov: 20.4, distance: 5.5 },
  viewOffset = 0,
  ringTilt = 0,
  depthShading = true,
  shadeStrength = 0.4,
  reflection = false,
  reflectionOpacity = 0.25,
  autoSpin = true,
  spinSpeed = 9,
  pauseOnHover = false,
  motionSmoothing = 8,
  dragRotation = true,
  dragMultiplier = 1,
  releaseMomentum = true,
  alignment = "center",
  wheelRotation = true,
  ariaLabel = "Circular image gallery",
  interactive = true,
}: CircularGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GalleryRuntime | null>(null);
  const propsRef = useRef({
    items,
    panelWidth,
    panelHeight,
    cornerRadius,
    orbitRadius,
    perspective,
    viewOffset,
    ringTilt,
    depthShading,
    shadeStrength,
    reflection,
    reflectionOpacity,
    autoSpin,
    spinSpeed,
    pauseOnHover,
    motionSmoothing,
    dragRotation,
    dragMultiplier,
    releaseMomentum,
    alignment,
    wheelRotation,
  });

  propsRef.current = {
    items,
    panelWidth,
    panelHeight,
    cornerRadius,
    orbitRadius,
    perspective,
    viewOffset,
    ringTilt,
    depthShading,
    shadeStrength,
    reflection,
    reflectionOpacity,
    autoSpin,
    spinSpeed,
    pauseOnHover,
    motionSmoothing,
    dragRotation,
    dragMultiplier,
    releaseMomentum,
    alignment,
    wheelRotation,
  };

  const perspectiveFov =
    typeof perspective === "number" ? perspective : (perspective?.fov ?? 20.4);
  const perspectiveDistance =
    typeof perspective === "number" ? 5.5 : (perspective?.distance ?? 5.5);

  const visibleItems = useMemo(() => items.slice(0, MAX_PANELS), [items]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    canvas.style.opacity = "0";
    const settings = propsRef.current;
    const radius = Math.max(settings.orbitRadius, 0.05);
    const height = Math.max(settings.panelHeight, 0.05);
    const count = panelCount(visibleItems);
    const panelItems = Array.from({ length: count }, (_, index) =>
      visibleItems.length > 0
        ? visibleItems[index % visibleItems.length]!
        : EMPTY_ITEM,
    );
    const slot = TAU / count;
    const thetaLength = slot * clamp(settings.panelWidth, 0.05, 1);
    const panelAspect = (radius * thetaLength) / height;
    const fov = perspectiveFov;
    const baseDistance = perspectiveDistance * radius;
    const tilt = (settings.ringTilt * Math.PI) / 180;
    const alignmentOffset =
      settings.alignment === "left"
        ? -0.35
        : settings.alignment === "right"
          ? 0.35
          : 0;

    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NoToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(fov, 1, 0.1, 100);
    const root = new Group();
    const ring = new Group();
    const reflectionGroup = settings.reflection ? new Group() : null;

    root.position.set(
      alignmentOffset * radius,
      settings.viewOffset * radius,
      0,
    );
    root.rotation.z = tilt;
    root.add(ring);
    scene.add(root);

    if (reflectionGroup) {
      reflectionGroup.position.set(
        alignmentOffset * radius,
        settings.viewOffset * radius - height,
        0,
      );
      reflectionGroup.scale.y = -1;
      reflectionGroup.rotation.z = -tilt;
      scene.add(reflectionGroup);
    }

    const fallbackTexture = createFallbackTexture();
    const textures: Texture[] = [fallbackTexture];
    const videos: HTMLVideoElement[] = [];
    const geometries: CylinderGeometry[] = [];
    const materials: ShaderMaterial[] = [];
    const panelMeshes: Object3D[] = [];
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");

    const createMaterial = (texture: Texture, isReflection: boolean) =>
      new ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uImageAspect: { value: imageAspect(texture) },
          uPanelAspect: { value: panelAspect },
          uCornerRadius: {
            value:
              clamp(settings.cornerRadius, 0, Math.min(0.5, panelAspect / 2)) /
              height,
          },
          uRadius: { value: radius },
          uCameraDistance: { value: baseDistance },
          uShadeStrength: { value: clamp(settings.shadeStrength, 0, 1) },
          uDepthShading: { value: settings.depthShading ? 1 : 0 },
          uIsReflection: { value: isReflection ? 1 : 0 },
          uReflectionOpacity: {
            value: isReflection ? clamp(settings.reflectionOpacity, 0, 1) : 0,
          },
          uCameraPosition: { value: camera.position.clone() },
        },
        vertexShader,
        fragmentShader,
        side: DoubleSide,
        transparent: isReflection || settings.cornerRadius > 0,
        depthTest: true,
        depthWrite: true,
      });

    const buildPanel = (index: number, isReflection: boolean) => {
      const thetaStart = index * slot - thetaLength / 2;
      const geometry = new CylinderGeometry(
        radius,
        radius,
        height,
        64,
        1,
        true,
        thetaStart,
        thetaLength,
      );
      const material = createMaterial(fallbackTexture, isReflection);
      const mesh = new Mesh(geometry, material);
      mesh.userData.panelIndex = index;
      geometries.push(geometry);
      materials.push(material);
      if (isReflection) {
        reflectionGroup?.add(mesh);
      } else {
        ring.add(mesh);
        panelMeshes.push(mesh);
      }
      return { material, mesh };
    };

    const panelEntries = panelItems.map((_, index) => buildPanel(index, false));
    const reflectionEntries = reflectionGroup
      ? panelItems.map((_, index) => buildPanel(index, true))
      : [];

    const setTexture = (
      entry: { material: ShaderMaterial },
      texture: Texture,
    ) => {
      entry.material.uniforms.uTexture!.value = texture;
      entry.material.uniforms.uImageAspect!.value = imageAspect(texture);
    };

    const runtime: GalleryRuntime = {
      renderer,
      scene,
      camera,
      ring,
      reflection: reflectionGroup,
      materials,
      panelMeshes,
      geometries,
      textures,
      videos,
      targetRotation: 0,
      displayRotation: 0,
      velocity: 0,
      spinScale: 1,
      momentum: false,
      dragging: false,
      hovered: false,
      focused: false,
      ready: false,
      visible: true,
      reducedMotion: false,
    };
    runtimeRef.current = runtime;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      runtime.reducedMotion = motionQuery.matches;
    };
    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const resize = () => {
      const width = Math.max(stage.clientWidth, 1);
      const heightPx = Math.max(stage.clientHeight, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, heightPx, false);

      const aspect = width / heightPx;
      const tanHalfFov = Math.tan((fov * Math.PI) / 360);
      const widthDistance =
        radius / Math.max(tanHalfFov * aspect * 0.9, 0.0001);
      const distance = Math.max(baseDistance, widthDistance);

      camera.aspect = aspect;
      camera.fov = fov;
      camera.position.set(0, 0, distance);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      materials.forEach((material) => {
        material.uniforms.uCameraDistance!.value = distance;
        material.uniforms.uCameraPosition!.value.copy(camera.position);
      });
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    let disposed = false;
    const readyFlags = panelItems.map(() => false);
    const markReady = (index: number) => {
      if (readyFlags[index]) return;
      readyFlags[index] = true;
      if (!runtime.ready && readyFlags.every(Boolean) && !disposed) {
        runtime.ready = true;
        requestAnimationFrame(() => {
          if (!disposed) {
            canvas.style.opacity = "1";
          }
        });
      }
    };

    panelItems.forEach((item, index) => {
      const entry = panelEntries[index];
      if (!entry) return;
      if (!item.src) {
        markReady(index);
        return;
      }

      if (isVideoItem(item)) {
        const { texture, video } = loadVideoTexture(item.src, renderer);
        videos.push(video);
        textures.push(texture);
        setTexture(entry, texture);
        const reflectionEntry = reflectionEntries[index];
        if (reflectionEntry) setTexture(reflectionEntry, texture);
        waitForVideo(video).then(() => {
          if (disposed) return;
          const aspect = imageAspect(texture);
          entry.material.uniforms.uImageAspect!.value = aspect;
          if (reflectionEntry) {
            reflectionEntry.material.uniforms.uImageAspect!.value = aspect;
          }
          markReady(index);
        });
      } else {
        loadImageTexture(item.src, loader, renderer)
          .then((texture) => {
            if (disposed) {
              texture.dispose();
              return;
            }
            textures.push(texture);
            setTexture(entry, texture);
            const reflectionEntry = reflectionEntries[index];
            if (reflectionEntry) setTexture(reflectionEntry, texture);
            markReady(index);
          })
          .catch(() => {
            markReady(index);
          });
      }
    });

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const intersectAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(panelMeshes, false);
      const hit = hits[0];
      if (!hit) return null;
      const index = hit.object.userData.panelIndex as number | undefined;
      if (typeof index !== "number") return null;
      return { index, item: panelItems[index]! };
    };

    let activePointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastMoveTime = performance.now();
    let startTime = 0;
    let moved = 0;

    const setCursor = (value: string) => {
      canvas.style.cursor = value;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!propsRef.current.dragRotation || event.button !== 0) return;
      if (activePointerId !== null) return;
      activePointerId = event.pointerId;
      runtime.dragging = true;
      runtime.momentum = false;
      runtime.velocity = 0;
      runtime.spinScale = 0;
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      startTime = performance.now();
      lastMoveTime = startTime;
      moved = 0;
      canvas.setPointerCapture(event.pointerId);
      setCursor("grabbing");
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (runtime.dragging && event.pointerId === activePointerId) {
        const now = performance.now();
        const deltaTime = Math.max((now - lastMoveTime) / 1000, 1 / 240);
        const deltaX = event.clientX - lastX;
        lastX = event.clientX;
        lastMoveTime = now;
        moved = Math.max(
          moved,
          Math.hypot(event.clientX - startX, event.clientY - startY),
        );

        const rect = canvas.getBoundingClientRect();
        const tanHalfFov = Math.tan((fov * Math.PI) / 360);
        const distance = camera.position.z;
        const frontRadiusPx =
          (radius / Math.max(distance - radius, 0.0001)) *
          (rect.height / 2 / tanHalfFov);
        const deltaTheta =
          (deltaX / Math.max(frontRadiusPx, 1)) *
          propsRef.current.dragMultiplier;
        runtime.targetRotation += deltaTheta;

        const instantaneous = deltaTheta / deltaTime;
        runtime.velocity = runtime.velocity * 0.72 + instantaneous * 0.28;
        runtime.velocity = clamp(runtime.velocity, -18, 18);
        return;
      }

      const hit = intersectAt(event.clientX, event.clientY);
      const overPanel = Boolean(hit);
      runtime.hovered = overPanel;
      if (hit?.item.href) {
        setCursor("pointer");
      } else {
        setCursor("grab");
      }
    };

    const hitHrefAt = (clientX: number, clientY: number) =>
      Boolean(intersectAt(clientX, clientY)?.item.href);

    const finishPointer = (event: PointerEvent, cancelled: boolean) => {
      if (!runtime.dragging || event.pointerId !== activePointerId) return;
      const now = performance.now();
      const isClick = !cancelled && moved < 5 && now - startTime < 300;

      if (runtime.dragging && activePointerId !== null) {
        if (canvas.hasPointerCapture(activePointerId)) {
          canvas.releasePointerCapture(activePointerId);
        }
      }
      runtime.dragging = false;
      activePointerId = null;

      if (isClick) {
        runtime.velocity = 0;
        runtime.momentum = false;
        const hit = intersectAt(event.clientX, event.clientY);
        if (hit?.item.href) {
          if (hit.item.newTab) {
            window.open(hit.item.href, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = hit.item.href;
          }
        }
      } else {
        const momentumAmount =
          typeof propsRef.current.releaseMomentum === "number"
            ? propsRef.current.releaseMomentum
            : propsRef.current.releaseMomentum
              ? 1
              : 0;
        if (momentumAmount > 0 && Math.abs(runtime.velocity) > 1e-4) {
          runtime.velocity *= momentumAmount;
          runtime.momentum = true;
        } else {
          runtime.velocity = 0;
          runtime.momentum = false;
        }
      }

      setCursor(hitHrefAt(event.clientX, event.clientY) ? "pointer" : "grab");
    };

    const handlePointerUp = (event: PointerEvent) => {
      finishPointer(event, false);
    };
    const handlePointerCancel = (event: PointerEvent) => {
      finishPointer(event, true);
    };
    const handlePointerLeave = () => {
      if (!runtime.dragging) {
        runtime.hovered = false;
        setCursor("grab");
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (propsRef.current.dragRotation) return;
      const hit = intersectAt(event.clientX, event.clientY);
      if (!hit?.item.href) return;
      if (hit.item.newTab) {
        window.open(hit.item.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = hit.item.href;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!interactive || !propsRef.current.wheelRotation) return;
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY + event.deltaX;
      runtime.targetRotation += delta * 0.0015;
    };

    if (interactive) {
      canvas.addEventListener("pointerdown", handlePointerDown);
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("pointerup", handlePointerUp);
      canvas.addEventListener("pointercancel", handlePointerCancel);
      canvas.addEventListener("pointerleave", handlePointerLeave);
      canvas.addEventListener("click", handleClick);
      canvas.addEventListener("wheel", handleWheel, { passive: false });
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        runtime.visible = Boolean(entries[0]?.isIntersecting);
      },
      { threshold: 0.01 },
    );
    intersectionObserver.observe(stage);

    const handleVisibilityChange = () => {
      if (document.hidden) runtime.visible = false;
      else if (intersectionObserver) {
        const rect = stage.getBoundingClientRect();
        runtime.visible =
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let frameId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      frameId = requestAnimationFrame(frame);

      if (!runtime.visible || document.hidden) {
        lastTime = now;
        return;
      }

      const delta = clamp((now - lastTime) / 1000, 0, 0.05);
      lastTime = now;
      const current = propsRef.current;

      if (runtime.dragging) {
        runtime.spinScale +=
          (0 - runtime.spinScale) * (1 - Math.exp(-delta * 10));
      } else if (runtime.momentum) {
        runtime.targetRotation += runtime.velocity * delta;
        runtime.velocity *= Math.pow(0.95, delta * 60);
        runtime.spinScale +=
          (0 - runtime.spinScale) * (1 - Math.exp(-delta * 10));
        if (Math.abs(runtime.velocity) < 1e-4) {
          runtime.velocity = 0;
          runtime.momentum = false;
        }
      } else if (
        current.autoSpin &&
        !runtime.reducedMotion &&
        !runtime.focused
      ) {
        const targetSpinScale = current.pauseOnHover && runtime.hovered ? 0 : 1;
        runtime.spinScale +=
          (targetSpinScale - runtime.spinScale) * (1 - Math.exp(-delta * 4));
        runtime.targetRotation +=
          ((current.spinSpeed * Math.PI) / 180) * runtime.spinScale * delta;
      } else {
        runtime.spinScale +=
          (0 - runtime.spinScale) * (1 - Math.exp(-delta * 4));
      }

      const smoothing = Math.max(current.motionSmoothing, 0.001);
      const ease = 1 - Math.exp(-delta * smoothing);
      runtime.displayRotation +=
        (runtime.targetRotation - runtime.displayRotation) * ease;

      runtime.ring.rotation.y = runtime.displayRotation;
      if (runtime.reflection) {
        runtime.reflection.rotation.y = runtime.displayRotation;
      }

      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", syncMotionPreference);
      if (interactive) {
        canvas.removeEventListener("pointerdown", handlePointerDown);
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerup", handlePointerUp);
        canvas.removeEventListener("pointercancel", handlePointerCancel);
        canvas.removeEventListener("pointerleave", handlePointerLeave);
        canvas.removeEventListener("click", handleClick);
        canvas.removeEventListener("wheel", handleWheel);
      }

      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      runtimeRef.current = null;
    };
  }, [
    visibleItems,
    panelWidth,
    panelHeight,
    cornerRadius,
    orbitRadius,
    perspectiveFov,
    perspectiveDistance,
    viewOffset,
    ringTilt,
    depthShading,
    shadeStrength,
    reflection,
    reflectionOpacity,
    alignment,
    interactive,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const runtime = runtimeRef.current;
    if (!runtime) return;
    event.preventDefault();
    const count = Math.max(panelCount(visibleItems), 1);
    const step = TAU / count;
    runtime.targetRotation += event.key === "ArrowRight" ? step : -step;
    runtime.momentum = false;
    runtime.velocity = 0;
  };

  const focusPanel = (index: number) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const count = Math.max(panelCount(visibleItems), 1);
    const step = TAU / count;
    const desired = -index * step;
    const nearestCycle = Math.round((runtime.targetRotation - desired) / TAU);
    runtime.targetRotation = desired + nearestCycle * TAU;
    runtime.velocity = 0;
    runtime.momentum = false;
    runtime.focused = true;
  };

  const blurPanel = (event: FocusEvent<HTMLAnchorElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && stageRef.current?.contains(next)) return;
    const runtime = runtimeRef.current;
    if (runtime) runtime.focused = false;
  };

  const hiddenStyle: CSSProperties = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };

  return (
    <div
      ref={stageRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-background",
        className,
      )}
      role="region"
      aria-label={ariaLabel}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: interactive ? "none" : "auto",
          cursor: interactive ? "grab" : "inherit",
          pointerEvents: interactive ? "auto" : "none",
          opacity: 0,
          transition: "opacity 500ms ease",
        }}
      />
      {interactive ? (
        <ul style={hiddenStyle}>
          {visibleItems.map((item, index) => (
            <li key={`${item.src}-${index}`}>
              <a
                href={item.href}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                tabIndex={0}
                onFocus={() => focusPanel(index)}
                onBlur={blurPanel}
                onKeyDown={handleKeyDown}
              >
                {item.alt}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
