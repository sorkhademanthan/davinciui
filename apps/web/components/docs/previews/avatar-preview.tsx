"use client";

import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@workspace/ui/components/avatar";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full items-center justify-center p-8">{children}</div>;
}

export function AvatarPreview() {
  return (
    <Shell>
      <Avatar className="size-12">
        <AvatarImage src="https://github.com/shadcn.png" alt="Aarav Sharma" />
        <AvatarFallback>AS</AvatarFallback>
      </Avatar>
    </Shell>
  );
}

export function AvatarFallbackPreview() {
  return (
    <Shell>
      <div className="flex gap-3">
        <Avatar><AvatarFallback>AS</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>VP</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>AR</AvatarFallback></Avatar>
      </div>
    </Shell>
  );
}

export function AvatarBadgePreview() {
  return (
    <Shell>
      <Avatar className="size-12">
        <AvatarImage src="https://github.com/shadcn.png" alt="Online" />
        <AvatarFallback>AS</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </Shell>
  );
}

export function AvatarGroupPreview() {
  return (
    <Shell>
      <AvatarGroup>
        <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="Aarav" /><AvatarFallback>AS</AvatarFallback></Avatar>
        <Avatar><AvatarImage src="https://github.com/vercel.png" alt="Vivaan" /><AvatarFallback>VP</AvatarFallback></Avatar>
        <Avatar><AvatarImage src="https://github.com/evilrabbit.png" alt="Aditya" /><AvatarFallback>AR</AvatarFallback></Avatar>
      </AvatarGroup>
    </Shell>
  );
}

export function AvatarGroupCountPreview() {
  return (
    <Shell>
      <AvatarGroup>
        <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="A" /><AvatarFallback>AS</AvatarFallback></Avatar>
        <Avatar><AvatarImage src="https://github.com/vercel.png" alt="B" /><AvatarFallback>VP</AvatarFallback></Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
    </Shell>
  );
}

export function AvatarSizesPreview() {
  return (
    <Shell>
      <div className="flex items-center gap-4">
        <Avatar className="size-8"><AvatarFallback className="text-xs">SM</AvatarFallback></Avatar>
        <Avatar className="size-12"><AvatarFallback>M</AvatarFallback></Avatar>
        <Avatar className="size-16"><AvatarFallback className="text-base">LG</AvatarFallback></Avatar>
      </div>
    </Shell>
  );
}

export function AvatarRtlPreview() {
  return (
    <Shell>
      <div dir="rtl">
        <AvatarGroup>
          <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="A" /><AvatarFallback>AS</AvatarFallback></Avatar>
          <Avatar><AvatarImage src="https://github.com/vercel.png" alt="B" /><AvatarFallback>VP</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>٣</AvatarFallback></Avatar>
        </AvatarGroup>
      </div>
    </Shell>
  );
}
