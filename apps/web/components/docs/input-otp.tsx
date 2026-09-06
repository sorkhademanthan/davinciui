import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AlphanumericDemo,
  ControlledDemo,
  DisabledDemo,
  FormDemo,
  FourDigitsDemo,
  InvalidDemo,
  PatternDemo,
  RtlOtpDemo,
  SeparatorDemo,
} from "@/components/docs/previews/input-otp-preview";
import { InputOTP } from "@workspace/ui/components/input-otp";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { InputOTP } from "@/components/ui/input-otp"

export function Example() {
  const [code, setCode] = React.useState("");

  return <InputOTP value={code} onValueChange={setCode} onComplete={verify} />;
}`;

const notes = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">About</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        InputOTP renders one input per digit with auto-advance, smart backspace, paste-to-fill,
        and direction-aware arrow keys. A regex pattern decides which characters stick — everything
        else is rejected without moving focus.
      </p>
    </div>
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
      <p>
        Length, pattern, separators, and completion are props on one control — no compound imports.
        Wire it controlled for forms, or drop it in uncontrolled for the common verify-code flow.
      </p>
    </div>
  </div>
);

export async function InputOTPDocs() {
  const sourceCode =
    (await readComponentSource("input-otp")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Input OTP"
      description="One-time code input with per-digit slots, paste-to-fill, patterns, separators, completion callback, and RTL."
      preview={
        <div className="flex flex-col items-center justify-center">
          <InputOTP />
        </div>
      }
      previewCode={defaultCode}
      installPackageName="input-otp"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/input-otp.tsx"
      usageCode={defaultCode}
      usageNote={notes}
      examples={[
        {
          title: "Pattern",
          preview: <PatternDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<InputOTP pattern="[0-9]" inputMode="numeric" />`,
        },
        {
          title: "Separator",
          preview: <SeparatorDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<InputOTP separatorAfter={[2]} />`,
        },
        {
          title: "Disabled",
          preview: <DisabledDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<InputOTP defaultValue="123" disabled />`,
        },
        {
          title: "Controlled",
          preview: <ControlledDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

const [code, setCode] = React.useState("");

<InputOTP value={code} onValueChange={setCode} />
<button onClick={() => setCode("")}>Reset</button>`,
        },
        {
          title: "Invalid",
          preview: <InvalidDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<InputOTP invalid />
<p role="alert">Enter all 6 digits.</p>`,
        },
        {
          title: "Four Digits",
          preview: <FourDigitsDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<InputOTP length={4} inputMode="numeric" />`,
        },
        {
          title: "Alphanumeric",
          preview: <AlphanumericDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<InputOTP pattern="[A-Za-z0-9]" uppercase />`,
        },
        {
          title: "Form",
          preview: <FormDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

const [code, setCode] = React.useState("");

<form onSubmit={verify}>
  <InputOTP value={code} onValueChange={setCode} onComplete={verify} />
  <button type="submit" disabled={code.length !== 6}>Verify</button>
</form>`,
        },
        {
          title: "RTL",
          preview: <RtlOtpDemo />,
          code: `import { InputOTP } from "@/components/ui/input-otp"

<div dir="rtl">
  <InputOTP />
</div>`,
        },
      ]}
      props={[
        { name: "length", type: "number", default: "6", description: "Number of slots." },
        { name: "value", type: "string", default: "—", description: "Controlled joined value." },
        { name: "defaultValue", type: "string", default: '""', description: "Uncontrolled initial value." },
        { name: "onValueChange", type: "(value: string) => void", description: "Fires on every change." },
        { name: "onComplete", type: "(value: string) => void", description: "Fires once when every slot is filled." },
        { name: "pattern", type: "string", default: '"[0-9]"', description: "Allowed characters as a regex source." },
        { name: "uppercase", type: "boolean", default: "false", description: "Uppercase alphabetical input." },
        { name: "separatorAfter", type: "number[]", description: "Slot indexes after which a separator renders." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable all slots." },
        { name: "invalid", type: "boolean", default: "false", description: "Error state with aria-invalid." },
        { name: "autoFocus", type: "boolean", default: "false", description: "Focus the first slot on mount." },
        { name: "inputMode", type: '"text" | "numeric"', default: '"text"', description: "Mobile keyboard hint." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Text direction with mirrored arrows." },
        { name: "className", type: "string", description: "Extra classes for the root." },
        { name: "slotClassName", type: "string", description: "Extra classes for each slot." },
      ]}
    />
  );
}
