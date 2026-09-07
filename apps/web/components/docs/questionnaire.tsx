import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  QuestionnaireBasicPreview,
  QuestionnaireCardPreview,
  QuestionnaireConditionalPreview,
  QuestionnaireControlledPreview,
  QuestionnaireCustomProgressPreview,
  QuestionnaireFreeformPreview,
  QuestionnaireMultiplePreview,
  QuestionnaireShortcutsPreview,
  QuestionnaireSkipPreview,
  QuestionnaireValidationPreview,
} from "@/components/docs/previews/questionnaire-preview";
import { readComponentSource } from "@/lib/source-code";

const importCode = `import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"`;

const defaultCode = `import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

const items = [
  {
    name: "direction",
    required: true,
    prompt: "What should we prototype next?",
    choices: [
      { value: "delegation", label: "Delegation" },
      { value: "questions", label: "Question prompts" },
    ],
    input: { label: "Another answer", placeholder: "Type another answer…" },
  },
  {
    name: "detail",
    required: false,
    prompt: "How much detail should it include?",
    choices: [
      { value: "focused", label: "Focused" },
      { value: "complete", label: "Complete flow" },
    ],
  },
] as const

export function Example() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const answers = new FormData(event.currentTarget)
    // answers.get("direction"); getAll(...) for multiple items.
  }

  return (
    <Questionnaire items={items} onSubmit={handleSubmit}>
      <QuestionnaireProgress />
      {items.map((question) => (
        <QuestionnaireItem key={question.name} name={question.name} required={question.required}>
          <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
          <QuestionnaireChoices>
            {question.choices.map((choice) => (
              <QuestionnaireChoice key={choice.value} value={choice.value}>
                {choice.label}
              </QuestionnaireChoice>
            ))}
            {"input" in question ? (
              <QuestionnaireInput
                aria-label={question.input.label}
                placeholder={question.input.placeholder}
              />
            ) : null}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}`;

export async function QuestionnaireDocs() {
  const sourceCode =
    (await readComponentSource("questionnaire")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Questionnaire"
      description="A multi-step questionnaire with single-choice, multiple-choice, freeform, and skippable questions. Dependency-free with native form serialization."
      preview={<QuestionnaireBasicPreview />}
      previewCode={defaultCode}
      installPackageName="questionnaire"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/questionnaire.tsx"
      importCode={importCode}
      usageCode={defaultCode}
      usageNote={
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Questionnaire owns the ordered items, active item, answer state, validation, progress, and navigation. The
            containing page, card, dialog, or drawer owns close and cancellation behavior, persistence, transport, and
            branching.
          </p>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-6">
{`Questionnaire
├── QuestionnaireProgress
├── QuestionnaireItem
│   ├── QuestionnaireTitle
│   ├── QuestionnaireDescription
│   ├── QuestionnaireChoices
│   │   ├── QuestionnaireChoice
│   │   └── QuestionnaireInput
│   └── QuestionnaireError
└── QuestionnaireActions
    ├── QuestionnairePrevious
    ├── QuestionnaireSkip
    ├── QuestionnaireNext
    └── QuestionnaireSubmit`}
          </pre>
        </div>
      }
      examples={[
        {
          title: "Multiple Selection",
          preview: <QuestionnaireMultiplePreview />,
          code: `import { Questionnaire } from "@/components/ui/questionnaire"

// multiple turns fixed choices into native checkboxes.
const items = [
  {
    name: "signals",
    required: true,
    multiple: true,
    prompt: "What should every update include?",
    choices: [
      { value: "progress", label: "Progress" },
      { value: "decisions", label: "Decisions" },
      { value: "risks", label: "Risks" },
    ],
  },
] as const

<QuestionnaireItem name="signals" required multiple>
  {/* choices */}
</QuestionnaireItem>

// Read with FormData.getAll("signals")`,
        },
        {
          title: "Freeform Answer",
          preview: <QuestionnaireFreeformPreview />,
          code: `import { QuestionnaireInput } from "@/components/ui/questionnaire"

<QuestionnaireChoices>
  <QuestionnaireChoice value="small">Make the smallest safe change</QuestionnaireChoice>
  <QuestionnaireInput aria-label="More specific instruction" placeholder="Type…" />
</QuestionnaireChoices>`,
        },
        {
          title: "Explicit Skip",
          preview: <QuestionnaireSkipPreview />,
          code: `import { QuestionnaireSkip } from "@/components/ui/questionnaire"

// Skip records an intentional unanswered optional item.
// Observe it with Item onStatusChange: "unanswered" | "answered" | "skipped".
<QuestionnaireItem name="timing" onStatusChange={setStatus}>
  {/* choices */}
</QuestionnaireItem>
<QuestionnaireSkip />`,
        },
        {
          title: "Shortcuts",
          preview: <QuestionnaireShortcutsPreview />,
          code: `import { Questionnaire } from "@/components/ui/questionnaire"

// shortcuts="letters" (A–Z) or "numbers" (1–9).
// Selecting by shortcut does not advance to the next item.
<QuestionnaireRoot shortcuts="letters">
  <QuestionnaireChoice value="api">Inspect the implementation</QuestionnaireChoice>
</QuestionnaireRoot>`,
        },
        {
          title: "Controlled",
          preview: <QuestionnaireControlledPreview />,
          code: `import { Questionnaire } from "@/components/ui/questionnaire"

const [item, setItem] = React.useState("scope")

<Questionnaire item={item} onItemChange={setItem} onSubmit={handleSubmit}>
  <QuestionnaireItem name="scope" required>{/* … */}</QuestionnaireItem>
  <QuestionnaireItem name="verification" required>{/* … */}</QuestionnaireItem>
</Questionnaire>`,
        },
        {
          title: "Conditional Items",
          preview: <QuestionnaireConditionalPreview />,
          code: `import { QuestionnaireItem } from "@/components/ui/questionnaire"

// Disabled items are excluded from progress, navigation,
// validation, and submission.
<QuestionnaireItem name="region" disabled={runtime !== "remote"} required>
  {/* remote-only question */}
</QuestionnaireItem>`,
        },
        {
          title: "Custom Validation",
          preview: <QuestionnaireValidationPreview />,
          code: `import { QuestionnaireItem } from "@/components/ui/questionnaire"

// Combine controlled navigation with an external schema:
// set Item invalid, render the message in Error,
// and move to the first invalid item.
<QuestionnaireItem name="detail" required invalid={Boolean(errors.detail)}>
  <QuestionnaireError>{errors.detail}</QuestionnaireError>
</QuestionnaireItem>`,
        },
        {
          title: "Custom Progress",
          preview: <QuestionnaireCustomProgressPreview />,
          code: `import { QuestionnaireProgress } from "@/components/ui/questionnaire"

// render receives { current, total, first, last }.
<QuestionnaireProgress
  aria-label="Setup progress"
  render={(props, state) => (
    <output {...props}>
      Checkpoint {state.current} of {state.total}
    </output>
  )}
/>`,
        },
        {
          title: "Card",
          preview: <QuestionnaireCardPreview />,
          code: `import { Questionnaire } from "@/components/ui/questionnaire"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

// Place the root around a card; Title stays a semantic legend.
<Questionnaire onSubmit={handleSubmit}>
  <Card>
    <QuestionnaireItem name="task" required>
      <CardHeader>
        <QuestionnaireTitle>What should the agent work on?</QuestionnaireTitle>
      </CardHeader>
      <CardContent>{/* choices + error */}</CardContent>
    </QuestionnaireItem>
    <CardFooter>
      <QuestionnaireNext>Next</QuestionnaireNext>
      <QuestionnaireSubmit>Create task</QuestionnaireSubmit>
    </CardFooter>
  </Card>
</Questionnaire>`,
        },
      ]}
      props={[
        { name: "items", type: "readonly QuestionnaireItemDefinition[]", default: "—", description: "Item collection for server-rendered progress, order, actions, and shortcuts." },
        { name: "item", type: "string", default: "—", description: "Controlled active item name." },
        { name: "defaultItem", type: "string", default: "first enabled", description: "Initially active item. Restored on form reset." },
        { name: "onItemChange", type: "(item: string) => void", description: "Fires when navigation requests a different item." },
        { name: "shortcuts", type: '"letters" | "numbers"', default: "—", description: "Assigns a scoped shortcut key to each enabled fixed choice." },
        { name: "noValidate", type: "boolean", default: "true", description: "Disables native constraint UI; validation uses QuestionnaireError." },
        { name: "name", type: "string", default: "—", description: "Item identifier and native form field name. Must be unique per root." },
        { name: "required", type: "boolean", default: "false", description: "Requires an answer; hides Skip for the item." },
        { name: "multiple", type: "boolean", default: "false", description: "Renders fixed choices as checkboxes. Read with FormData.getAll()." },
        { name: "disabled", type: "boolean", default: "false", description: "Omits the item from progress, navigation, validation, and submission." },
        { name: "invalid", type: "boolean", default: "false", description: "Marks the item invalid from an external validator." },
        { name: "onStatusChange", type: '(status: "unanswered" | "answered" | "skipped") => void', description: "Observes answer-status changes for an item." },
        { name: "value", type: "string", default: "—", description: "Choice answer value submitted under the item name." },
        { name: "render", type: "(props, state) => ReactElement", default: "—", description: "Custom render target for Progress and navigation actions with their state." },
        { name: "aria-label", type: "string", default: '"Another answer"', description: "Accessible name for the freeform input. A placeholder is not a label." },
      ]}
    />
  );
}
