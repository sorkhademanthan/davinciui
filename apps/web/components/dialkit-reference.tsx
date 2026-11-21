"use client";

import { useDialKit } from "dialkit";

export function DialkitCard() {
  const values = useDialKit("Card", {
    radius: [24, 0, 64],
    color: "#a78bfa",
  });

  return (
    <div
      className="flex items-center justify-center rounded-2xl border border-border bg-background px-10 py-8 text-lg font-medium shadow-sm"
      style={{ borderRadius: values.radius, background: values.color }}
    >
      Card
    </div>
  );
}
