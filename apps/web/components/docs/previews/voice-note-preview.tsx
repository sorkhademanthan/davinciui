"use client";

import { VoiceNote } from "@workspace/ui/components/voice-note";

export function VoiceNotePreview() {
  return <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#f1effa] p-6 dark:bg-[#12101c]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(112,92,186,.18),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_45%,rgba(161,143,238,.16),transparent_42%)]" /><VoiceNote src="/audio/strangerthings/rockpunchcinematic.mp3" sender="Mia Rivera" initials="MR" timestamp="2 min ago" duration={6.43} accentColor="var(--voice-preview-accent)" className="relative [--voice-preview-accent:#eeeaff] dark:[--voice-preview-accent:#f0edff]" /></section>;
}
