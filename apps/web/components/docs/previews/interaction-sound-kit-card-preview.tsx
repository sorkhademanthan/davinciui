"use client";

import { InteractionSoundKit } from "@workspace/ui/components/interaction-sound-kit";

export function InteractionSoundKitCardPreview() {
  return <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[#e7ece4] p-5 dark:bg-[#0c100d]"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(104,151,109,.16),transparent_56%)]" /><InteractionSoundKit compact className="relative max-w-[17rem]" /></div>;
}
