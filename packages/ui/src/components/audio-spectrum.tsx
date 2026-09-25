"use client";

import * as React from "react";
import { cn } from "../lib/utils";

const IDLE_BARS = [0.18, 0.32, 0.5, 0.66, 0.78, 0.58, 0.39, 0.25, 0.46, 0.71, 0.86, 0.64, 0.41, 0.27, 0.49, 0.69, 0.82, 0.56, 0.36, 0.22, 0.44, 0.62, 0.75, 0.52, 0.31, 0.2, 0.38, 0.59, 0.73, 0.48] as const;

export interface AudioSpectrumProps {
  /** MP3, WAV, OGG, or M4A URL. Sound starts only after user interaction. */
  src: string;
  title?: string;
  artist?: string;
  duration?: number;
  /** Number of live frequency bars. */
  barCount?: number;
  /** Color used for the active spectrum. */
  accentColor?: string;
  compact?: boolean;
  className?: string;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
}

export function AudioSpectrum({
  src,
  title = "Audio spectrum",
  artist = "Live frequency view",
  duration: initialDuration = 0,
  barCount = 30,
  accentColor = "var(--spectrum-accent)",
  compact = false,
  className,
}: AudioSpectrumProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const contextRef = React.useRef<AudioContext | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(initialDuration);
  const [levels, setLevels] = React.useState<number[]>(() => Array.from({ length: barCount }, (_, index) => IDLE_BARS[index % IDLE_BARS.length] ?? 0.3));

  React.useEffect(() => {
    setLevels(Array.from({ length: barCount }, (_, index) => IDLE_BARS[index % IDLE_BARS.length] ?? 0.3));
  }, [barCount]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onTime = () => setTime(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setTime(0); };
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("durationchange", onMetadata);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("durationchange", onMetadata);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  React.useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const readSpectrum = React.useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const nextFrame = () => {
      analyser.getByteFrequencyData(bins);
      const stride = Math.max(1, Math.floor(bins.length / barCount));
      setLevels(Array.from({ length: barCount }, (_, index) => {
        const start = index * stride;
        let sum = 0;
        for (let offset = 0; offset < stride; offset += 1) sum += bins[start + offset] ?? 0;
        return Math.max(0.1, sum / stride / 255);
      }));
      frameRef.current = requestAnimationFrame(nextFrame);
    };
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    nextFrame();
  }, [barCount]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (audio.paused) {
      if (!contextRef.current) {
        const context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        const source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(context.destination);
        contextRef.current = context;
        analyserRef.current = analyser;
      }
      await contextRef.current.resume();
      await audio.play();
      readSpectrum();
    } else {
      audio.pause();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const next = Number(event.target.value);
    if (!audio || !Number.isFinite(next)) return;
    audio.currentTime = next;
    setTime(next);
  };

  return (
    <div className={cn("w-full max-w-xl overflow-hidden rounded-[1.55rem] bg-[#111318] p-4 text-white shadow-[0_24px_70px_rgba(7,10,18,.28)] dark:bg-[#090a0e] [--spectrum-accent:#c7ff3d]", compact ? "p-3" : "p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.01em]">{title}</p>
          {!compact && <p className="mt-1 truncate text-xs text-white/55">{artist}</p>}
        </div>
        <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/65">SPECTRUM</span>
      </div>
      <div className={cn("mt-5 flex items-end gap-1", compact ? "h-20" : "h-36 sm:h-40")} aria-hidden="true">
        {levels.map((level, index) => <span key={index} className="min-w-0 flex-1 rounded-t-full bg-white/13 transition-[height,background-color] duration-100 motion-reduce:transition-none" style={{ height: `${Math.max(10, Math.round(level * 100))}%`, backgroundColor: playing ? accentColor : undefined }} />)}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={toggle} aria-label={playing ? `Pause ${title}` : `Play ${title}`} aria-pressed={playing} className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--spectrum-accent)] text-[#111318] transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111318] active:scale-95">
          {playing ? <span aria-hidden="true" className="flex gap-1"><i className="block h-4 w-0.5 rounded bg-current" /><i className="block h-4 w-0.5 rounded bg-current" /></span> : <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M8 5.7c0-1.2 1.33-1.92 2.33-1.26l8.1 5.3a1.5 1.5 0 0 1 0 2.52l-8.1 5.3A1.5 1.5 0 0 1 8 16.3V5.7Z" /></svg>}
        </button>
        <div className="min-w-0 flex-1">
          <input type="range" min={0} max={duration} step={0.01} value={time} onChange={seek} aria-label={`Seek ${title}`} className="h-1.5 w-full cursor-pointer accent-[var(--spectrum-accent)]" />
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-white/55"><span>{formatTime(time)}</span><span>{formatTime(duration)}</span></div>
        </div>
      </div>
      <audio ref={audioRef} preload="metadata" src={src} />
    </div>
  );
}

export default AudioSpectrum;
