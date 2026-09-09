"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";

function DemoShell({ children, readout }: { children: React.ReactNode; readout?: string }) {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 overflow-auto bg-background p-6">
      <div className="w-full max-w-md">{children}</div>
      {readout !== undefined && (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {readout}
        </p>
      )}
    </div>
  );
}

export function AccordionPreview() {
  return (
    <DemoShell readout="one open at a time · arrow keys move between triggers">
      <Accordion defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. Triggers expose aria-expanded, panels are labelled regions, and arrow keys move focus between headings.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>Yes. It comes with default styles that match the other components.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>
            Yes. Panels animate height with pure CSS grid rows — no JavaScript measurement, and it respects reduced motion.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DemoShell>
  );
}

export function AccordionBasicPreview() {
  return (
    <DemoShell readout="single collapsible — first item open">
      <Accordion defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>How do I reset my password?</AccordionTrigger>
          <AccordionContent>
            Click ‘Forgot Password’ on the login page, enter your email, and we’ll send you a link. It expires in 24 hours.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Can I change my subscription plan?</AccordionTrigger>
          <AccordionContent>Yes — upgrade, downgrade, or cancel from billing settings at any time.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>Cards, bank transfer, and annual invoicing on Enterprise plans.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DemoShell>
  );
}

export function AccordionMultiplePreview() {
  return (
    <DemoShell readout="multiple stays open together">
      <Accordion multiple defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Notification Settings</AccordionTrigger>
          <AccordionContent>Enable email alerts for updates or push notifications for mobile devices.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Privacy &amp; Security</AccordionTrigger>
          <AccordionContent>Two-factor authentication, session controls, and audit logs.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Billing &amp; Subscription</AccordionTrigger>
          <AccordionContent>Monthly or annual cycles, charged at the start of each period.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DemoShell>
  );
}

export function AccordionDisabledPreview() {
  return (
    <DemoShell>
      <Accordion defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Can I access my account history?</AccordionTrigger>
          <AccordionContent>Yes — every invoice and change is listed under activity.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Premium feature information</AccordionTrigger>
          <AccordionContent>This content is unavailable on your plan.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How do I update my email address?</AccordionTrigger>
          <AccordionContent>From profile settings — we’ll confirm the new address first.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DemoShell>
  );
}

export function AccordionBordersPreview() {
  return (
    <DemoShell>
      <Accordion variant="bordered" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>How does billing work?</AccordionTrigger>
          <AccordionContent>
            Monthly and annual plans, charged at the start of each cycle. Cancel anytime — every plan includes backups and 24/7 support.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is my data secure?</AccordionTrigger>
          <AccordionContent>Encrypted in transit and at rest, with regional residency options.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>What integrations do you support?</AccordionTrigger>
          <AccordionContent>Sixty-plus native integrations plus a REST API and webhooks.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DemoShell>
  );
}

export function AccordionCardPreview() {
  return (
    <DemoShell readout="open cards lift with border + shadow">
      <Accordion variant="card" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What subscription plans do you offer?</AccordionTrigger>
          <AccordionContent>Starter ($9), Professional ($29), Enterprise ($99) — increasing storage, API access, and support.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How does billing work?</AccordionTrigger>
          <AccordionContent>Charged at the start of each cycle, cancel anytime.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
          <AccordionContent>One click from billing settings — access continues to period end.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DemoShell>
  );
}

export function AccordionControlledPreview() {
  const [value, setValue] = React.useState<string | string[]>("item-1");
  const readout = Array.isArray(value) ? value.join(", ") : value;
  return (
    <DemoShell readout={readout ? `open: ${readout}` : "open: (none)"}>
      <div className="flex w-full flex-col gap-4">
        <Accordion value={value} onValueChange={setValue}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Controlled item one</AccordionTrigger>
            <AccordionContent>State lives in the host — drive it from anywhere.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Controlled item two</AccordionTrigger>
            <AccordionContent>Buttons below open each item programmatically.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex gap-2">
          {(["item-1", "item-2"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setValue((cur) => (cur === v ? "" : v))}
              aria-pressed={value === v}
              className="h-8 flex-1 rounded-md border bg-background text-xs font-medium shadow-xs transition-colors hover:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}

export function AccordionRtlPreview() {
  return (
    <DemoShell>
      <div dir="rtl" className="w-full">
        <Accordion defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>كيف يمكنني إعادة تعيين كلمة المرور؟</AccordionTrigger>
            <AccordionContent>انقر على ‘نسيت كلمة المرور’ وسنرسل لك رابطًا تنتهي صلاحيته خلال 24 ساعة.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>هل يمكنني تغيير خطة الاشتراك؟</AccordionTrigger>
            <AccordionContent>نعم — من إعدادات الفوترة في أي وقت.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>ما هي طرق الدفع المقبولة؟</AccordionTrigger>
            <AccordionContent>البطاقات والتحويل البنكي والفوترة السنوية.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoShell>
  );
}
