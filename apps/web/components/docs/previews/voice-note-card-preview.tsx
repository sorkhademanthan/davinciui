"use client";

import { VoiceNote } from "@workspace/ui/components/voice-note";

export function VoiceNoteCardPreview() {
  return <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#f1effa] p-5 dark:bg-[#12101c]"><VoiceNote src="/audio/strangerthings/rockpunchcinematic.mp3" sender="Mia Rivera" initials="MR" timestamp="2 min ago" duration={6.43} showSpeedControl={false} className="relative max-w-[18rem] [--voice-note-accent:#eeeaff] dark:[--voice-note-accent:#f0edff]" /></div>;
}
