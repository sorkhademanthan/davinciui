"use client";

import * as React from "react";
import {
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
  type QuestionnaireItemStatus,
} from "@workspace/ui/components/questionnaire";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[380px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

function onDemoSubmit(label: string) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(`[${label}]`, Object.fromEntries(data.entries()));
  };
}

const basicItems = [
  {
    name: "direction",
    required: true,
    prompt: "What should the agent build next?",
    description: "Choose a direction or describe another task.",
    choices: [
      { value: "timeline", label: "Tool call timeline", description: "Show what the agent ran and what came back." },
      { value: "approvals", label: "Approval checkpoints", description: "Ask before sensitive or destructive actions." },
      { value: "handoffs", label: "Sub-agent handoffs", description: "Make delegated work easier to follow." },
    ],
    input: { label: "Another answer", placeholder: "Type another answer…" },
  },
  {
    name: "signals",
    required: true,
    multiple: true,
    prompt: "What should every progress update include?",
    description: "Select all that apply.",
    choices: [
      { value: "progress", label: "Progress" },
      { value: "decisions", label: "Decisions" },
      { value: "risks", label: "Risks" },
      { value: "next", label: "Next step" },
    ],
  },
  {
    name: "timing",
    required: false,
    prompt: "When should work begin?",
    description: "Skip this if you are not sure yet.",
    choices: [
      { value: "now", label: "Start now" },
      { value: "cycle", label: "Next development cycle" },
      { value: "backlog", label: "Add it to the backlog" },
    ],
  },
] as const;

function renderBasicItem(question: (typeof basicItems)[number]) {
  return (
    <QuestionnaireItem
      key={question.name}
      name={question.name}
      required={question.required}
      multiple={"multiple" in question && question.multiple === true}
    >
      <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
      <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
      <QuestionnaireChoices>
        {question.choices.map((choice) => (
          <QuestionnaireChoice key={choice.value} value={choice.value}>
            <span className="font-medium">{choice.label}</span>
            {"description" in choice ? (
              <span className="text-muted-foreground">{"description" in choice && choice.description}</span>
            ) : null}
          </QuestionnaireChoice>
        ))}
        {"input" in question ? (
          <QuestionnaireInput aria-label={question.input.label} placeholder={question.input.placeholder} />
        ) : null}
      </QuestionnaireChoices>
      <QuestionnaireError />
    </QuestionnaireItem>
  );
}

export function QuestionnaireBasicPreview() {
  return (
    <DemoShell>
      <Questionnaire items={basicItems} onSubmit={onDemoSubmit("basic")}>
        <QuestionnaireProgress />
        {basicItems.map(renderBasicItem)}
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save plan</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireMultiplePreview() {
  const items = [
    {
      name: "signals",
      required: true,
      multiple: true,
      prompt: "What context should the agent inspect?",
      description: "Select every source that may affect the implementation.",
      choices: [
        { value: "files", label: "Relevant source files" },
        { value: "tests", label: "Existing tests" },
        { value: "docs", label: "Architecture documentation" },
        { value: "history", label: "Recent commit history" },
      ],
    },
  ] as const;
  const [readout, setReadout] = React.useState("nothing selected yet");
  return (
    <DemoShell readout={readout}>
      <Questionnaire
        items={items}
        onSubmit={(e) => {
          e.preventDefault();
          setReadout(new FormData(e.currentTarget).getAll("signals").map(String).join(", ") || "(empty)");
        }}
      >
        <QuestionnaireProgress />
        {items.map((q) => (
          <QuestionnaireItem key={q.name} name={q.name} required multiple>
            <QuestionnaireTitle>{q.prompt}</QuestionnaireTitle>
            <QuestionnaireDescription>{q.description}</QuestionnaireDescription>
            <QuestionnaireChoices>
              {q.choices.map((c) => (
                <QuestionnaireChoice key={c.value} value={c.value}>
                  {c.label}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnaireSubmit>Share context</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireFreeformPreview() {
  const items = [
    {
      name: "approach",
      required: true,
      prompt: "How should the agent approach this refactor?",
      description: "Choose a strategy or write a more specific instruction.",
      choices: [
        { value: "small", label: "Make the smallest safe change" },
        { value: "module", label: "Refactor one module at a time" },
        { value: "replace", label: "Replace the implementation completely" },
      ],
      input: { label: "More specific instruction", placeholder: "Type a more specific instruction…" },
    },
  ] as const;
  return (
    <DemoShell>
      <Questionnaire items={items} onSubmit={onDemoSubmit("freeform")}>
        <QuestionnaireProgress />
        {items.map((q) => (
          <QuestionnaireItem key={q.name} name={q.name} required>
            <QuestionnaireTitle>{q.prompt}</QuestionnaireTitle>
            <QuestionnaireDescription>{q.description}</QuestionnaireDescription>
            <QuestionnaireChoices>
              {q.choices.map((c) => (
                <QuestionnaireChoice key={c.value} value={c.value}>
                  {c.label}
                </QuestionnaireChoice>
              ))}
              <QuestionnaireInput aria-label={q.input.label} placeholder={q.input.placeholder} />
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnaireSubmit>Use this approach</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireSkipPreview() {
  const [status, setStatus] = React.useState<QuestionnaireItemStatus>("unanswered");
  return (
    <DemoShell readout={`timing: ${status}`}>
      <Questionnaire onSubmit={onDemoSubmit("skip")}>
        <QuestionnaireProgress />
        <QuestionnaireItem name="timing" onStatusChange={setStatus}>
          <QuestionnaireTitle>When should this be revisited?</QuestionnaireTitle>
          <QuestionnaireDescription>Skip this if timing has not been decided.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="week">This week</QuestionnaireChoice>
            <QuestionnaireChoice value="cycle">Next cycle</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSkip />
          <QuestionnaireSubmit>Submit</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireShortcutsPreview() {
  return (
    <DemoShell readout="Press A / B / C — shortcuts pause while typing">
      <Questionnaire
        shortcuts="letters"
        items={[
          { name: "review", required: true, choices: [{ value: "api" }, { value: "tests" }, { value: "patch" }] },
        ]}
        onSubmit={onDemoSubmit("shortcuts")}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="review" required>
          <QuestionnaireTitle>What should the agent do next?</QuestionnaireTitle>
          <QuestionnaireDescription>Use the displayed shortcut or navigate with the keyboard.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="api">Inspect the implementation</QuestionnaireChoice>
            <QuestionnaireChoice value="tests">Run the relevant tests</QuestionnaireChoice>
            <QuestionnaireChoice value="patch">Prepare the patch</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnaireSubmit>Confirm action</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireControlledPreview() {
  const [item, setItem] = React.useState("scope");
  return (
    <DemoShell readout={`active: ${item}`}>
      <Questionnaire item={item} onItemChange={setItem} onSubmit={onDemoSubmit("controlled")}>
        <QuestionnaireProgress />
        <QuestionnaireItem name="scope" required>
          <QuestionnaireTitle>What may the agent change?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="target">Only the target component</QuestionnaireChoice>
            <QuestionnaireChoice value="tests">Component and related tests</QuestionnaireChoice>
            <QuestionnaireChoice value="feature">The complete feature area</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="verification" required>
          <QuestionnaireTitle>Which verification level should it use?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="targeted">Targeted tests</QuestionnaireChoice>
            <QuestionnaireChoice value="package">Package tests and typecheck</QuestionnaireChoice>
            <QuestionnaireChoice value="workspace">Full workspace verification</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save workflow</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireConditionalPreview() {
  const [runtime, setRuntime] = React.useState("local");
  return (
    <DemoShell readout={runtime === "remote" ? "2 questions" : "1 question (region disabled)"}>
      <Questionnaire onSubmit={onDemoSubmit("conditional")}>
        <QuestionnaireProgress />
        <QuestionnaireItem name="runtime" required>
          <QuestionnaireTitle>Where should the agent run?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="local" checked={runtime === "local"} onChange={() => setRuntime("local")}>
              Local workspace
            </QuestionnaireChoice>
            <QuestionnaireChoice value="remote" checked={runtime === "remote"} onChange={() => setRuntime("remote")}>
              Cloud workspace
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="region" disabled={runtime !== "remote"} required>
          <QuestionnaireTitle>Which cloud environment should it use?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="preview">Preview</QuestionnaireChoice>
            <QuestionnaireChoice value="staging">Staging</QuestionnaireChoice>
            <QuestionnaireChoice value="sandbox">Isolated sandbox</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Save execution plan</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireCustomProgressPreview() {
  return (
    <DemoShell>
      <Questionnaire onSubmit={onDemoSubmit("progress")}>
        <QuestionnaireProgress
          aria-label="Setup progress"
          render={(props, state) => (
            <output
              {...(props as React.OutputHTMLAttributes<HTMLOutputElement>)}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Checkpoint {state.current} of {state.total}
            </output>
          )}
        />
        <QuestionnaireItem name="size" required>
          <QuestionnaireTitle>How large is the change?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="patch">Small patch</QuestionnaireChoice>
            <QuestionnaireChoice value="feature">Feature-sized change</QuestionnaireChoice>
            <QuestionnaireChoice value="cross">Cross-package change</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="delivery" required>
          <QuestionnaireTitle>How should the work be delivered?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="patch">Patch only</QuestionnaireChoice>
            <QuestionnaireChoice value="local">Committed locally</QuestionnaireChoice>
            <QuestionnaireChoice value="branch">Push a review branch</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Finish plan</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireCardPreview() {
  return (
    <DemoShell>
      <Questionnaire onSubmit={onDemoSubmit("card")}>
        <Card>
          <QuestionnaireItem name="task" required>
            <CardHeader>
              <QuestionnaireTitle className="text-base">What should the agent work on?</QuestionnaireTitle>
              <QuestionnaireDescription>Choose the task that should be handled next.</QuestionnaireDescription>
            </CardHeader>
            <CardContent>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="tests">Fix the failing tests</QuestionnaireChoice>
                <QuestionnaireChoice value="data">Refactor the data layer</QuestionnaireChoice>
                <QuestionnaireChoice value="guide">Update the integration guide</QuestionnaireChoice>
              </QuestionnaireChoices>
              <QuestionnaireError />
            </CardContent>
          </QuestionnaireItem>
          <CardFooter className="gap-2">
            <QuestionnaireNext>Create task</QuestionnaireNext>
            <QuestionnaireSubmit>Create task</QuestionnaireSubmit>
          </CardFooter>
        </Card>
      </Questionnaire>
    </DemoShell>
  );
}

export function QuestionnaireValidationPreview() {
  const [item, setItem] = React.useState("depth");
  const [error, setError] = React.useState<string | null>(null);
  return (
    <DemoShell readout={error ?? "answers valid"}>
      <Questionnaire
        item={item}
        onItemChange={setItem}
        onSubmit={(e) => {
          e.preventDefault();
          const detail = String(new FormData(e.currentTarget).get("audience") ?? "");
          if (!detail) {
            setError("Pick who will read the answer — public answers need complete context.");
            setItem("audience");
            return;
          }
          setError(null);
          onDemoSubmit("validation")(e);
        }}
      >
        <QuestionnaireProgress />
        <QuestionnaireItem name="depth" required>
          <QuestionnaireTitle>How much detail should the answer include?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="concise">Concise summary</QuestionnaireChoice>
            <QuestionnaireChoice value="complete">Complete answer</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem name="audience" required invalid={Boolean(error)}>
          <QuestionnaireTitle>Who will read the answer?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
            <QuestionnaireChoice value="public">Public audience</QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>{error}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireNext />
          <QuestionnaireSubmit>Validate answers</QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </DemoShell>
  );
}
