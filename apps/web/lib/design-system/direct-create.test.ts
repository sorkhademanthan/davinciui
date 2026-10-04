import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDirectCreateInput,
  DIRECT_CREATE_STARTERS,
  isDirectCreateStarter,
  validateDirectSystemName,
} from "./direct-create";

test("direct creation exposes only Blank and Minimal", () => {
  assert.deepEqual(DIRECT_CREATE_STARTERS, ["blank", "minimal"]);
  assert.equal(isDirectCreateStarter("blank"), true);
  assert.equal(isDirectCreateStarter("minimal"), true);
  assert.equal(isDirectCreateStarter("saas"), false);
  assert.equal(isDirectCreateStarter("dark-first"), false);
});

test("direct creation requires and trims the system name", () => {
  assert.equal(validateDirectSystemName("   "), "Enter a system name.");
  assert.equal(validateDirectSystemName("Da Vinci UI"), null);
  assert.equal(buildDirectCreateInput("  Da Vinci UI  ", "blank").name, "Da Vinci UI");
});

test("direct creation silently uses each starter's foundation defaults", () => {
  const blank = buildDirectCreateInput("Blank system", "blank");
  const minimal = buildDirectCreateInput("Minimal system", "minimal");

  assert.equal(blank.presetId, "blank");
  assert.equal(blank.font, "Inter");
  assert.equal(blank.density, "comfortable");
  assert.equal(minimal.presetId, "minimal");
  assert.equal(minimal.color, "#18181b");
});
