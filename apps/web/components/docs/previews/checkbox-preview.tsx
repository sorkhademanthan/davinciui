"use client";

import * as React from "react";
import {
  Checkbox,
  CheckboxContent,
  CheckboxDescription,
  CheckboxError,
  CheckboxField,
  CheckboxGroup,
  CheckboxLabel,
} from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";

// ---------------------------------------------------------------------------
// Basic — minimal checkbox + label
// ---------------------------------------------------------------------------

export function CheckboxPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <CheckboxField>
        <Checkbox id="check-basic" />
        <CheckboxLabel htmlFor="check-basic" className="py-2">
          Email notifications
        </CheckboxLabel>
      </CheckboxField>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checked
// ---------------------------------------------------------------------------

export function CheckboxCheckedPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <CheckboxField>
        <Checkbox id="check-checked" defaultChecked />
        <CheckboxLabel htmlFor="check-checked" className="py-2">
          Checked
        </CheckboxLabel>
      </CheckboxField>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invalid — error cue + aria wiring
// ---------------------------------------------------------------------------

export function CheckboxInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <CheckboxField>
        <Checkbox id="check-invalid" invalid aria-describedby="check-invalid-error" />
        <CheckboxContent>
          <CheckboxLabel htmlFor="check-invalid">
            I accept the Terms &amp; Conditions
          </CheckboxLabel>
          <CheckboxError id="check-invalid-error">
            You must accept the terms to continue.
          </CheckboxError>
        </CheckboxContent>
      </CheckboxField>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Description — helper text tied via aria-describedby
// ---------------------------------------------------------------------------

export function CheckboxDescriptionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <CheckboxField>
        <Checkbox id="check-desc" aria-describedby="check-desc-hint" />
        <CheckboxContent>
          <CheckboxLabel htmlFor="check-desc">Marketing emails</CheckboxLabel>
          <CheckboxDescription id="check-desc-hint">
            Get product news and offers. Unsubscribe anytime.
          </CheckboxDescription>
        </CheckboxContent>
      </CheckboxField>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Disabled — unchecked + checked, still legible
// ---------------------------------------------------------------------------

export function CheckboxDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col gap-4">
        <CheckboxField>
          <Checkbox id="check-disabled" disabled />
          <CheckboxLabel htmlFor="check-disabled" className="py-2 opacity-70">
            Disabled
          </CheckboxLabel>
        </CheckboxField>
        <CheckboxField>
          <Checkbox id="check-disabled-checked" disabled defaultChecked />
          <CheckboxLabel htmlFor="check-disabled-checked" className="py-2 opacity-70">
            Disabled checked
          </CheckboxLabel>
        </CheckboxField>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Accept terms — consent pattern: inline link, required, submit validation
// ---------------------------------------------------------------------------

export function CheckboxAcceptTermsPreview() {
  const [accepted, setAccepted] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const invalid = submitted && !accepted;

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <form
        className="w-full max-w-xs space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <CheckboxField>
          <Checkbox
            id="check-terms"
            required
            checked={accepted}
            invalid={invalid}
            aria-describedby={invalid ? "check-terms-error" : undefined}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <CheckboxContent>
            <CheckboxLabel htmlFor="check-terms">
              I accept the{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Terms &amp; Conditions
              </a>
            </CheckboxLabel>
            {invalid && (
              <CheckboxError id="check-terms-error">
                Please accept the terms to create your account.
              </CheckboxError>
            )}
          </CheckboxContent>
        </CheckboxField>
        <Button type="submit" size="sm" className="w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Group — fieldset + legend, at-least-one required logic
// ---------------------------------------------------------------------------

const GROUP_OPTIONS = ["Design system", "Changelog", "Community events"];

export function CheckboxGroupPreview() {
  const [selected, setSelected] = React.useState<string[]>(["Design system"]);
  const [submitted, setSubmitted] = React.useState(false);
  const invalid = submitted && selected.length === 0;

  const toggle = (option: string) =>
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <form
        className="w-full max-w-xs space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <CheckboxGroup
          legend="Email preferences"
          description="Choose at least one topic."
          errorText={invalid ? "Select at least one option." : undefined}
          invalid={invalid}
          required
        >
          {GROUP_OPTIONS.map((option) => {
            const id = `group-${option.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <CheckboxField key={option}>
                <Checkbox
                  id={id}
                  checked={selected.includes(option)}
                  invalid={invalid}
                  onChange={() => toggle(option)}
                />
                <CheckboxLabel htmlFor={id} className="py-2">
                  {option}
                </CheckboxLabel>
              </CheckboxField>
            );
          })}
        </CheckboxGroup>
        <Button type="submit" size="sm" variant="outline" className="w-full">
          Save preferences
        </Button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table — select-all with indeterminate, highlighted rows, live count
// ---------------------------------------------------------------------------

const TABLE_ROWS = [
  { id: "r1", name: "Amara Chen", role: "Designer" },
  { id: "r2", name: "Jonas Weber", role: "Engineer" },
  { id: "r3", name: "Priya Nair", role: "Researcher" },
];

export function CheckboxTablePreview() {
  const [selected, setSelected] = React.useState<string[]>(["r2"]);
  const allSelected = selected.length === TABLE_ROWS.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleRow = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelected((prev) => (prev.length === TABLE_ROWS.length ? [] : TABLE_ROWS.map((r) => r.id)));

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8">
      <table className="w-full max-w-sm overflow-hidden rounded-lg border text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="w-12 p-2" scope="col">
              <span className="flex items-center justify-center">
                <Checkbox
                  aria-label="Select all rows"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </span>
            </th>
            <th className="p-2 text-left font-medium" scope="col">
              Name
            </th>
            <th className="p-2 text-left font-medium" scope="col">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row) => {
            const isSelected = selected.includes(row.id);
            return (
              <tr
                key={row.id}
                data-selected={isSelected || undefined}
                className="border-t transition-colors data-[selected]:bg-muted/60"
              >
                <td className="p-2">
                  <span className="flex items-center justify-center">
                    <Checkbox
                      aria-label={`Select ${row.name}`}
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                    />
                  </span>
                </td>
                <td className="p-2 font-medium">{row.name}</td>
                <td className="p-2 text-muted-foreground">{row.role}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
        {selected.length === 0
          ? "No rows selected"
          : `${selected.length} of ${TABLE_ROWS.length} selected`}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RTL — mirrored layout with real RTL content
// ---------------------------------------------------------------------------

export function CheckboxRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <CheckboxField>
        <Checkbox id="check-rtl" aria-describedby="check-rtl-hint" />
        <CheckboxContent>
          <CheckboxLabel htmlFor="check-rtl">الإشعارات البريدية</CheckboxLabel>
          <CheckboxDescription id="check-rtl-hint">
            احصل على آخر الأخبار والعروض. يمكنك إلغاء الاشتراك في أي وقت.
          </CheckboxDescription>
        </CheckboxContent>
      </CheckboxField>
    </div>
  );
}
