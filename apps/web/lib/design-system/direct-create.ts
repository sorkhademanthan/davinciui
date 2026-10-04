import type { CreateDesignSystemInput } from "./domain";
import { getStarterDefaults } from "./starters";

export const DIRECT_CREATE_STARTERS = ["blank", "minimal"] as const;

export type DirectCreateStarterId = (typeof DIRECT_CREATE_STARTERS)[number];

export function isDirectCreateStarter(value: string): value is DirectCreateStarterId {
  return DIRECT_CREATE_STARTERS.some((starter) => starter === value);
}

export function validateDirectSystemName(name: string): string | null {
  return name.trim().length > 0 ? null : "Enter a system name.";
}

/**
 * Build the repository input for the intentionally short creation flow.
 * Visual defaults come from the selected starter and stay editable in Foundations.
 */
export function buildDirectCreateInput(
  name: string,
  starterId: DirectCreateStarterId,
): CreateDesignSystemInput {
  const defaults = getStarterDefaults(starterId);

  return {
    name: name.trim(),
    presetId: starterId,
    color: defaults.color ?? "#71717a",
    font: defaults.font,
    density: defaults.density,
  };
}
