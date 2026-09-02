"use client";

import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export function FormPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Form className="w-full max-w-sm border rounded-lg p-6">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="email@example.com" />
          </FormControl>
          <FormDescription>We&apos;ll never share your email.</FormDescription>
        </FormItem>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </Form>
    </div>
  );
}

export function FormFieldPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Form className="w-full max-w-sm">
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="Username" />
          </FormControl>
        </FormItem>
      </Form>
    </div>
  );
}

export function FormDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Form className="w-full max-w-sm">
        <FormItem>
          <FormLabel>Disabled</FormLabel>
          <FormControl>
            <Input disabled placeholder="Disabled" />
          </FormControl>
        </FormItem>
      </Form>
    </div>
  );
}

export function FormInvalidPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Form className="w-full max-w-sm">
        <FormItem>
          <FormLabel>Invalid</FormLabel>
          <FormControl>
            <Input aria-invalid placeholder="Invalid" />
          </FormControl>
          <FormMessage>This field is required.</FormMessage>
        </FormItem>
      </Form>
    </div>
  );
}

export function FormInlinePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Form className="flex gap-2 max-w-sm w-full">
        <FormControl className="flex-1">
          <Input placeholder="Inline" />
        </FormControl>
        <Button>Go</Button>
      </Form>
    </div>
  );
}

export function FormGridPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Form className="grid grid-cols-2 gap-4 max-w-sm w-full">
        <FormItem>
          <FormLabel>First</FormLabel>
          <FormControl>
            <Input placeholder="First" />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>Last</FormLabel>
          <FormControl>
            <Input placeholder="Last" />
          </FormControl>
        </FormItem>
      </Form>
    </div>
  );
}

export function FormRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Form className="w-full max-w-sm">
        <FormItem>
          <FormLabel>RTL</FormLabel>
          <FormControl>
            <Input placeholder="نص" />
          </FormControl>
        </FormItem>
      </Form>
    </div>
  );
}
