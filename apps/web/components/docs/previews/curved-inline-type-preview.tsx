"use client";

export function CurvedInlineTypePreview() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden bg-[#0b0b0e]">
      <iframe
        src="/demo/curved-inline-type"
        title="Curved Inline Type demo"
        loading="lazy"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
