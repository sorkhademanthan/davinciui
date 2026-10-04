import { test } from "node:test";
import assert from "node:assert/strict";
import type { DesignSystemConfig } from "./domain";
import { createSystemFromStarter } from "./starters";
import {
  EXPORT_CHAPTERS,
  exportChaptersForSystem,
  exportFailureMessage,
  exportFilenameBase,
  prepareDesignSystemExport,
  serializeDesignSystemCss,
  serializeDesignSystemJson,
} from "./export";

function system(): DesignSystemConfig {
  return createSystemFromStarter({ starterId: "saas", name: "Da Vinci UI" });
}

test("ready systems produce an immutable, structured export model", () => {
  const source = system();
  const before = JSON.stringify(source);
  const result = prepareDesignSystemExport(source, "2026-10-03T10:00:00.000Z");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.model.generatedAt, "2026-10-03T10:00:00.000Z");
  assert.equal(result.model.chapters.length, EXPORT_CHAPTERS.length);
  assert.equal(result.model.chapters[0]?.title, "Colour foundations");
  assert.equal(result.model.chapters.some((chapter) => chapter.title === "System overview"), false);
  assert.equal(result.model.report.exportReady, true);
  assert.notEqual(result.model.system, source);
  assert.equal(JSON.stringify(source), before);
});

test("errors block preparation and return actionable findings", () => {
  const source = system();
  source.semanticTokens.find((token) => token.id === "text.primary")!.value = "brand.999";
  const result = prepareDesignSystemExport(source);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors.length > 0);
  assert.equal(result.report.exportReady, false);
  assert.ok(result.errors.some((finding) => finding.route.endsWith("/tokens")));
});

test("warnings remain exportable and available to the app review state", () => {
  const source = system();
  source.semanticTokens.find((token) => token.id === "text.primary")!.value = "#777777";
  source.semanticTokens.find((token) => token.id === "background.canvas")!.value = "#ffffff";
  const result = prepareDesignSystemExport(source);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.model.warnings.length > 0);
  assert.equal(result.model.report.exportReady, true);
});

test("optional empty chapters are removed and remaining numbers stay sequential", () => {
  const source = system();
  source.semanticTokens = [];
  source.themes = [];
  const chapters = exportChaptersForSystem(source);
  assert.equal(chapters.some((chapter) => chapter.id === "semantic-tokens"), false);
  assert.equal(chapters.some((chapter) => chapter.id === "themes"), false);
  assert.deepEqual(chapters.map((chapter) => chapter.number), chapters.map((_, index) => String(index + 1).padStart(2, "0")));
});

test("JSON remains a canonical system that repository import can consume", () => {
  const source = system();
  const parsed = JSON.parse(serializeDesignSystemJson(source)) as DesignSystemConfig;
  assert.equal(parsed.id, source.id);
  assert.deepEqual(parsed.semanticTokens, source.semanticTokens);
});

test("CSS contains foundations and resolved variables for every theme", () => {
  const source = system();
  const css = serializeDesignSystemCss(source);
  assert.match(css, /--ds-color-brand-600:/);
  assert.match(css, /--ds-space-4:/);
  assert.match(css, /\[data-ds-theme="light"\]/);
  assert.match(css, /\[data-ds-theme="dark"\]/);
  assert.match(css, /--ds-text-primary:/);
});

test("filenames are stable and safe", () => {
  const source = system();
  source.meta.version = "2.1 beta";
  assert.equal(exportFilenameBase(source), "da-vinci-ui-design-system-v2.1-beta");
});

test("renderer internals are replaced with a useful recovery message", () => {
  const message = exportFailureMessage(new Error("unsupported number: -1.6e+22"), "pdf");
  assert.equal(message, "The PDF layout could not be completed safely. Refresh the page and try again.");
  assert.doesNotMatch(message, /unsupported number/i);
});
