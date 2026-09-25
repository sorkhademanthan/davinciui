"use client";

import { InteractionSoundKit } from "@workspace/ui/components/interaction-sound-kit";

export function InteractionSoundKitPreview() {
  return <section className="relative flex h-full min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#e7ece4] p-6 dark:bg-[#0c100d] sm:p-10"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(104,151,109,.16),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_42%,rgba(164,214,165,.12),transparent_42%)]" /><InteractionSoundKit className="relative" /></section>;
}
