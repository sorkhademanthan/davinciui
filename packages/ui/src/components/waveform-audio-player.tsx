"use client";

import * as React from "react";
import { cn } from "../lib/utils";

const DEFAULT_WAVEFORM = [
  0.18, 0.31, 0.54, 0.38, 0.72, 0.48, 0.3, 0.62, 0.84, 0.56, 0.41, 0.68,
  0.35, 0.5, 0.78, 0.6, 0.27, 0.45, 0.71, 0.91, 0.59, 0.36, 0.52, 0.25,
  0.44, 0.66, 0.8, 0.49, 0.33, 0.58, 0.74, 0.42, 0.22, 0.47, 0.64, 0.37,
] as const;

export interface WaveformAudioPlayerProps {
  /** An MP3, WAV, OGG, or M4A URL. Playback only starts after user input. */
  src: string;
  /** Primary track label. */
  title?: string;
  /** Secondary track label. */
  artist?: string;
  /** Normalized bar heights from 0 to 1. */
  waveform?: readonly number[];
  /** Optional known duration in seconds, displayed while media metadata loads. */
  duration?: number;
  /** Accent applied to elapsed waveform bars and controls. */
  accentColor?: string;
  /** Audio volume from 0 to 1. */
  volume?: number;
  /** Reduce metadata and control spacing for compact contexts. */
  compact?: boolean;
  /** Render without interactive controls, for linked catalog cards. */
  decorative?: boolean;
  className?: string;
  onPlayChange?: (playing: boolean) => void;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M7 5.5A1.5 1.5 0 0 1 8.5 4h1A1.5 1.5 0 0 1 11 5.5v13A1.5 1.5 0 0 1 9.5 20h-1A1.5 1.5 0 0 1 7 18.5v-13Zm6 0A1.5 1.5 0 0 1 14.5 4h1A1.5 1.5 0 0 1 17 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-13Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <path d="M8 5.7c0-1.2 1.33-1.92 2.33-1.26l8.1 5.3a1.5 1.5 0 0 1 0 2.52l-8.1 5.3A1.5 1.5 0 0 1 8 16.3V5.7Z" />
    </svg>
  );
}

export function WaveformAudioPlayer({
  src,
  title = "Untitled audio",
  artist = "Audio preview",
  waveform = DEFAULT_WAVEFORM,
  duration: initialDuration,
  accentColor = "var(--waveform-accent)",
  volume = 0.75,
  compact = false,
  decorative = false,
  className,
  onPlayChange,
}: WaveformAudioPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(initialDuration ?? 0);
  const [error, setError] = React.useState(false);
  const safeVolume = Math.min(1, Math.max(0, volume));
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const updatePlaying = React.useCallback((next: boolean) => {
    setPlaying(next);
    onPlayChange?.(next);
  }, [onPlayChange]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = safeVolume;
  }, [safeVolume]);

  React.useEffect(() => {
    if (initialDuration !== undefined) setDuration(initialDuration);
  }, [initialDuration, src]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => updatePlaying(true);
    const onPause = () => updatePlaying(false);
    const onEnded = () => {
      setCurrentTime(0);
      updatePlaying(false);
    };
    const onError = () => setError(true);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("loadeddata", onMetadata);
    audio.addEventListener("durationchange", onMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    if (Number.isFinite(audio.duration)) onMetadata();
    const durationPoll = window.setInterval(() => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      setDuration(audio.duration);
      window.clearInterval(durationPoll);
    }, 100);
    return () => {
      window.clearInterval(durationPoll);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("loadeddata", onMetadata);
      audio.removeEventListener("durationchange", onMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [updatePlaying]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    if (audio.paused) {
      setError(false);
      void audio.play().catch(() => setError(true));
    } else {
      audio.pause();
    }
  };

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const nextTime = Number(event.target.value);
    if (!audio || !Number.isFinite(nextTime)) return;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const bars = waveform.length ? waveform : DEFAULT_WAVEFORM;
  const player = (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[1.4rem] border border-slate-950/10 bg-white/80 text-slate-950 shadow-[0_18px_55px_rgba(25,50,73,.12)] backdrop-blur-xl [--waveform-accent:#0f766e] dark:border-white/10 dark:bg-slate-950/72 dark:text-white dark:shadow-black/25 dark:[--waveform-accent:#7ee7cf]",
        compact ? "p-3" : "p-5 sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30" />
      {!compact && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[-0.01em]">{title}</p>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{artist}</p>
          </div>
          <span className="shrink-0 rounded-full border border-slate-950/10 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
            AUDIO
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          aria-pressed={playing}
          onClick={toggle}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/20 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 active:scale-95 dark:bg-white dark:text-slate-950 dark:shadow-black/30 dark:focus-visible:ring-teal-300 dark:focus-visible:ring-offset-slate-950"
        >
          <PlayIcon playing={playing} />
        </button>
        <div className="min-w-0 flex-1">
          {compact && (
            <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
              <span className="truncate text-xs font-semibold">{title}</span>
              <span className="shrink-0 text-[10px] tabular-nums text-slate-500 dark:text-slate-400">{formatTime(duration)}</span>
            </div>
          )}
          <div className="relative h-11">
            <div aria-hidden="true" className="absolute inset-0 flex items-center gap-[3px]">
              {bars.map((value, index) => {
                const normalized = Math.min(1, Math.max(0.12, value));
                const elapsed = index / Math.max(1, bars.length - 1) <= progress;
                return (
                  <span
                    key={index}
                    className={cn(
                      "block min-w-0 flex-1 rounded-full bg-slate-300 transition-colors duration-200 dark:bg-slate-700",
                      playing && elapsed && "motion-safe:animate-[waveform-audio-pulse_1.35s_ease-in-out_infinite_alternate] motion-reduce:animate-none",
                    )}
                    style={{
                      height: `${Math.round(normalized * 100)}%`,
                      backgroundColor: elapsed ? accentColor : undefined,
                      animationDelay: `${(index % 8) * -0.12}s`,
                    }}
                  />
                );
              })}
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={currentTime}
              onChange={seek}
              aria-label={`Seek ${title}`}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:opacity-100 focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-teal-600"
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{error ? "Audio unavailable" : formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onCanPlay={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
      <style>{`
        @keyframes waveform-audio-pulse { from { transform: scaleY(.78); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );

  return decorative ? <div aria-hidden="true">{player}</div> : player;
}

export default WaveformAudioPlayer;
