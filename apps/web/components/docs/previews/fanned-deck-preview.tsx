"use client";

import { useTheme } from "next-themes";
import { FannedDeck } from "@workspace/ui/components/fanned-deck";
import { fannedDeckDemoItems } from "./fanned-deck-items";

export function FannedDeckPreview() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return (
    <FannedDeck
      items={fannedDeckDemoItems}
      background={dark ? "#141419" : "#efefef"}
      entrance="deal"
      className="h-full min-h-[420px]"
    />
  );
}
