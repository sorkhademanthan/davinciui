"use client";

import * as React from "react";
import { cn } from "../lib/utils";

type SoundAction = "trash" | "drop" | "confirm" | "warning";

const ACTIONS: { id: SoundAction; label: string; hint: string }[] = [
  { id: "trash", label: "Move to Trash", hint: "Soft delete cue" },
  { id: "drop", label: "Drop", hint: "Object placed" },
  { id: "confirm", label: "Complete", hint: "Success cue" },
  { id: "warning", label: "Warning", hint: "Needs attention" },
];

export interface InteractionSoundKitProps {
  volume?: number;
  defaultMuted?: boolean;
  compact?: boolean;
  className?: string;
  onSoundPlay?: (action: SoundAction) => void;
}

function SoundGlyph({ action }: { action: SoundAction }) {
  if (action === "trash") return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-[1.8]"><path d="M4 7h16M9 3h6m-8 4 1 13h8l1-13M10 11v5m4-5v5" /></svg>;
  if (action === "drop") return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-[1.8]"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 18h14v3H5z" /></svg>;
  if (action === "confirm") return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-[1.8]"><path d="m5 12 4.2 4.2L19 6.8" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-[1.8]"><path d="M12 4 3.8 19h16.4L12 4Zm0 5v4m0 3h.01" /></svg>;
}

export function InteractionSoundKit({ volume = 0.38, defaultMuted = false, compact = false, className, onSoundPlay }: InteractionSoundKitProps) {
  const contextRef = React.useRef<AudioContext | null>(null);
  const [muted, setMuted] = React.useState(defaultMuted);
  const [active, setActive] = React.useState<SoundAction | null>(null);
  const safeVolume = Math.min(1, Math.max(0, volume));

  const context = () => {
    if (!contextRef.current) contextRef.current = new AudioContext();
    return contextRef.current;
  };

  const tone = (audio: AudioContext, frequency: number, start: number, duration: number, type: OscillatorType, gain: number, endFrequency?: number) => {
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  const play = async (action: SoundAction) => {
    setActive(action);
    window.setTimeout(() => setActive(null), 240);
    if (muted) return;
    const audio = context();
    await audio.resume();
    const now = audio.currentTime;
    const gain = safeVolume * 0.42;
    if (action === "trash") {
      tone(audio, 250, now, 0.11, "triangle", gain, 120);
      tone(audio, 145, now + 0.09, 0.16, "sine", gain * 0.8, 68);
    } else if (action === "drop") {
      tone(audio, 180, now, 0.075, "sine", gain, 98);
      tone(audio, 92, now + 0.07, 0.1, "triangle", gain * 0.7, 65);
    } else if (action === "confirm") {
      tone(audio, 523, now, 0.12, "sine", gain);
      tone(audio, 784, now + 0.09, 0.18, "sine", gain * 0.9);
    } else {
      tone(audio, 330, now, 0.07, "square", gain * 0.45);
      tone(audio, 330, now + 0.12, 0.07, "square", gain * 0.45);
    }
    onSoundPlay?.(action);
  };

  const visibleActions = compact ? ACTIONS.slice(0, 3) : ACTIONS;
  return <div className={cn("w-full max-w-xl rounded-[1.5rem] border border-[#d9ded6] bg-[#f7f8f4] p-4 text-[#1a201c] shadow-[0_20px_55px_rgba(29,40,34,.13)] dark:border-white/10 dark:bg-[#151916] dark:text-[#f4f6f0] dark:shadow-black/30", compact ? "p-3" : "p-5 sm:p-6", className)}>
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-semibold tracking-[-0.015em]">Interface sounds</p>{!compact && <p className="mt-1 text-xs text-[#647069] dark:text-white/55">Subtle, generated feedback for product actions.</p>}</div>
      <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Enable interface sounds" : "Mute interface sounds"} aria-pressed={!muted} className="grid size-10 place-items-center rounded-full border border-[#d4dbd2] bg-white text-[#3b4740] transition hover:bg-[#eef1eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#406d59] focus-visible:ring-offset-2 active:scale-95 dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/14 dark:focus-visible:ring-[#b8e3b7] dark:focus-visible:ring-offset-[#151916]">
        {muted ? <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[1.9]"><path d="M4 10v4h4l5 4V6L8 10H4Zm12 1 4 4m0-4-4 4" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[1.9]"><path d="M4 10v4h4l5 4V6L8 10H4Zm12-2a6 6 0 0 1 0 8m2.8-10.5a9.5 9.5 0 0 1 0 13" /></svg>}
      </button>
    </div>
    <div className={cn("mt-5 grid gap-2", compact ? "grid-cols-3" : "grid-cols-2")}>
      {visibleActions.map((action) => <button key={action.id} type="button" aria-label={compact ? action.label : undefined} onClick={() => void play(action.id)} className={cn("group flex min-h-16 items-center gap-3 rounded-xl border border-[#dce2db] bg-white px-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#abc0af] hover:shadow-[0_8px_18px_rgba(44,70,55,.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#406d59] focus-visible:ring-offset-2 active:translate-y-0 dark:border-white/10 dark:bg-white/[.055] dark:hover:border-white/25 dark:hover:bg-white/[.09] dark:focus-visible:ring-[#b8e3b7] dark:focus-visible:ring-offset-[#151916]", active === action.id && "border-[#406d59] bg-[#e8f2e8] dark:border-[#b8e3b7] dark:bg-[#2a382d]", compact && "justify-center px-2") }>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e8efe9] text-[#406d59] transition-transform group-hover:scale-105 dark:bg-[#b8e3b7]/12 dark:text-[#b8e3b7]"><SoundGlyph action={action.id} /></span>
        {!compact && <span className="min-w-0"><span className="block truncate text-xs font-semibold">{action.label}</span><span className="mt-0.5 block truncate text-[11px] text-[#718078] dark:text-white/48">{muted ? "Muted" : action.hint}</span></span>}
      </button>)}
    </div>
  </div>;
}

export default InteractionSoundKit;
