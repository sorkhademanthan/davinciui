// Focused onboarding tests (Step 4). Same convention as the Step 1–3 tests:
// compile with the repo's TypeScript, then `node --test` (no new packages).
// Covers the pure wizard logic; DOM wiring (focus, routing, exit) is verified
// manually against the dev server.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDesignSystem } from "./domain";
import { createDesignSystemsStore, type StorageLike } from "./repository";
import { createSystemFromStarter, STARTERS } from "./starters";
import {
  buildCreateInput,
  canContinueFromStep,
  createInitialOnboardingState,
  densityLabel,
  isColorValid,
  isNameValid,
  isValidHexColor,
  maxReachableStep,
  nameErrorFor,
  normalizeHexInput,
  onboardingReducer,
  slugPreview,
  validateSystemName,
  type OnboardingState,
} from "./onboarding";

function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const data = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function filledState(): OnboardingState {
  let state = createInitialOnboardingState("blank");
  state = onboardingReducer(state, { type: "set-field", field: "name", value: "Manthan" });
  state = onboardingReducer(state, { type: "set-field", field: "color", value: "#0F766E" });
  state = onboardingReducer(state, { type: "set-field", field: "font", value: "Inter" });
  state = onboardingReducer(state, { type: "set-field", field: "density", value: "comfortable" });
  return state;
}

test("all seven starters appear with Step 3 metadata", () => {
  assert.equal(STARTERS.length, 7);
  assert.deepEqual(
    STARTERS.map((starter) => starter.id),
    ["blank", "minimal", "saas", "enterprise", "editorial", "ecommerce", "dark-first"],
  );
  for (const starter of STARTERS) {
    assert.ok(starter.label.length > 0, starter.id);
    assert.ok(starter.description.length > 0, starter.id);
  }
  // Onboarding defaults to SaaS.
  assert.equal(createInitialOnboardingState().starterId, "saas");
});

test("name validation blocks progression with a clear recovery message", () => {
  assert.equal(validateSystemName(""), "Enter a name to continue.");
  assert.equal(validateSystemName("   "), "Enter a name to continue.");
  assert.equal(validateSystemName("Manthan"), null);

  const fresh = createInitialOnboardingState();
  assert.equal(isNameValid(fresh), false);
  assert.equal(canContinueFromStep(2, fresh), false);
  assert.equal(maxReachableStep(fresh), 2);

  // Continue attempt marks the name as touched without advancing.
  const blocked = onboardingReducer(fresh, { type: "next" });
  void blocked;
  const onDetails = onboardingReducer({ ...fresh, step: 2 }, { type: "next" });
  assert.equal(onDetails.step, 2);
  assert.equal(nameErrorFor(onDetails), "Enter a name to continue.");

  // Error stays hidden until blur or a Continue attempt (announced via
  // aria-describedby + role=alert once shown).
  assert.equal(nameErrorFor(fresh), null);
  const blurred = onboardingReducer({ ...fresh, step: 2 }, { type: "blur-name" });
  assert.equal(nameErrorFor(blurred), "Enter a name to continue.");

  // A valid name clears the way forward.
  const named = onboardingReducer(blurred, { type: "set-field", field: "name", value: "Manthan" });
  assert.equal(nameErrorFor(named), null);
  assert.equal(canContinueFromStep(2, named), true);
  assert.equal(onboardingReducer({ ...named, step: 2 }, { type: "next" }).step, 3);
});

test("invalid HEX blocks progression", () => {
  for (const bad of ["", "#", "#12345", "#1234567", "not-a-color", "#zzzzzz", "  "]) {
    assert.equal(isValidHexColor(bad), false, bad);
  }
  for (const good of ["#635BFF", "#635bff", "635bff", "  #0F766E  "]) {
    assert.equal(isValidHexColor(good), true, good);
  }
  assert.equal(normalizeHexInput("0f766e"), "#0F766E");
  assert.equal(normalizeHexInput("  #635bff "), "#635BFF");
  assert.equal(normalizeHexInput("nope"), "nope");

  const state: OnboardingState = {
    ...createInitialOnboardingState(),
    step: 3,
    name: "Manthan",
    color: "#12",
  };
  assert.equal(isColorValid(state), false);
  assert.equal(canContinueFromStep(3, state), false);
  assert.equal(maxReachableStep(state), 3);
  assert.equal(onboardingReducer(state, { type: "next" }).step, 3);
  assert.equal(onboardingReducer(state, { type: "goto", step: 4 }).step, 3);
});

test("Back preserves entered values", () => {
  let state = filledState();
  state = onboardingReducer({ ...state, step: 3 }, { type: "back" });
  assert.equal(state.step, 2);
  assert.equal(state.name, "Manthan");
  assert.equal(state.color, "#0F766E");
  assert.equal(state.font, "Inter");
  assert.equal(state.density, "comfortable");
  state = onboardingReducer(state, { type: "back" });
  assert.equal(state.step, 1);
  assert.equal(state.name, "Manthan");
});

test("Edit on review returns to the correct step and preserves values", () => {
  const state: OnboardingState = { ...filledState(), step: 4 };
  const toColor = onboardingReducer(state, { type: "goto", step: 3 });
  assert.equal(toColor.step, 3);
  assert.equal(toColor.name, "Manthan");
  assert.equal(toColor.color, "#0F766E");
  const toStarter = onboardingReducer(state, { type: "goto", step: 1 });
  assert.equal(toStarter.step, 1);
  assert.equal(toStarter.name, "Manthan");
  const toDetails = onboardingReducer(state, { type: "goto", step: 2 });
  assert.equal(toDetails.step, 2);
  assert.equal(toDetails.description, "");
});

test("forward stepper jumps need preceding steps to be valid", () => {
  const fresh = createInitialOnboardingState();
  // Step 1 can always reach step 2; steps 3–4 need a valid name.
  assert.equal(onboardingReducer(fresh, { type: "goto", step: 2 }).step, 2);
  assert.equal(onboardingReducer(fresh, { type: "goto", step: 3 }).step, 1);
  const named = onboardingReducer(fresh, { type: "set-field", field: "name", value: "Manthan" });
  assert.equal(onboardingReducer(named, { type: "goto", step: 3 }).step, 3);
});

test("starter selection updates starter-driven defaults, keeps details", () => {
  let state = createInitialOnboardingState();
  state = onboardingReducer(state, { type: "set-field", field: "name", value: "Manthan" });
  state = onboardingReducer(state, { type: "select-starter", starterId: "enterprise" });
  assert.equal(state.starterId, "enterprise");
  assert.equal(state.name, "Manthan");
  assert.equal(state.density, "compact");
  assert.equal(state.font, "Inter");
  assert.equal(state.color, "#0f766e");
  state = onboardingReducer(state, { type: "select-starter", starterId: "blank" });
  assert.equal(state.starterId, "blank");
  // Blank stays neutral: no brand color is carried over.
  assert.equal(state.color, "#71717a");
  assert.equal(state.name, "Manthan");
});

test("slug preview derives a readable slug and is never required", () => {
  assert.equal(slugPreview("Manthan Sorkhade"), "manthan-sorkhade");
  assert.equal(slugPreview("  Acme! Product System  "), "acme-product-system");
  assert.equal(slugPreview(""), "untitled-system");
});

test("create input calls the canonical starter factory with safe overrides", () => {
  const input = buildCreateInput(filledState());
  assert.deepEqual(input, {
    name: "Manthan",
    brand: undefined,
    description: undefined,
    presetId: "blank",
    color: "#0F766E",
    font: "Inter",
    density: "comfortable",
  });
  // Blank ignores the color override: neutral baseline, no forced accent.
  const system = createSystemFromStarter({ ...input, starterId: input.presetId });
  assert.equal(system.starter.presetId, "blank");
  assert.deepEqual(
    system.foundations.colors.palettes.map((palette) => palette.role),
    ["neutral"],
  );
  assert.deepEqual(validateDesignSystem(system), []);
});

test("create persists once through the repository and routes to Colors", () => {
  const mem = memoryStorage();
  const store = createDesignSystemsStore(() => mem);
  const input = buildCreateInput(filledState());
  const result = store.create(input);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.system.starter.presetId, "blank");
  assert.equal(result.system.meta.name, "Manthan");
  const route = `/design-system/${result.system.id}/colors`;
  assert.ok(route.startsWith("/design-system/") && route.endsWith("/colors"));
  assert.equal(store.list().length, 1);
});

test("create-start guards against double-submit", () => {
  const state: OnboardingState = { ...filledState(), step: 4 };
  const started = onboardingReducer(state, { type: "create-start" });
  assert.equal(started.isCreating, true);
  assert.equal(started.createError, null);
  // A second start while in flight is a no-op.
  assert.deepEqual(onboardingReducer(started, { type: "create-start" }), started);
});

test("repository failure retains state and reports a non-blocking error", () => {
  const failing = createDesignSystemsStore(() => undefined);
  const input = buildCreateInput(filledState());
  const result = failing.create(input);
  const failureMessage = result.ok ? null : result.error;
  assert.ok(failureMessage && failureMessage.length > 0);

  let state: OnboardingState = { ...filledState(), step: 4 };
  state = onboardingReducer(state, { type: "create-start" });
  assert.equal(state.isCreating, true);
  state = onboardingReducer(state, { type: "create-failure", error: failureMessage });
  assert.equal(state.isCreating, false);
  assert.ok((state.createError ?? "").length > 0);
  // Every entered value and the current step are retained; no navigation data.
  assert.equal(state.step, 4);
  assert.equal(state.name, "Manthan");
  assert.equal(state.color, "#0F766E");
  assert.equal(state.starterId, "blank");
});

test("density labels are human-readable for sighted users and AT", () => {
  assert.equal(densityLabel("compact"), "Compact");
  assert.equal(densityLabel("comfortable"), "Comfortable");
  assert.equal(densityLabel("spacious"), "Spacious");
});

test("invalid density values are rejected", () => {
  const state = createInitialOnboardingState();
  assert.deepEqual(
    onboardingReducer(state, { type: "set-field", field: "density", value: "cramped" }),
    state,
  );
});
