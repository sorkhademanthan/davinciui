declare module "threejs-components/build/cursors/tubes1.min.js" {
  export interface TubesCursorTubes {
    setColors?: (colors: string[]) => void;
    setLightsColors?: (colors: string[]) => void;
    setLightsIntensity?: (value: number) => void;
  }

  export interface TubesCursorRenderer {
    minPixelRatio?: number;
    maxPixelRatio?: number;
    resize?: () => void;
    renderer?: {
      forceContextLoss?: () => void;
    };
  }

  export interface TubesCursorInstance {
    dispose?: () => void;
    tubes?: TubesCursorTubes;
    three?: TubesCursorRenderer;
  }

  export interface TubesCursorEngineOptions {
    bloom?: { threshold?: number; strength?: number; radius?: number } | null;
    tubes?: {
      count?: number;
      colors?: string[];
      lights?: { intensity?: number; colors?: string[] };
    };
    /** Ambient drift amplitude while the pointer is outside the canvas. */
    sleepRadiusX?: number;
    /** Ambient drift amplitude while the pointer is outside the canvas. */
    sleepRadiusY?: number;
  }

  const createTubesCursor: (
    canvas: HTMLCanvasElement,
    options?: TubesCursorEngineOptions,
  ) => TubesCursorInstance;
  export default createTubesCursor;
}
