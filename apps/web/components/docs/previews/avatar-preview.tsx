"use client";

import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";

export function AvatarPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function AvatarBadgePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
        <AvatarFallback>CN</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </div>
  );
}

export function AvatarBadgeIconPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
        <AvatarFallback>CN</AvatarFallback>
        <AvatarBadge className="flex items-center justify-center bg-blue-500 text-[8px] text-white">✓</AvatarBadge>
      </Avatar>
    </div>
  );
}

export function AvatarGroupPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AvatarGroup>
        <Avatar className="size-8"><AvatarImage src="https://github.com/shadcn.png" alt="1" /><AvatarFallback>A</AvatarFallback></Avatar>
        <Avatar className="size-8"><AvatarImage src="https://github.com/vercel.png" alt="2" /><AvatarFallback>B</AvatarFallback></Avatar>
        <Avatar className="size-8"><AvatarImage src="https://github.com/evilrabbit.png" alt="3" /><AvatarFallback>C</AvatarFallback></Avatar>
      </AvatarGroup>
    </div>
  );
}

export function AvatarGroupCountPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AvatarGroup>
        <Avatar className="size-8"><AvatarImage src="https://github.com/shadcn.png" alt="1" /></Avatar>
        <Avatar className="size-8"><AvatarImage src="https://github.com/vercel.png" alt="2" /></Avatar>
        <AvatarGroupCount>+5</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}

export function AvatarGroupIconPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <AvatarGroup>
        <Avatar className="size-8"><AvatarImage src="https://github.com/shadcn.png" alt="1" /></Avatar>
        <Avatar className="size-8"><AvatarImage src="https://github.com/vercel.png" alt="2" /></Avatar>
        <Avatar className="size-8 border-dashed"><AvatarFallback>+</AvatarFallback></Avatar>
      </AvatarGroup>
    </div>
  );
}

export function AvatarSizesPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-8">
      <Avatar className="size-6"><AvatarFallback className="text-xs">S</AvatarFallback></Avatar>
      <Avatar className="size-10"><AvatarFallback>M</AvatarFallback></Avatar>
      <Avatar className="size-14"><AvatarFallback className="text-lg">L</AvatarFallback></Avatar>
    </div>
  );
}

export function AvatarDropdownPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Avatar className="cursor-pointer ring-2 ring-primary">
        <AvatarImage src="https://github.com/shadcn.png" alt="Dropdown" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function AvatarRtlPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" dir="rtl">
      <AvatarGroup>
        <Avatar className="size-8"><AvatarImage src="https://github.com/shadcn.png" alt="1" /></Avatar>
        <Avatar className="size-8"><AvatarImage src="https://github.com/vercel.png" alt="2" /></Avatar>
        <Avatar className="size-8"><AvatarFallback>٣</AvatarFallback></Avatar>
      </AvatarGroup>
    </div>
  );
}
