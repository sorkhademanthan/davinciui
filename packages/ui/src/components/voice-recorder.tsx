"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface VoiceRecorderProps { maxDuration?: number; compact?: boolean; className?: string; onRecordingComplete?: (blob: Blob) => void; }
function time(value: number) { return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, "0")}`; }

export function VoiceRecorder({ maxDuration = 60, compact = false, className, onRecordingComplete }: VoiceRecorderProps) {
  const recorder = React.useRef<MediaRecorder | null>(null);
  const stream = React.useRef<MediaStream | null>(null);
  const chunks = React.useRef<Blob[]>([]);
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [url, setUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => { if (!recording) return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [recording]);
  React.useEffect(() => { if (seconds >= maxDuration && recording) recorder.current?.stop(); }, [seconds, maxDuration, recording]);
  React.useEffect(() => () => { if (url) URL.revokeObjectURL(url); stream.current?.getTracks().forEach((track) => track.stop()); }, [url]);
  const finish = () => {
    recorder.current?.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setRecording(false);
  };
  const start = async () => {
    if (recording) return finish();
    try {
      setError(null); setSeconds(0);
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media; chunks.current = [];
      const next = new MediaRecorder(media);
      recorder.current = next;
      next.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.current.push(event.data); });
      next.addEventListener("stop", () => {
        const blob = new Blob(chunks.current, { type: next.mimeType || "audio/webm" });
        if (url) URL.revokeObjectURL(url);
        setUrl(URL.createObjectURL(blob)); onRecordingComplete?.(blob);
      });
      next.start(); setRecording(true);
    } catch { setError("Microphone access is needed to record."); }
  };
  return <div className={cn("w-full max-w-md rounded-[1.5rem] border border-[#e0dce8] bg-[#fbfaff] p-4 text-[#211d29] shadow-[0_20px_54px_rgba(49,37,74,.12)] dark:border-white/10 dark:bg-[#17131e] dark:text-white", compact ? "p-3" : "p-5 sm:p-6", className)}>
    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Voice recorder</p>{!compact && <p className="mt-1 text-xs text-[#746d80] dark:text-white/55">Capture a note directly from the browser.</p>}</div><span className={cn("size-2 rounded-full", recording ? "bg-[#e94c67] animate-pulse" : "bg-[#c9c2d4] dark:bg-white/25")} /></div>
    <div className={cn("mt-5 flex items-center", compact ? "justify-between" : "gap-4")}><button type="button" onClick={() => void start()} aria-label={recording ? "Stop recording" : "Start recording"} aria-pressed={recording} className={cn("grid size-12 shrink-0 place-items-center rounded-full text-white transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 active:scale-95 dark:focus-visible:ring-offset-[#17131e]", recording ? "bg-[#e94c67]" : "bg-[#241b31]")}><span className={cn("block bg-current", recording ? "size-3 rounded-sm" : "size-3 rounded-full")} /></button><div className={cn("min-w-0 flex-1", compact && "mx-3")}><div className="flex h-9 items-center gap-1">{Array.from({ length: compact ? 16 : 28 }, (_, index) => <i key={index} className={cn("min-w-0 flex-1 rounded-full bg-[#d9d2e5] dark:bg-white/15", recording && "bg-[#b89bff] dark:bg-[#c4b5fd]")} style={{ height: `${18 + ((index * 31) % 70)}%` }} />)}</div>{!compact && <div className="mt-2 flex justify-between text-[11px] tabular-nums text-[#746d80] dark:text-white/52"><span>{recording ? "Recording" : url ? "Ready to play" : "Press record"}</span><span>{time(seconds)} / {time(maxDuration)}</span></div>}</div>{compact && <span className="text-xs tabular-nums text-[#746d80] dark:text-white/52">{time(seconds)}</span>}</div>
    {!compact && error && <p role="status" className="mt-3 text-xs text-[#bd2947] dark:text-[#ff9bad]">{error}</p>}{!compact && url && <audio className="mt-4 w-full" controls src={url} />}
  </div>;
}
export default VoiceRecorder;
