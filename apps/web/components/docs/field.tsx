import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AnatomyDemo,
  CheckboxFieldDemo,
  ChoiceCardDemo,
  FieldDemo,
  FieldGroupDemo,
  FieldGroupTitledDemo,
  FieldSetDemo,
  FormDemo,
  InputFieldDemo,
  RadioFieldDemo,
  ResponsiveFieldDemo,
  RtlFieldDemo,
  SelectFieldDemo,
  SliderFieldDemo,
  SwitchFieldDemo,
  TextareaFieldDemo,
  ValidationDemo,
} from "@/components/docs/previews/field-preview";
import { Field, FieldDescription, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function Example() {
  return (
    <Field>
      <FieldLabel htmlFor="name">Name</FieldLabel>
      <Input id="name" placeholder="Ada Lovelace" />
      <FieldDescription>Your display name across workspaces.</FieldDescription>
    </Field>
  );
}`;

const compositionNote = (
  <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
    <p>
      Field is a compound family, not a single control. <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">Field</code> provides
      layout and shares an id plus invalid state through context; every other part — labels, titles,
      descriptions, separators, errors — is a focused primitive that composes around any control.
    </p>
  </div>
);

function AccessibilityNote() {
  return (
    <Section title="Accessibility" className="pt-8">
      <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
        <p>
          Pair every control with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">FieldLabel htmlFor</code> matching
          the control&apos;s <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">id</code> — or skip both
          and wrap the control in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">FieldControl</code>,
          which wires <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">id</code>,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">aria-invalid</code>, and{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">aria-describedby</code> (description + error ids)
          automatically. Errors render with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">role="alert"</code> and
          a leading icon, so assistive technology announces them immediately and sighted users never rely on color alone.
        </p>
      </div>
    </Section>
  );
}

export async function FieldDocs() {
  const sourceCode = (await readComponentSource("field")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Field"
      description="Compound form primitives — labels, descriptions, errors, groups, and layouts that compose around any control with shared ids and invalid state."
      preview={
        <div className="flex flex-col items-center justify-center">
          <div className="w-64">
            <Field>
              <FieldLabel htmlFor="preview-name">Name</FieldLabel>
              <Input id="preview-name" placeholder="Ada Lovelace" />
              <FieldDescription>Your display name.</FieldDescription>
            </Field>
          </div>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="field"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/field.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Field",
          preview: <FieldDemo />,
          code: `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field>
  <FieldLabel htmlFor="name">Name</FieldLabel>
  <Input id="name" placeholder="Ada Lovelace" />
  <FieldDescription>Your display name across workspaces.</FieldDescription>
</Field>`,
        },
        {
          title: "FieldGroup",
          preview: <FieldGroupDemo />,
          code: `import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<FieldGroup>
  <Field>
    <FieldLabel htmlFor="name">Name</FieldLabel>
    <Input id="name" />
  </Field>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" />
  </Field>
</FieldGroup>`,
        },
        {
          title: "FieldSet",
          preview: <FieldSetDemo />,
          code: `import { Field, FieldSet, FieldLegend, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<FieldSet>
  <FieldLegend>Billing details</FieldLegend>
  <Field>
    <FieldLabel htmlFor="card">Card number</FieldLabel>
    <Input id="card" />
  </Field>
</FieldSet>`,
        },
        {
          title: "Anatomy",
          preview: <AnatomyDemo />,
          code: `import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldDescription>We never share your email.</FieldDescription>
  <FieldError>Enter a valid email.</FieldError>
</Field>`,
        },
        {
          title: "Form",
          preview: <FormDemo />,
          code: `import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<form onSubmit={onSubmit}>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Name</FieldLabel>
      <Input id="name" required />
    </Field>
    <button type="submit">Send invite</button>
  </FieldGroup>
</form>`,
        },
        {
          title: "Input",
          preview: <InputFieldDemo />,
          code: `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field>
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <Input id="username" placeholder="adalovelace" />
  <FieldDescription>Letters, numbers, and underscores only.</FieldDescription>
</Field>`,
        },
        {
          title: "Textarea",
          preview: <TextareaFieldDemo />,
          code: `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

<Field>
  <FieldLabel htmlFor="bio">Bio</FieldLabel>
  <Textarea id="bio" rows={3} />
  <FieldDescription>Shown on your public profile.</FieldDescription>
</Field>`,
        },
        {
          title: "Select",
          preview: <SelectFieldDemo />,
          code: `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

<Field>
  <FieldLabel htmlFor="role">Role</FieldLabel>
  <NativeSelect id="role" defaultValue="engineer">
    <NativeSelectOption value="engineer">Engineer</NativeSelectOption>
    <NativeSelectOption value="designer">Designer</NativeSelectOption>
  </NativeSelect>
  <FieldDescription>Controls default permissions.</FieldDescription>
</Field>`,
        },
        {
          title: "Slider",
          preview: <SliderFieldDemo />,
          code: `import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

<Field>
  <FieldLabel htmlFor="volume">Volume</FieldLabel>
  <input id="volume" type="range" min={0} max={100} />
  <FieldDescription>Swaps for the Slider component when it lands.</FieldDescription>
</Field>`,
        },
        {
          title: "Checkbox",
          preview: <CheckboxFieldDemo />,
          code: `import { Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

<Field orientation="horizontal">
  <Checkbox id="terms" />
  <FieldContent>
    <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
    <FieldDescription>You agree to the charter.</FieldDescription>
  </FieldContent>
</Field>`,
        },
        {
          title: "Radio",
          preview: <RadioFieldDemo />,
          code: `import { Field, FieldTitle, FieldDescription } from "@/components/ui/field";
import { RadioGroup, Radio } from "@/components/ui/radio";

<Field>
  <FieldTitle>Plan</FieldTitle>
  <RadioGroup defaultValue="pro">
    <Radio name="plan" value="Hobby" />
    <Radio name="plan" value="Pro" />
  </RadioGroup>
</Field>`,
        },
        {
          title: "Switch",
          preview: <SwitchFieldDemo />,
          code: `import { Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

<Field orientation="horizontal">
  <FieldContent>
    <FieldLabel htmlFor="notify">Notifications</FieldLabel>
    <FieldDescription>Email me about new results.</FieldDescription>
  </FieldContent>
  <Switch id="notify" />
</Field>`,
        },
        {
          title: "Choice Card",
          preview: <ChoiceCardDemo />,
          code: `import { Field, FieldTitle } from "@/components/ui/field";

<Field>
  <FieldTitle>Choose a plan</FieldTitle>
  <div className="grid grid-cols-3 gap-2">
    {plans.map((p) => (
      <label key={p.value} className="cursor-pointer rounded-xl border p-3">
        <input type="radio" name="plan" value={p.value} className="sr-only" />
        <span>{p.title}</span>
      </label>
    ))}
  </div>
</Field>`,
        },
        {
          title: "Field Group",
          preview: <FieldGroupTitledDemo />,
          code: `import { Field, FieldGroup, FieldTitle, FieldSeparator } from "@/components/ui/field";

<FieldGroup>
  <FieldTitle>Profile</FieldTitle>
  <Field>{/* … */}</Field>
  <FieldSeparator>Notifications</FieldSeparator>
  <Field>{/* … */}</Field>
</FieldGroup>`,
        },
        {
          title: "RTL",
          preview: <RtlFieldDemo />,
          code: `import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

<div dir="rtl">
  <Field>
    <FieldLabel htmlFor="name">الاسم</FieldLabel>
    <Input id="name" />
  </Field>
</div>`,
        },
        {
          title: "Responsive Layout",
          preview: <ResponsiveFieldDemo />,
          code: `import { Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

<Field orientation="responsive">
  <FieldContent>
    <FieldLabel htmlFor="alerts">Email alerts</FieldLabel>
    <FieldDescription>Critical incidents only.</FieldDescription>
  </FieldContent>
  <Switch id="alerts" />
</Field>`,
        },
        {
          title: "Validation and Errors",
          preview: <ValidationDemo />,
          code: `import { Field, FieldControl, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const [email, setEmail] = useState("");
const invalid = touched && !isEmail(email);

// FieldControl wires id, aria-invalid, and aria-describedby
// automatically — no hardcoded ids needed.
<Field invalid={invalid}>
  <FieldLabel>Work email</FieldLabel>
  <FieldControl>
    <Input type="email" onBlur={() => setTouched(true)} />
  </FieldControl>
  <FieldError errors={invalid ? ["Enter a valid work email address."] : []} />
</Field>`,
        },
      ]}
      props={[
        { name: "Field · orientation", type: '"vertical" | "horizontal" | "responsive"', default: '"vertical"', description: "Layout direction; responsive stacks on mobile, rows on sm+." },
        { name: "Field · invalid", type: "boolean", default: "false", description: "Error state shared with FieldError via context." },
        { name: "FieldControl", type: "Component", description: "Wraps one control; auto-wires id, aria-invalid, and aria-describedby. Explicit props win." },
        { name: "FieldLabel · htmlFor", type: "string", description: "Defaults to the FieldControl id — omit it when using FieldControl." },
        { name: "FieldError · errors", type: "string[]", description: "Error messages; renders a list when more than one." },
        { name: "FieldError · forceShow", type: "boolean", default: "false", description: "Show regardless of Field invalid state." },
        { name: "FieldError · showIcon", type: "boolean", default: "true", description: "Leading alert icon — errors never rely on color alone." },
        { name: "FieldSet", type: "fieldset element", description: "Native fieldset grouping with border." },
        { name: "FieldLegend", type: "legend element", description: "Caption for a FieldSet." },
        { name: "FieldGroup", type: "div", description: "Vertical stack of fields with even spacing." },
        { name: "FieldContent", type: "div", description: "Flexible label/description wrapper for horizontal rows." },
        { name: "FieldLabel", type: "label element", description: "Control label — pair htmlFor with the control id." },
        { name: "FieldTitle", type: "div", description: "Section title inside groups and choice sets." },
        { name: "FieldDescription", type: "p element", description: "Hint text with a stable context id for aria-describedby." },
        { name: "FieldSeparator", type: "div", description: "Labeled divider between field sections." },
      ]}
      afterContent={<AccessibilityNote />}
    />
  );
}
