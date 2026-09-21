"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type AmbientVisualizerStyle = "wave" | "bars";
export type AmbientLabelPosition = "left" | "right" | "above" | "below";
export type AmbientWaveCap = "round" | "square";

export interface AmbientAudioToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "color" | "onChange"
> {
  /** MP3, WAV, OGG, or M4A audio URL. Audio stays silent until activated. */
  src: string;
  /** Stable session name used to retain the audio element across route changes. */
  persistenceKey?: string;
  /** Start each track again after it ends. */
  loop?: boolean;
  /** Playback volume from 0 to 100. */
  volume?: number;
  /** Waveform presentation. */
  visualizer?: AmbientVisualizerStyle;
  /** Active waveform color. Follows the site theme when omitted. */
  activeColor?: string;
  /** Paused waveform color. Follows the site theme when omitted. */
  inactiveColor?: string;
  /** Playing label color. Follows the site theme when omitted. */
  playingColor?: string;
  /** Paused label color. Follows the site theme when omitted. */
  pausedColor?: string;
  /** Button label shown while audio is playing. */
  labelPlaying?: string;
  /** Button label shown while audio is paused. */
  labelPaused?: string;
  /** Hide the status label. */
  hideLabel?: boolean;
  /** Waveform width in pixels. */
  waveformWidth?: number;
  /** Waveform height in pixels. */
  waveformHeight?: number;
  /** Waveform stroke width in pixels. */
  lineWeight?: number;
  /** Rounded or square waveform ends. */
  lineCap?: AmbientWaveCap;
  /** Number of bars, from 4 to 80. */
  barCount?: number;
  /** Visible waveform level while paused, from 0 to 1. */
  pausedAmount?: number;
  /** Visualizer animation speed multiplier. */
  animationSpeed?: number;
  /** Animation amplitude multiplier. */
  intensity?: number;
  /** Play/pause crossfade duration in seconds. */
  transition?: number;
  /** Gap between the label and waveform in pixels. */
  labelGap?: number;
  /** Position of the status label around the waveform. */
  labelPosition?: AmbientLabelPosition;
  /** Additional classes applied to the toggle button. */
  className?: string;
}

// Theme-aware runtime defaults: light mode → deep emerald waveform with dark
// ink labels on the light button, dark mode → mint waveform with pale labels
// on the dark button. Pure CSS variables, so toggling the theme never touches
// the audio session or rebuilds the visualizer.
const THEME_COLOR_VARS = {
  activeColor: "var(--ambient-active)",
  inactiveColor: "var(--ambient-inactive)",
  playingColor: "var(--ambient-playing)",
  pausedColor: "var(--ambient-paused)",
} as const;

type AudioSession = {
  audio: HTMLAudioElement;
  playing: boolean;
  tabPausedPlayback: boolean;
};

const sessions = new Map<string, AudioSession>();
const sessionListeners = new Map<string, Set<() => void>>();

function notifySession(key: string, session: AudioSession) {
  session.playing = !session.audio.paused && !session.audio.ended;
  sessionListeners.get(key)?.forEach((listener) => listener());
}

function getSession(key: string, src: string, volume: number, loop: boolean) {
  const existing = sessions.get(key);
  if (existing) {
    existing.audio.volume = volume;
    existing.audio.loop = loop;
    return existing;
  }

  const audio = new Audio(src);
  audio.preload = "none";
  audio.volume = volume;
  audio.loop = loop;
  const session: AudioSession = {
    audio,
    playing: false,
    tabPausedPlayback: false,
  };
  const notify = () => notifySession(key, session);
  audio.addEventListener("play", notify);
  audio.addEventListener("pause", notify);
  audio.addEventListener("ended", notify);
  audio.addEventListener("error", notify);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (!audio.paused) {
        session.tabPausedPlayback = true;
        audio.pause();
      }
      return;
    }

    if (session.tabPausedPlayback) {
      session.tabPausedPlayback = false;
      void audio.play().catch(notify);
    }
  });
  sessions.set(key, session);
  return session;
}

function wavePath(points: number) {
  const count = Math.max(12, Math.round(points));
  const samples = Array.from({ length: count }, (_, index) => {
    const x = (index / (count - 1)) * 120;
    const envelope = 0.35 + 0.65 * Math.sin((index / (count - 1)) * Math.PI);
    const y = 20 + Math.sin(index * 0.72) * 12 * envelope;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return samples.join(" ");
}

function useAudioPlaying(sessionKey: string) {
  const subscribe = React.useCallback(
    (listener: () => void) => {
      let listeners = sessionListeners.get(sessionKey);
      if (!listeners) {
        listeners = new Set();
        sessionListeners.set(sessionKey, listeners);
      }
      listeners.add(listener);
      return () => {
        listeners?.delete(listener);
        if (listeners?.size === 0 && !sessions.has(sessionKey)) {
          sessionListeners.delete(sessionKey);
        }
      };
    },
    [sessionKey],
  );
  const getSnapshot = React.useCallback(
    () => sessions.get(sessionKey)?.playing ?? false,
    [sessionKey],
  );
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function AmbientAudioToggle({
  src = "",
  persistenceKey,
  loop = true,
  volume = 65,
  visualizer = "wave",
  activeColor = THEME_COLOR_VARS.activeColor,
  inactiveColor = THEME_COLOR_VARS.inactiveColor,
  playingColor = THEME_COLOR_VARS.playingColor,
  pausedColor = THEME_COLOR_VARS.pausedColor,
  labelPlaying = "Playing",
  labelPaused = "Play ambient audio",
  hideLabel = false,
  waveformWidth = 112,
  waveformHeight = 36,
  lineWeight = 2,
  lineCap = "round",
  barCount = 24,
  pausedAmount = 0.2,
  animationSpeed = 1.1,
  intensity = 1,
  transition = 0.35,
  labelGap = 10,
  labelPosition = "right",
  className,
  style,
  onClick,
  ...props
}: AmbientAudioToggleProps) {
  const sessionKey = persistenceKey || src;
  const isPlaying = useAudioPlaying(sessionKey);
  const [playbackError, setPlaybackError] = React.useState(false);
  const normalizedBars = Math.min(80, Math.max(4, Math.round(barCount)));
  const normalizedVolume = Math.min(100, Math.max(0, volume)) / 100;
  const safeTransition = Math.max(0, transition);
  const motionDuration = `${1.1 / Math.min(4, Math.max(0.25, animationSpeed))}s`;
  const isAbove = labelPosition === "above";
  const isBelow = labelPosition === "below";
  const isLeft = labelPosition === "left";
  const column = isAbove || isBelow;
  const orderedLabel = isLeft || isAbove;

  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !src.trim()) return;

    const session = getSession(sessionKey, src, normalizedVolume, loop);
    session.audio.volume = normalizedVolume;
    session.audio.loop = loop;

    if (session.audio.paused) {
      setPlaybackError(false);
      void session.audio
        .play()
        .then(() => {
          notifySession(sessionKey, session);
        })
        .catch(() => {
          setPlaybackError(true);
          notifySession(sessionKey, session);
        });
    } else {
      session.tabPausedPlayback = false;
      session.audio.pause();
    }
  };

  const values = Array.from({ length: normalizedBars }, (_, index) => {
    const wave = Math.abs(Math.sin(index * 1.71 + 0.35));
    const overtone = Math.abs(Math.sin(index * 0.63 + 1.1));
    return 0.16 + wave * 0.5 + overtone * 0.34;
  });
  const waveData = wavePath(normalizedBars * 2);
  const label = isPlaying ? labelPlaying : labelPaused;
  const accessibleLabel = playbackError
    ? "Audio could not be played. Check the audio URL and try again."
    : isPlaying
      ? `Pause ${labelPlaying.toLowerCase().replace(/^playing$/, "ambient audio")}`
      : `Play ${labelPaused.toLowerCase().replace(/^play\s+/, "")}`;
  React.useEffect(() => {
    const session = sessions.get(sessionKey);
    if (!session) return;

    const nextSource = new URL(src, document.baseURI).href;
    if (session.audio.src !== nextSource) {
      const wasPlaying = !session.audio.paused;
      session.audio.pause();
      session.audio.src = src;
      session.audio.load();
      if (wasPlaying) {
        void session.audio
          .play()
          .catch(() => notifySession(sessionKey, session));
      }
    }
    session.audio.volume = normalizedVolume;
    session.audio.loop = loop;
  }, [loop, normalizedVolume, sessionKey, src]);

  return (
    <button
      type="button"
      aria-label={accessibleLabel}
      aria-pressed={isPlaying}
      data-slot="ambient-audio-toggle"
      data-playing={isPlaying}
      onClick={toggle}
      className={cn(
        "group inline-flex min-h-12 min-w-12 select-none items-center justify-center rounded-xl border border-zinc-950/10 bg-white/90 px-3 py-2 text-left shadow-lg shadow-zinc-950/10 backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] hover:border-emerald-600/40 hover:bg-zinc-50 hover:shadow-xl hover:shadow-zinc-950/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98]",
        "dark:border-white/15 dark:bg-zinc-950/90 dark:shadow-black/25 dark:hover:border-emerald-200/35 dark:hover:bg-zinc-900 dark:hover:shadow-black/30 dark:focus-visible:ring-emerald-300 dark:focus-visible:ring-offset-zinc-950",
        "[--ambient-active:#047857] [--ambient-inactive:#94a3b8] [--ambient-playing:#09090b] [--ambient-paused:#64748b]",
        "dark:[--ambient-active:#a7f3d0] dark:[--ambient-inactive:#64748b] dark:[--ambient-playing:#f8fafc] dark:[--ambient-paused:#94a3b8]",
        column ? "flex-col" : "flex-row",
        className,
      )}
      style={{ gap: labelGap, ...style }}
      {...props}
    >
      <style>{`
        @keyframes ambient-audio-wave-scroll { to { stroke-dashoffset: -42; } }
        @keyframes ambient-audio-bar-pulse { 0%, 100% { transform: scaleY(.32); } 50% { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) {
          .ambient-audio-wave-motion, .ambient-audio-bar-motion { animation: none !important; }
        }
      `}</style>
      {!hideLabel && orderedLabel && (
        <span
          className="whitespace-nowrap text-xs font-medium"
          style={{
            color: isPlaying ? playingColor : pausedColor,
            transition: `color ${safeTransition}s ease`,
          }}
        >
          {label}
        </span>
      )}
      {visualizer === "bars" ? (
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center"
          style={{
            width: waveformWidth,
            height: waveformHeight,
            gap: Math.max(1, waveformWidth / normalizedBars / 3),
          }}
        >
          {values.map((value, index) => {
            const amplitude = isPlaying
              ? (0.3 + value * 0.7) * intensity
              : value * pausedAmount;
            return (
              <span
                key={index}
                className={isPlaying ? "ambient-audio-bar-motion" : undefined}
                style={{
                  width: Math.max(1, (waveformWidth / normalizedBars) * 0.48),
                  height: `${Math.max(isPlaying ? 8 : 0, Math.min(100, amplitude * 100))}%`,
                  borderRadius: lineCap === "round" ? 999 : 0,
                  backgroundColor: isPlaying ? activeColor : inactiveColor,
                  opacity: isPlaying ? 1 : 0.75,
                  animation: isPlaying
                    ? `ambient-audio-bar-pulse ${motionDuration} ease-in-out ${index * 0.035}s infinite`
                    : undefined,
                  transition: `height ${safeTransition}s ease, background-color ${safeTransition}s ease, opacity ${safeTransition}s ease`,
                }}
              />
            );
          })}
        </span>
      ) : (
        <svg
          aria-hidden="true"
          width={waveformWidth}
          height={waveformHeight}
          viewBox="0 0 120 40"
          preserveAspectRatio="none"
          className="shrink-0 overflow-visible"
        >
          <path
            d={waveData}
            fill="none"
            strokeWidth={lineWeight * (isPlaying ? Math.max(0, intensity) : 1)}
            strokeLinecap={lineCap}
            strokeLinejoin={lineCap === "round" ? "round" : "miter"}
            strokeDasharray={isPlaying ? "14 7" : "none"}
            strokeDashoffset="0"
            className={isPlaying ? "ambient-audio-wave-motion" : undefined}
            style={{
              stroke: isPlaying ? activeColor : inactiveColor,
              opacity: isPlaying ? 1 : Math.max(0, Math.min(1, pausedAmount)),
              animation: isPlaying
                ? `ambient-audio-wave-scroll ${motionDuration} linear infinite`
                : undefined,
              transition: `stroke ${safeTransition}s ease, opacity ${safeTransition}s ease, stroke-width ${safeTransition}s ease`,
            }}
          />
        </svg>
      )}
      {!hideLabel && !orderedLabel && (
        <span
          className="whitespace-nowrap text-xs font-medium"
          style={{
            color: isPlaying ? playingColor : pausedColor,
            transition: `color ${safeTransition}s ease`,
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

const propertyControls = {
  src: {
    type: "File",
    title: "Audio File",
    allowedFileTypes: ["mp3", "wav", "ogg", "m4a"],
    group: "Audio",
  },
  persistenceKey: { type: "String", title: "Session Key", group: "Audio" },
  loop: { type: "Boolean", title: "Loop", defaultValue: true, group: "Audio" },
  volume: {
    type: "Number",
    title: "Volume",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 65,
    group: "Audio",
  },
  visualizer: {
    type: "Enum",
    title: "Style",
    options: ["wave", "bars"],
    optionTitles: ["Wave", "Bars"],
    defaultValue: "wave",
    displaySegmentedControl: true,
    group: "Visualizer",
  },
  activeColor: {
    type: "Color",
    title: "Active",
    defaultValue: "#a7f3d0",
    group: "Colors",
  },
  inactiveColor: {
    type: "Color",
    title: "Inactive",
    defaultValue: "#64748b",
    group: "Colors",
  },
  playingColor: {
    type: "Color",
    title: "Playing Label",
    defaultValue: "#f8fafc",
    group: "Colors",
  },
  pausedColor: {
    type: "Color",
    title: "Paused Label",
    defaultValue: "#94a3b8",
    group: "Colors",
  },
  labelPlaying: {
    type: "String",
    title: "Playing Text",
    defaultValue: "Playing",
    group: "Label",
  },
  labelPaused: {
    type: "String",
    title: "Paused Text",
    defaultValue: "Play ambient audio",
    group: "Label",
  },
  hideLabel: {
    type: "Boolean",
    title: "Hide Label",
    defaultValue: false,
    group: "Label",
  },
  labelPosition: {
    type: "Enum",
    title: "Label Position",
    options: ["left", "right", "above", "below"],
    optionTitles: ["Left", "Right", "Above", "Below"],
    defaultValue: "right",
    group: "Label",
  },
  labelGap: {
    type: "Number",
    title: "Label Gap",
    min: 0,
    max: 40,
    step: 1,
    defaultValue: 10,
    group: "Label",
  },
  waveformWidth: {
    type: "Number",
    title: "Waveform Width",
    min: 24,
    max: 400,
    step: 1,
    defaultValue: 112,
    group: "Waveform",
  },
  waveformHeight: {
    type: "Number",
    title: "Waveform Height",
    min: 12,
    max: 120,
    step: 1,
    defaultValue: 36,
    group: "Waveform",
  },
  lineWeight: {
    type: "Number",
    title: "Line Weight",
    min: 0.5,
    max: 12,
    step: 0.5,
    defaultValue: 2,
    group: "Waveform",
  },
  lineCap: {
    type: "Enum",
    title: "Line Cap",
    options: ["round", "square"],
    optionTitles: ["Rounded", "Square"],
    defaultValue: "round",
    group: "Waveform",
  },
  barCount: {
    type: "Number",
    title: "Bar Count",
    min: 4,
    max: 80,
    step: 1,
    defaultValue: 24,
    group: "Bars",
  },
  pausedAmount: {
    type: "Number",
    title: "Paused Amount",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.2,
    group: "Animation",
  },
  animationSpeed: {
    type: "Number",
    title: "Animation Speed",
    min: 0.25,
    max: 4,
    step: 0.05,
    defaultValue: 1.1,
    group: "Animation",
  },
  intensity: {
    type: "Number",
    title: "Intensity",
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 1,
    group: "Animation",
  },
  transition: {
    type: "Number",
    title: "Transition",
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: 0.35,
    group: "Animation",
  },
};

(AmbientAudioToggle as unknown as Record<string, unknown>).propertyControls =
  propertyControls;
(AmbientAudioToggle as unknown as Record<string, unknown>).addPropertyControls =
  propertyControls;

export default AmbientAudioToggle;
