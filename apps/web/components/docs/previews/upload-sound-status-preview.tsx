"use client";
import { UploadSoundStatus } from "@workspace/ui/components/upload-sound-status";
export function UploadSoundStatusPreview() { return <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#edf1e7] p-6 dark:bg-[#0d110a]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(114,169,97,.18),transparent_42%)]" /><UploadSoundStatus className="relative" /></section>; }
