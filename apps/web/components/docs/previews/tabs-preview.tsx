"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Settings, User } from "lucide-react";

export function TabsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account content.</TabsContent>
        <TabsContent value="password">Password content.</TabsContent>
      </Tabs>
    </div>
  );
}

export function TabsLinePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList className="bg-transparent p-0 gap-4">
          <TabsTrigger value="account" variant="line">Account</TabsTrigger>
          <TabsTrigger value="password" variant="line">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account line.</TabsContent>
        <TabsContent value="password">Password line.</TabsContent>
      </Tabs>
    </div>
  );
}

export function TabsVerticalPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Tabs defaultValue="account" orientation="vertical" className="w-full max-w-md flex gap-4">
        <TabsList className="flex-col h-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <div className="flex-1">
          <TabsContent value="account">Vertical account.</TabsContent>
          <TabsContent value="password">Vertical password.</TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function TabsDisabledPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password" disabled>
            Disabled
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account</TabsContent>
      </Tabs>
    </div>
  );
}

export function TabsIconsPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">
            <User className="size-4 mr-1" />
            Account
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="size-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">With icons.</TabsContent>
        <TabsContent value="settings">Settings content.</TabsContent>
      </Tabs>
    </div>
  );
}

export function TabsRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <Tabs defaultValue="account" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="account">حساب</TabsTrigger>
          <TabsTrigger value="password">كلمة السر</TabsTrigger>
        </TabsList>
        <TabsContent value="account">محتوى</TabsContent>
      </Tabs>
    </div>
  );
}
