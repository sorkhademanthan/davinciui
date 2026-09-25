"use client";
import { VoiceRecorder } from "@workspace/ui/components/voice-recorder";
export function VoiceRecorderPreview() { return <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#f0edf7] p-6 dark:bg-[#100d15]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(164,132,222,.18),transparent_44%)]" /><VoiceRecorder className="relative" /></section>; }
