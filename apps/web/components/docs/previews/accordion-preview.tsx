"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@workspace/ui/components/accordion";

export function AccordionPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>Yes. It comes with default styles that matches the other components.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>Yes. It is animated by default, but you can disable it if you prefer.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionBasicPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Accordion type="single" collapsible className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Basic item</AccordionTrigger>
          <AccordionContent>Basic content — single collapsible.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionMultiplePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Accordion type="multiple" defaultValue={["item-1"]} className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Item 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Accordion type="single" collapsible className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Enabled</AccordionTrigger>
          <AccordionContent>Enabled content</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled>
          <AccordionTrigger>Disabled</AccordionTrigger>
          <AccordionContent>Disabled content</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionBordersPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Accordion type="single" collapsible variant="bordered" className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Bordered 1</AccordionTrigger>
          <AccordionContent>Bordered content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Bordered 2</AccordionTrigger>
          <AccordionContent>Bordered content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionCardPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Accordion type="single" collapsible variant="card" className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>Card item</AccordionTrigger>
          <AccordionContent>Card style content with shadow and rounded border.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Another card</AccordionTrigger>
          <AccordionContent>More card content.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function AccordionRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Accordion type="single" collapsible className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>عنصر ١</AccordionTrigger>
          <AccordionContent>محتوى باللغة العربية</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>عنصر ٢</AccordionTrigger>
          <AccordionContent>محتوى آخر</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
