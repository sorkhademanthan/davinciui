import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  AlignDemo,
  BlockEndDemo,
  BlockStartDemo,
  ButtonDemo,
  CustomInputDemo,
  DropdownDemo,
  IconDemo,
  InlineEndDemo,
  InlineStartDemo,
  KbdDemo,
  RtlInputGroupDemo,
  SpinnerDemo,
  TextDemo,
  TextareaDemo,
} from "@/components/docs/previews/input-group-preview";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function Example() {
  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">@</InputGroupAddon>
      <InputGroupInput placeholder="Username" />
    </InputGroup>
  );
}`;

const compositionNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">Composition</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
    <p>
      InputGroup auto-arranges its children by <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">align</code>:
      block addons stack above and below, everything else shares one middle row in JSX order — no
      wrapper divs to think about. Icons, text, buttons, kbd hints, and selects all dock as addons
      around a borderless field.
    </p>
    </div>
  </div>
);

export async function InputGroupDocs() {
  const sourceCode =
    (await readComponentSource("input-group")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Input Group"
      description="Compound field with dockable addons — icons, text, buttons, and hints arranged inline or stacked around an input or textarea."
      preview={
        <div className="flex flex-col items-center justify-center">
          <div className="w-72">
            <InputGroup>
              <InputGroupAddon align="inline-start">@</InputGroupAddon>
              <InputGroupInput placeholder="Username" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>Check</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="input-group"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/input-group.tsx"
      usageCode={defaultCode}
      usageNote={compositionNote}
      examples={[
        {
          title: "Align",
          preview: <AlignDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// inline-start · inline-end · block-start · block-end
<InputGroup>
  <InputGroupAddon align="inline-start">@</InputGroupAddon>
  <InputGroupInput placeholder="Username" />
</InputGroup>

<InputGroup>
  <InputGroupInput placeholder="Amount" />
  <InputGroupAddon align="inline-end">USD</InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "inline-start",
          preview: <InlineStartDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="inline-start">
    <Search className="size-4" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search components…" />
</InputGroup>`,
        },
        {
          title: "inline-end",
          preview: <InlineEndDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupInput placeholder="Repository name" />
  <InputGroupAddon align="inline-end">
    <kbd>↵</kbd>
  </InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "block-start",
          preview: <BlockStartDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="block-start">
    <span>API token</span>
    <span>Regenerate it anytime.</span>
  </InputGroupAddon>
  <InputGroupInput placeholder="sk-live-…" />
</InputGroup>`,
        },
        {
          title: "block-end",
          preview: <BlockEndDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupInput placeholder="Display name" maxLength={60} />
  <InputGroupAddon align="block-end">
    <span>Visible across workspaces.</span>
  </InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "Icon",
          preview: <IconDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="inline-start">
    <Search className="size-4" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search…" />
  <InputGroupAddon align="inline-end">
    <Command className="size-4" />
  </InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "Text",
          preview: <TextDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="inline-start">$</InputGroupAddon>
  <InputGroupInput placeholder="0.00" inputMode="decimal" />
  <InputGroupAddon align="inline-end">.00</InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "Button",
          preview: <ButtonDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupInput placeholder="teammate@studio.co" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton onClick={invite}>Invite</InputGroupButton>
  </InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "Kbd",
          preview: <KbdDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupInput placeholder="Jump to…" />
  <InputGroupAddon align="inline-end">
    <kbd>⌘K</kbd>
  </InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "Dropdown",
          preview: <DropdownDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="inline-start">
    <select aria-label="Currency">
      <option>USD</option>
      <option>EUR</option>
    </select>
  </InputGroupAddon>
  <InputGroupInput placeholder="0.00" />
</InputGroup>`,
        },
        {
          title: "Spinner",
          preview: <SpinnerDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="inline-start">
    <Loader2 className="size-4 animate-spin" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Syncing…" disabled />
</InputGroup>`,
        },
        {
          title: "Textarea",
          preview: <TextareaDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupAddon align="block-start">Feedback</InputGroupAddon>
  <InputGroupTextarea placeholder="Tell us what happened…" rows={3} />
  <InputGroupAddon align="block-end">Markdown supported.</InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "Custom Input",
          preview: <CustomInputDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
  <InputGroupInput type={show ? "text" : "password"} />
  <InputGroupAddon align="inline-end">
    <button onClick={() => setShow((s) => !s)}>Show</button>
  </InputGroupAddon>
</InputGroup>`,
        },
        {
          title: "RTL",
          preview: <RtlInputGroupDemo />,
          code: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

<div dir="rtl">
  <InputGroup>
    <InputGroupAddon align="inline-start">
      <Search className="size-4" />
    </InputGroupAddon>
    <InputGroupInput placeholder="ابحث…" />
  </InputGroup>
</div>`,
        },
      ]}
      props={[
        { name: "InputGroupAddon · align", type: '"inline-start" | "inline-end" | "block-start" | "block-end"', default: '"inline-start"', description: "Addon placement around the field; block addons stack full-width." },
        { name: "InputGroupInput", type: "input element", description: "Borderless field that fills the middle row." },
        { name: "InputGroupTextarea", type: "textarea element", description: "Resizable multiline field for taller groups." },
        { name: "InputGroupButton", type: "button element", description: "Action button docked as an addon." },
      ]}
    />
  );
}
