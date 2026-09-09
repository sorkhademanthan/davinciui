"use client";

import * as React from "react";
import {
  Field,
  FieldControl,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldSeparator,
  FieldError,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Select } from "@workspace/ui/components/select";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { RadioGroup, Radio } from "@workspace/ui/components/radio";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-sm">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Field / FieldGroup / FieldSet
// ─────────────────────────────────────────────────────────────

export function FieldDemo() {
  return (
    <DemoShell>
      <Field>
        <FieldLabel htmlFor="field-demo-name">Name</FieldLabel>
        <Input id="field-demo-name" placeholder="Ada Lovelace" />
        <FieldDescription>Your display name across workspaces.</FieldDescription>
      </Field>
    </DemoShell>
  );
}

export function FieldGroupDemo() {
  return (
    <DemoShell>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="fg-name">Name</FieldLabel>
          <Input id="fg-name" placeholder="Ada Lovelace" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fg-email">Email</FieldLabel>
          <Input id="fg-email" type="email" placeholder="ada@analytical.engine" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fg-pass">Password</FieldLabel>
          <Input id="fg-pass" type="password" placeholder="••••••••" />
        </Field>
      </FieldGroup>
    </DemoShell>
  );
}

export function FieldSetDemo() {
  return (
    <DemoShell>
      <FieldSet>
        <FieldLegend>Billing details</FieldLegend>
        <Field>
          <FieldLabel htmlFor="fs-card">Card number</FieldLabel>
          <Input id="fs-card" inputMode="numeric" placeholder="4242 4242 4242 4242" />
        </Field>
        <Field>
          <FieldLabel htmlFor="fs-zip">ZIP code</FieldLabel>
          <Input id="fs-zip" inputMode="numeric" placeholder="94110" />
        </Field>
      </FieldSet>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Anatomy — annotated parts
// ─────────────────────────────────────────────────────────────

function Part({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg border border-dashed border-foreground/25 p-2 pt-5">
      <span className="absolute left-2 top-1 font-mono text-[10px] text-muted-foreground">{name}</span>
      {children}
    </div>
  );
}

export function AnatomyDemo() {
  return (
    <DemoShell>
      <Part name="Field">
        <Field invalid>
          <Part name="FieldLabel">
            <FieldLabel htmlFor="anatomy-email">Email</FieldLabel>
          </Part>
          <Part name="Input">
            <Input id="anatomy-email" aria-invalid placeholder="ada@analytical.engine" />
          </Part>
          <Part name="FieldDescription">
            <FieldDescription>We never share your email.</FieldDescription>
          </Part>
          <Part name="FieldError">
            <FieldError forceShow>Enter a valid email.</FieldError>
          </Part>
        </Field>
      </Part>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Form + controls
// ─────────────────────────────────────────────────────────────

export function FormDemo() {
  const [sent, setSent] = React.useState(false);
  return (
    <DemoShell readout={sent ? "Submitted ✓" : undefined}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
          window.setTimeout(() => setSent(false), 2000);
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="form-name">Name</FieldLabel>
            <Input id="form-name" required placeholder="Ada Lovelace" />
          </Field>
          <Field>
            <FieldLabel htmlFor="form-email">Email</FieldLabel>
            <Input id="form-email" type="email" required placeholder="ada@analytical.engine" />
            <FieldDescription>Invite lands here.</FieldDescription>
          </Field>
          <button
            type="submit"
            className="h-10 rounded-lg bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95"
          >
            Send invite
          </button>
        </FieldGroup>
      </form>
    </DemoShell>
  );
}

export function InputFieldDemo() {
  return (
    <DemoShell>
      <Field>
        <FieldLabel htmlFor="in-username">Username</FieldLabel>
        <Input id="in-username" placeholder="adalovelace" />
        <FieldDescription>Letters, numbers, and underscores only.</FieldDescription>
      </Field>
    </DemoShell>
  );
}

export function TextareaFieldDemo() {
  return (
    <DemoShell>
      <Field>
        <FieldLabel htmlFor="ta-bio">Bio</FieldLabel>
        <Textarea id="ta-bio" rows={3} placeholder="First programmer, eternal analyst…" />
        <FieldDescription>Shown on your public profile.</FieldDescription>
      </Field>
    </DemoShell>
  );
}

export function SelectFieldDemo() {
  return (
    <DemoShell>
      <Field>
        <FieldLabel htmlFor="sel-role">Role</FieldLabel>
        <Select id="sel-role" defaultValue="engineer">
          <option value="engineer">Engineer</option>
          <option value="designer">Designer</option>
          <option value="founder">Founder</option>
        </Select>
        <FieldDescription>Controls default permissions.</FieldDescription>
      </Field>
    </DemoShell>
  );
}

export function SliderFieldDemo() {
  const [value, setValue] = React.useState(60);
  return (
    <DemoShell readout={`${value}%`}>
      <Field>
        <FieldLabel htmlFor="sl-volume">Volume</FieldLabel>
        <input
          id="sl-volume"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="h-1.5 w-full accent-foreground"
        />
        <FieldDescription>Native range — swaps for the Slider component when it lands.</FieldDescription>
      </Field>
    </DemoShell>
  );
}

export function CheckboxFieldDemo() {
  return (
    <DemoShell>
      <Field orientation="horizontal">
        <Checkbox id="cb-terms" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="cb-terms">Accept terms</FieldLabel>
          <FieldDescription>You agree to the analytical engine charter.</FieldDescription>
        </FieldContent>
      </Field>
    </DemoShell>
  );
}

export function RadioFieldDemo() {
  return (
    <DemoShell>
      <Field>
        <FieldTitle>Plan</FieldTitle>
        <RadioGroup defaultValue="pro">
          <Radio name="plan" value="Hobby" />
          <Radio name="plan" value="Pro" defaultChecked />
          <Radio name="plan" value="Team" />
        </RadioGroup>
        <FieldDescription>Billed monthly, cancel anytime.</FieldDescription>
      </Field>
    </DemoShell>
  );
}

export function SwitchFieldDemo() {
  const [on, setOn] = React.useState(true);
  return (
    <DemoShell readout={on ? "Notifications on" : "Notifications off"}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="sw-notify">Notifications</FieldLabel>
          <FieldDescription>Email me about new results.</FieldDescription>
        </FieldContent>
        <Switch id="sw-notify" checked={on} onCheckedChange={setOn} />
      </Field>
    </DemoShell>
  );
}

const PLANS = [
  { value: "hobby", title: "Hobby", desc: "For side projects", price: "$0" },
  { value: "pro", title: "Pro", desc: "For professionals", price: "$20" },
  { value: "team", title: "Team", desc: "For organizations", price: "$99" },
];

export function ChoiceCardDemo() {
  const [plan, setPlan] = React.useState("pro");
  return (
    <DemoShell readout={`plan=${plan}`}>
      <Field>
        <FieldTitle>Choose a plan</FieldTitle>
        <div className="grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <label
              key={p.value}
              className={cn(
                "cursor-pointer rounded-xl border p-3 text-left transition-all",
                plan === p.value
                  ? "border-foreground shadow-sm"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="choice-plan"
                value={p.value}
                checked={plan === p.value}
                onChange={() => setPlan(p.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold">{p.title}</span>
              <span className="mt-0.5 block text-xs">{p.desc}</span>
              <span className="mt-1.5 block font-mono text-xs">{p.price}</span>
            </label>
          ))}
        </div>
      </Field>
    </DemoShell>
  );
}

export function FieldGroupTitledDemo() {
  return (
    <DemoShell>
      <FieldGroup>
        <div>
          <FieldTitle>Profile</FieldTitle>
          <FieldDescription>How you appear to the team.</FieldDescription>
        </div>
        <Field>
          <FieldLabel htmlFor="fgt-name">Name</FieldLabel>
          <Input id="fgt-name" placeholder="Ada Lovelace" />
        </Field>
        <FieldSeparator>Notifications</FieldSeparator>
        <Field orientation="horizontal">
          <Checkbox id="fgt-news" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="fgt-news">Newsletter</FieldLabel>
            <FieldDescription>Monthly dispatches, no spam.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </DemoShell>
  );
}

// ─────────────────────────────────────────────────────────────
// RTL / Responsive / Validation
// ─────────────────────────────────────────────────────────────

export function RtlFieldDemo() {
  return (
    <DemoShell>
      <div dir="rtl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="rtl-name">الاسم</FieldLabel>
            <Input id="rtl-name" placeholder="آدا لوفليس" />
            <FieldDescription>يظهر اسمك للفريق.</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="rtl-news" defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor="rtl-news">النشرة البريدية</FieldLabel>
              <FieldDescription>رسائل شهرية فقط.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </div>
    </DemoShell>
  );
}

export function ResponsiveFieldDemo() {
  return (
    <DemoShell readout="Resize: stacks on mobile, rows on sm+">
      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel htmlFor="resp-email">Email alerts</FieldLabel>
          <FieldDescription>Critical incidents only, delivered instantly.</FieldDescription>
        </FieldContent>
        <Switch id="resp-email" defaultChecked />
      </Field>
    </DemoShell>
  );
}

export function ValidationDemo() {
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const invalid = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <DemoShell readout={invalid ? "invalid — error announced via role=alert" : "type an invalid email, then blur"}>
      <Field invalid={invalid}>
        <FieldLabel>Work email</FieldLabel>
        <FieldControl>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="ada@analytical.engine"
          />
        </FieldControl>
        {!invalid && <FieldDescription>We will verify this address.</FieldDescription>}
        <FieldError errors={invalid ? ["Enter a valid work email address."] : []} />
      </Field>
    </DemoShell>
  );
}
