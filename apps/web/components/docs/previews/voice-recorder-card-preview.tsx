"use client";
import { VoiceRecorder } from "@workspace/ui/components/voice-recorder";
export function VoiceRecorderCardPreview() { return <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#f0edf7] p-5 dark:bg-[#100d15]"><VoiceRecorder compact className="relative max-w-[17rem]" /></div>; }
