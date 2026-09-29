// Onboarding state and validation for the Create Design System flow (Step 4).
// Pure logic only — no React, no storage, no side effects. The component in
// create-design-system.tsx renders this state; tests exercise it with node:test.

import type { CreateDesignSystemInput, Density } from "./domain";
import { getStarterDefaults } from "./starters";

// ---------------------------------------------------------------------------
// Field helpers (pure)
// ---------------------------------------------------------------------------

const HEX_BODY = /^[0-9a-fA-F]{6}$/;

/** True for a six-digit hex color, with or without a leading `#`. */
export function isValidHexColor(value: string): boolean {
  const body = value.trim().replace(/^#+/, "");
  return HEX_BODY.test(body);
}

/**
 * Normalize user hex input to canonical `#RRGGBB` (uppercase) form.
 * Returns the trimmed input unchanged when it is not a valid six-digit hex.
 */
export function normalizeHexInput(value: string): string {
  const body = value.trim().replace(/^#+/, "");
  if (!HEX_BODY.test(body)) return value.trim();
  return `#${body.toUpperCase()}`;
}

/** Name error text, or null when the name is acceptable. */
export function validateSystemName(name: string): string | null {
  if (name.trim().length === 0) return "Enter a name to continue.";
  return null;
}

/** Display label for a density value (readable by sighted users and AT). */
export function densityLabel(density: string): string {
  const normalized = density.trim().toLowerCase();
  if (normalized.length === 0) return density;
  return normalized[0]!.toUpperCase() + normalized.slice(1);
}

/** Readable URL slug preview. Never a required editable field. */
export function slugPreview(name: string): string {  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "untitled-system"
  );
}

// ---------------------------------------------------------------------------
// Wizard state (pure reducer — back/edit preserve all entered values)
// ---------------------------------------------------------------------------

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingField = "name" | "brand" | "description" | "color" | "font" | "density";

export interface OnboardingState {
  step: OnboardingStep;
  starterId: string;
  name: string;
  brand: string;
  description: string;
  color: string;
  font: string;
  density: Density;
  /** Name error is shown only after blur or a Continue attempt. */
  nameTouched: boolean;
  /** Creation in progress — guards against accidental double-submit. */
  isCreating: boolean;
  /** Non-blocking repository failure message. State is retained. */
  createError: string | null;
}

export type OnboardingAction =
  | { type: "select-starter"; starterId: string }
  | { type: "set-field"; field: OnboardingField; value: string }
  | { type: "blur-name" }
  | { type: "next" }
  | { type: "back" }
  | { type: "goto"; step: OnboardingStep }
  | { type: "create-start" }
  | { type: "create-failure"; error: string };

export function createInitialOnboardingState(starterId = "saas"): OnboardingState {
  const defaults = getStarterDefaults(starterId);
  return {
    step: 1,
    starterId,
    name: "",
    brand: "",
    description: "",
    color: defaults.color ?? "#71717a",
    font: defaults.font,
    density: defaults.density,
    nameTouched: false,
    isCreating: false,
    createError: null,
  };
}

export function isNameValid(state: Pick<OnboardingState, "name">): boolean {
  return validateSystemName(state.name) === null;
}

export function isColorValid(state: Pick<OnboardingState, "color">): boolean {
  return isValidHexColor(state.color);
}

/**
 * Highest step reachable from current values. Step 3 needs a valid name;
 * step 4 (review/create) additionally needs a valid color. Used to gate
 * forward stepper navigation; backward steps are always available.
 */
export function maxReachableStep(state: Pick<OnboardingState, "name" | "color">): OnboardingStep {
  if (!isNameValid(state)) return 2;
  if (!isColorValid(state)) return 3;
  return 4;
}

export function canContinueFromStep(
  step: OnboardingStep,
  state: Pick<OnboardingState, "name" | "color">,
): boolean {
  if (step === 1) return true;
  if (step === 2) return isNameValid(state);
  if (step === 3) return isColorValid(state);
  return false;
}

export function nameErrorFor(state: Pick<OnboardingState, "name" | "nameTouched">): string | null {
  if (!state.nameTouched) return null;
  return validateSystemName(state.name);
}

export function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "select-starter": {
      // Non-persistent: refresh starter-driven defaults, keep entered details.
      const defaults = getStarterDefaults(action.starterId);
      return {
        ...state,
        starterId: action.starterId,
        color: defaults.color ?? "#71717a",
        font: defaults.font,
        density: defaults.density,
        createError: null,
      };
    }
    case "set-field": {
      if (action.field === "density" && action.value !== "compact" && action.value !== "comfortable" && action.value !== "spacious") {
        return state;
      }
      return { ...state, [action.field]: action.value, createError: null };
    }
    case "blur-name": {
      return { ...state, nameTouched: true };
    }
    case "next": {
      if (state.step === 2 && !isNameValid(state)) {
        return { ...state, nameTouched: true };
      }
      if (!canContinueFromStep(state.step, state)) return state;
      return { ...state, step: Math.min(4, state.step + 1) as OnboardingStep };
    }
    case "back": {
      return { ...state, step: Math.max(1, state.step - 1) as OnboardingStep };
    }
    case "goto": {
      if (action.step > maxReachableStep(state)) return state;
      return { ...state, step: action.step };
    }
    case "create-start": {
      // No-op while a creation is in flight — prevents double-submit.
      if (state.isCreating) return state;
      if (!isNameValid(state)) return { ...state, nameTouched: true };
      if (!isColorValid(state)) return state;
      return { ...state, isCreating: true, createError: null };
    }
    case "create-failure": {
      // Retain every entered value and the current step; surface the error.
      return { ...state, isCreating: false, createError: action.error };
    }
  }
}

// ---------------------------------------------------------------------------
// Create-input builder (starter factory + safe user overrides)
// ---------------------------------------------------------------------------

/** Map wizard state onto the repository create input (no saving here). */
export function buildCreateInput(state: OnboardingState): CreateDesignSystemInput {
  const emptyToUndefined = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };
  return {
    name: state.name.trim(),
    brand: emptyToUndefined(state.brand),
    description: emptyToUndefined(state.description),
    presetId: state.starterId,
    color: normalizeHexInput(state.color),
    font: state.font,
    density: state.density,
  };
}
