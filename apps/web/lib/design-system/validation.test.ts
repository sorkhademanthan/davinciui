// Focused Validate-workspace tests (Step 12). Same convention as previous
// steps: compile with the repo's TypeScript, then `node --test` (no new packages).
import { test } from "node:test";
import assert from "node:assert/strict";
import type { DesignSystemConfig } from "./domain";
import { createSystemFromStarter } from "./starters";
import { PREMIUM_COMPONENT_IDS } from "./component-manifest";
import {
  VALIDATION_GROUP_ORDER,
  contrastRatio,
  validateDesignSystemReport,
  type ValidationReport,
} from "./validation";

function healthySystem(): DesignSystemConfig {
  // SaaS ships every palette role, so all starter-wired references resolve.
  // (Neutral-only starters such as Blank ship a `border.error` → `danger.500`
  // reference with no danger palette; Validate flags that, correctly.)
  return createSystemFromStarter({ starterId: "saas", name: "Healthy" });
}

function findingsOf(report: ValidationReport, group?: string) {
  const all = report.groups.flatMap((entry) => entry.findings);
  return group ? all.filter((finding) => finding.group === group) : all;
}

test("healthy starter system is ready to export with no errors", () => {
  const report = validateDesignSystemReport(healthySystem());
  assert.equal(report.status, "ready");
  assert.equal(report.statusLabel, "Ready to export");
  assert.equal(report.summary.errors, 0);
  assert.equal(report.exportReady, true);
  assert.ok(report.summary.passed > 0);
  assert.deepEqual(
    report.groups.map((group) => group.id),
    [...VALIDATION_GROUP_ORDER],
  );
});

test("unresolved semantic alias is an error routed to Tokens", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    semanticTokens: system.semanticTokens.map((token) =>
      token.id === "text.primary" ? { ...token, value: "brand.999" } : token,
    ),
  };
  const report = validateDesignSystemReport(broken);
  assert.equal(report.status, "needs-attention");
  assert.equal(report.exportReady, false);
  const semantic = findingsOf(report, "semantic-tokens").filter(
    (finding) => finding.severity === "error" && finding.affected === "text.primary",
  );
  assert.ok(semantic.length > 0);
  assert.ok(semantic.every((finding) => finding.route.endsWith("/tokens")));
});

test("circular token reference is an error", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    semanticTokens: [
      ...system.semanticTokens.filter(
        (token) => token.id !== "text.primary" && token.id !== "text.secondary",
      ),
      {
        id: "text.primary",
        label: "Primary text",
        category: "text",
        value: "text.secondary",
      },
      {
        id: "text.secondary",
        label: "Secondary text",
        category: "text",
        value: "text.primary",
      },
    ],
  };
  const report = validateDesignSystemReport(broken);
  const circular = findingsOf(report).filter((finding) =>
    /circular/i.test(`${finding.title} ${finding.explanation}`),
  );
  assert.ok(circular.length > 0);
  assert.ok(circular.every((finding) => finding.severity === "error"));
});

test("invalid theme override is an error routed to Themes", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    themes: system.themes.map((theme) =>
      theme.id === "dark"
        ? { ...theme, overrides: { ...theme.overrides, "text.primary": "nope.999" } }
        : theme,
    ),
  };
  const report = validateDesignSystemReport(broken);
  const themeErrors = findingsOf(report, "themes").filter(
    (finding) => finding.severity === "error",
  );
  assert.ok(themeErrors.length > 0);
  assert.ok(themeErrors.every((finding) => finding.route.endsWith("/themes")));
});

test("missing Light theme is an error", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    themes: system.themes.filter((theme) => theme.id !== "light"),
  };
  const report = validateDesignSystemReport(broken);
  const missing = findingsOf(report, "themes").filter((finding) =>
    /light/.test(`${finding.title} ${finding.explanation} ${finding.path}`),
  );
  assert.ok(missing.length > 0);
  assert.ok(missing.every((finding) => finding.severity === "error"));
});

test("missing Dark theme is an error", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    themes: system.themes.filter((theme) => theme.id !== "dark"),
  };
  const report = validateDesignSystemReport(broken);
  assert.equal(report.status, "needs-attention");
  assert.ok(
    findingsOf(report, "themes").some((finding) => finding.severity === "error"),
  );
});

test("low-contrast token pair is a warning, never a compliance claim", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    semanticTokens: system.semanticTokens.map((token) => {
      if (token.id === "text.primary") return { ...token, value: "#f1f1f1" };
      if (token.id === "background.canvas") return { ...token, value: "#ffffff" };
      return token;
    }),
  };
  const report = validateDesignSystemReport(broken);
  const contrast = findingsOf(report, "accessibility").filter((finding) =>
    /primary text on canvas/i.test(finding.title),
  );
  assert.ok(contrast.length > 0);
  assert.ok(contrast.every((finding) => finding.severity === "warning"));
  assert.ok(
    contrast.every((finding) => /not.*certification/i.test(finding.explanation)),
  );
  // Guidance copy must never claim WCAG compliance or certification.
  for (const finding of findingsOf(report, "accessibility")) {
    assert.ok(!/WCAG\s*(2|compliant|certified|compliance)/i.test(finding.explanation));
  }
});

test("contrast math matches the known black-on-white ratio", () => {
  assert.equal(contrastRatio("#000000", "#ffffff")?.toFixed(2), "21.00");
});

test("unresolvable contrast pair is a warning, not an error", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    semanticTokens: system.semanticTokens.map((token) =>
      token.id === "text.primary" ? { ...token, value: "brand.999" } : token,
    ),
  };
  const report = validateDesignSystemReport(broken);
  const guidance = findingsOf(report, "accessibility").filter((finding) =>
    /primary text on canvas/i.test(finding.title),
  );
  assert.ok(guidance.length > 0);
  assert.ok(guidance.every((finding) => finding.severity === "warning"));
});

test("stored premium ids are library-only and flagged as ignored (never part of a system)", () => {
  const system = healthySystem();
  const premiumId = PREMIUM_COMPONENT_IDS[0]!;
  const withPremium: DesignSystemConfig = {
    ...system,
    library: { included: [...(system.library?.included ?? []), premiumId] },
  };
  const report = validateDesignSystemReport(withPremium);
  const flagged = findingsOf(report, "components").filter(
    (finding) => finding.severity === "warning" && /premium experience/i.test(finding.title),
  );
  assert.ok(flagged.length > 0);
  assert.ok(flagged.every((finding) => finding.route === "/experience/components"));
  // Warnings allow export.
  if (report.summary.errors === 0) assert.equal(report.exportReady, true);
});

test("missing baseline semantic token is an error", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    semanticTokens: system.semanticTokens.filter((token) => token.id !== "focus.ring"),
  };
  const report = validateDesignSystemReport(broken);
  const missing = findingsOf(report, "semantic-tokens").filter(
    (finding) => finding.severity === "error" && finding.affected === "focus.ring",
  );
  assert.ok(missing.length > 0);
});

test("included component with an invalid slot reference is an error", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    components: system.components.map((entry) =>
      entry.component === "Button"
        ? {
            ...entry,
            overrides: entry.overrides.map((override, index) =>
              index === 0 ? { ...override, value: "ghost.999" } : override,
            ),
          }
        : entry,
    ),
  };
  const report = validateDesignSystemReport(broken);
  const slotErrors = findingsOf(report, "components").filter(
    (finding) => finding.severity === "error" && /button/i.test(finding.title),
  );
  assert.ok(slotErrors.length > 0);
});

test("issue ordering is stable: errors first, groups in fixed order", () => {
  const system = healthySystem();
  const premiumId = PREMIUM_COMPONENT_IDS[0]!;
  const broken: DesignSystemConfig = {
    ...system,
    library: { included: [...(system.library?.included ?? []), premiumId] },
    semanticTokens: system.semanticTokens.map((token) =>
      token.id === "text.primary" ? { ...token, value: "brand.999" } : token,
    ),
    themes: system.themes.filter((theme) => theme.id !== "dark"),
  };
  const first = validateDesignSystemReport(broken);
  const second = validateDesignSystemReport(broken);
  const ids = (report: ValidationReport): string[] =>
    report.groups.flatMap((group) => group.findings.map((finding) => finding.id));
  assert.deepEqual(ids(first), ids(second));

  // Group order never depends on object iteration.
  assert.deepEqual(
    first.groups.map((group) => group.id),
    [...VALIDATION_GROUP_ORDER],
  );

  // Within every group, errors precede warnings precede informational items.
  const rank = { error: 0, warning: 1, info: 2 } as const;
  for (const group of first.groups) {
    const ranks = group.findings.map((finding) => rank[finding.severity]);
    assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  }
});

test("validation never mutates the system", () => {
  const system = healthySystem();
  const before = JSON.stringify(system);
  validateDesignSystemReport(system);
  validateDesignSystemReport(system, { systemId: system.id });
  assert.equal(JSON.stringify(system), before);
});

test("every finding carries an actionable route", () => {
  const system = healthySystem();
  const broken: DesignSystemConfig = {
    ...system,
    semanticTokens: system.semanticTokens.map((token) =>
      token.id === "text.primary" ? { ...token, value: "brand.999" } : token,
    ),
    themes: system.themes.filter((theme) => theme.id !== "dark"),
  };
  const report = validateDesignSystemReport(broken, { systemId: system.id });
  for (const finding of findingsOf(report)) {
    assert.ok(
      finding.route.startsWith(`/design-system/${system.id}`) ||
        finding.route === "/experience/components",
      `finding ${finding.id} has route ${finding.route}`,
    );
    assert.ok(finding.id.length > 0);
    assert.ok(finding.title.length > 0);
    assert.ok(finding.explanation.length > 0);
  }
});
