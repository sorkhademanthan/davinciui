import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  CheckboxAcceptTermsPreview,
  CheckboxCheckedPreview,
  CheckboxDescriptionPreview,
  CheckboxDisabledPreview,
  CheckboxGroupPreview,
  CheckboxInvalidPreview,
  CheckboxPreview,
  CheckboxRtlPreview,
  CheckboxTablePreview,
} from "@/components/docs/previews/checkbox-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Checkbox,
  CheckboxContent,
  CheckboxDescription,
  CheckboxError,
  CheckboxField,
  CheckboxGroup,
  CheckboxLabel,
} from "@/components/ui/checkbox"`;
const defaultCode = `<CheckboxField>
  <Checkbox id="terms" />
  <CheckboxLabel htmlFor="terms">Accept terms</CheckboxLabel>
</CheckboxField>`;

export async function CheckboxDocs() {
  const sourceCode = (await readComponentSource("checkbox")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Checkbox"
      description="A control that allows the user to toggle between checked and not checked."
      preview={<CheckboxPreview />}
      previewCode={defaultCode}
      installPackageName="checkbox"
      installDependencies=""
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/checkbox.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      examples={[
        {
          title: "Accept terms",
          preview: <CheckboxAcceptTermsPreview />,
          code: `<form onSubmit={onSubmit} noValidate>
  <CheckboxField>
    <Checkbox
      id="terms"
      required
      checked={accepted}
      invalid={showError}
      aria-describedby={showError ? "terms-error" : undefined}
      onChange={(e) => setAccepted(e.target.checked)}
    />
    <CheckboxContent>
      <CheckboxLabel htmlFor="terms">
        I accept the <a href="/terms">Terms & Conditions</a>
      </CheckboxLabel>
      {showError && (
        <CheckboxError id="terms-error">
          Please accept the terms to continue.
        </CheckboxError>
      )}
    </CheckboxContent>
  </CheckboxField>
  <Button type="submit">Create account</Button>
</form>`,
        },
        { title: "Checked", preview: <CheckboxCheckedPreview />, code: `<Checkbox defaultChecked id="check" />` },
        {
          title: "Invalid",
          preview: <CheckboxInvalidPreview />,
          code: `<Checkbox id="check" invalid aria-describedby="check-error" />
<CheckboxError id="check-error">
  You must accept the terms to continue.
</CheckboxError>`,
        },
        { title: "Basic", preview: <CheckboxPreview />, code: defaultCode },
        {
          title: "Description",
          preview: <CheckboxDescriptionPreview />,
          code: `<Checkbox id="check" aria-describedby="check-hint" />
<CheckboxLabel htmlFor="check">Marketing emails</CheckboxLabel>
<CheckboxDescription id="check-hint">
  Get product news and offers.
</CheckboxDescription>`,
        },
        {
          title: "Disabled",
          preview: <CheckboxDisabledPreview />,
          code: `<Checkbox disabled id="check-disabled" />
<Checkbox disabled defaultChecked id="check-disabled-checked" />`,
        },
        {
          title: "Group",
          preview: <CheckboxGroupPreview />,
          code: `<CheckboxGroup
  legend="Email preferences"
  description="Choose at least one topic."
  errorText={showError ? "Select at least one option." : undefined}
  invalid={showError}
  required
>
  <CheckboxField>
    <Checkbox id="g1" />
    <CheckboxLabel htmlFor="g1">Design system</CheckboxLabel>
  </CheckboxField>
  <CheckboxField>
    <Checkbox id="g2" />
    <CheckboxLabel htmlFor="g2">Changelog</CheckboxLabel>
  </CheckboxField>
</CheckboxGroup>`,
        },
        {
          title: "Table",
          preview: <CheckboxTablePreview />,
          code: `<table>
  <thead>
    <tr>
      <th scope="col">
        <Checkbox
          aria-label="Select all rows"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
        />
      </th>
    </tr>
  </thead>
  <tbody>
    <tr data-selected={isSelected || undefined}>
      <td>
        <Checkbox
          aria-label={\`Select \${row.name}\`}
          checked={isSelected}
          onChange={() => toggleRow(row.id)}
        />
      </td>
    </tr>
  </tbody>
</table>`,
        },
        {
          title: "RTL",
          preview: <CheckboxRtlPreview />,
          code: `<div dir="rtl">
  <CheckboxField>
    <Checkbox id="check" aria-describedby="check-hint" />
    <CheckboxContent>
      <CheckboxLabel htmlFor="check">الإشعارات البريدية</CheckboxLabel>
      <CheckboxDescription id="check-hint">...</CheckboxDescription>
    </CheckboxContent>
  </CheckboxField>
</div>`,
        },
      ]}
      props={[
        { name: "checked", type: "boolean", description: "Controlled checked state." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "Uncontrolled initial state." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables the checkbox. Announced as disabled." },
        { name: "invalid", type: "boolean", default: "false", description: "Error state. Sets aria-invalid + destructive styling." },
        { name: "indeterminate", type: "boolean", default: "false", description: "Tri-state dash for select-all parents. Reports aria-checked=mixed." },
        { name: "required", type: "boolean", default: "false", description: "Native required constraint (e.g. consent checkboxes)." },
        { name: "CheckboxField", type: "Component", description: "Link-safe row layout (flex, gap-3). Pair Checkbox with Label/Content inside." },
        { name: "CheckboxLabel", type: "Component", description: "Label bound via htmlFor. Clicking toggles the checkbox." },
        { name: "CheckboxContent", type: "Component", description: "Stacks label, description and error with consistent spacing." },
        { name: "CheckboxDescription", type: "Component", description: "Helper text. Tie via aria-describedby on the input." },
        { name: "CheckboxError", type: "Component", description: "Error message with role=alert. Tie via aria-describedby." },
        { name: "CheckboxGroup", type: "Component", description: "fieldset + legend semantics. Props: legend, description, errorText, invalid, required, orientation." },
        { name: "className", type: "string", description: "Additional CSS classes." },
      ]}
    />
  );
}
