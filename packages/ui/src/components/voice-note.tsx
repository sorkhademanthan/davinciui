"use client";

import * as React from "react";
import { cn } from "../lib/utils";

const WAVE = [0.24, 0.42, 0.63, 0.31, 0.74, 0.48, 0.88, 0.39, 0.58, 0.76, 0.44, 0.66, 0.92, 0.51, 0.35, 0.72, 0.47, 0.82, 0.54, 0.29, 0.61, 0.41, 0.7, 0.38] as const;
const SPEEDS = [1, 1.5, 2] as const;

export interface VoiceNoteProps {
  /** MP3, WAV, OGG, or M4A URL. Sound starts only after user interaction. */
  src: string;
  sender?: string;
  timestamp?: string;
  duration?: number;
  initials?: string;
  avatar?: string;
  accentColor?: string;
  waveform?: readonly number[];
  showSpeedControl?: boolean;
  decorative?: boolean;
  className?: string;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`;
}

export function VoiceNote({
  src,
  sender = "Avery Lane",
  timestamp = "Just now",
  duration: initialDuration = 0,
  initials = "AL",
  avatar,
  accentColor = "var(--voice-note-accent)",
  waveform = WAVE,
  showSpeedControl = true,
  decorative = false,
  className,
}: VoiceNoteProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(initialDuration);
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>(1);
  const progress = duration > 0 ? Math.min(1, time / duration) : 0;

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onTime = () => setTime(audio.currentTime);
    const onEnded = () => { setTime(0); setPlaying(false); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    const durationPoll = window.setInterval(() => {
      syncDuration();
      if (audio.duration > 0) window.clearInterval(durationPoll);
    }, 100);
    return () => {
      window.clearInterval(durationPoll);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1;
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(next)) return;
    audio.currentTime = next;
    setTime(next);
  };

  const content = (
    <div className={cn("flex w-full max-w-sm items-end gap-2.5", className)}>
      {avatar ? <img src={avatar} alt="" className="size-9 shrink-0 rounded-full object-cover shadow-sm" /> : <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-950 text-[11px] font-semibold text-white shadow-sm dark:bg-violet-100 dark:text-violet-950">{initials}</span>}
      <div className="w-full rounded-[1.35rem_1.35rem_1.35rem_.35rem] bg-violet-600 p-3.5 text-white shadow-[0_18px_42px_rgba(91,53,181,.26)] dark:bg-violet-500/90 dark:shadow-[0_18px_42px_rgba(0,0,0,.28)] [--voice-note-accent:#eeeaff]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm font-semibold">{sender}</span>
          <span className="shrink-0 text-[11px] text-white/65">{timestamp}</span>
        </div>
        <span className="mt-0.5 block text-[11px] font-medium tracking-wide text-white/70">Voice message</span>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" aria-label={playing ? `Pause voice note from ${sender}` : `Play voice note from ${sender}`} aria-pressed={playing} onClick={toggle} className="grid size-9 shrink-0 place-items-center rounded-full bg-white/16 text-white transition duration-200 hover:scale-105 hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600 active:scale-95 dark:focus-visible:ring-offset-violet-500">
            {playing ? <span aria-hidden="true" className="flex gap-1"><i className="block h-3.5 w-0.5 rounded bg-current" /><i className="block h-3.5 w-0.5 rounded bg-current" /></span> : <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current"><path d="M8 5.7c0-1.2 1.33-1.92 2.33-1.26l8.1 5.3a1.5 1.5 0 0 1 0 2.52l-8.1 5.3A1.5 1.5 0 0 1 8 16.3V5.7Z" /></svg>}
          </button>
          <div className="min-w-0 flex-1">
            <div className="relative h-8 rounded-md focus-within:ring-2 focus-within:ring-white/90">
              <div aria-hidden="true" className="absolute inset-0 flex items-center gap-1">
                {(waveform.length ? waveform : WAVE).map((height, index, array) => {
                  const elapsed = index / Math.max(1, array.length - 1) <= progress;
                  return <span key={index} className={cn("min-w-0 flex-1 rounded-full bg-white/25", playing && elapsed && "motion-safe:animate-[voice-note-pulse_1s_ease-in-out_infinite_alternate] motion-reduce:animate-none")} style={{ height: `${Math.max(18, Math.min(100, height * 100))}%`, backgroundColor: elapsed ? accentColor : undefined, animationDelay: `${(index % 7) * -0.11}s` }} />;
                })}
              </div>
              <input type="range" min={0} max={duration} step={0.01} value={time} onChange={seek} aria-label={`Seek voice note from ${sender}`} className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 focus-visible:outline-none" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums text-white/65"><span>{formatTime(time)}</span><span>{formatTime(duration)}</span></div>
          </div>
          {showSpeedControl && <button type="button" onClick={cycleSpeed} aria-label={`Playback speed ${speed}x. Change speed`} className="min-w-10 rounded-full bg-white/12 px-1.5 py-2 text-[11px] font-semibold text-white transition duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95">{speed}×</button>}
        </div>
        <audio ref={audioRef} preload="metadata" src={src} />
        <style>{`@keyframes voice-note-pulse { from { transform:scaleY(.75) } to { transform:scaleY(1) } }`}</style>
      </div>
    </div>
  );
  return decorative ? <div aria-hidden="true">{content}</div> : content;
}

export default VoiceNote;
