"use client";

import * as React from "react";

const SHAPES = Array.from({ length: 7 }, (_, index) => index);

export function GeometricPreloaderCardPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#111111]">
      <div className="relative size-[min(42cqw,12rem)]">
        {SHAPES.map((index) => {
          const size = 100 - index * 11;
          return (
            <span
              key={index}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 border"
              style={{
                width: `${size}%`,
                borderColor: index === 0 ? "#ff4d23" : "#f5f1e855",
                transform: `translate(-50%, -50%) rotate(${index % 2 ? -45 : 45}deg)`,
                animation: `geometric-card-spin ${2.2 + index * 0.15}s linear infinite`,
                animationDelay: `${index * -0.15}s`,
              }}
            />
          );
        })}
        <span className="absolute inset-0 flex items-center justify-center text-[clamp(.65rem,2cqw,1rem)] font-medium tracking-[.18em] text-[#ff4d23]">
          72%
        </span>
      </div>
      <style>{`@keyframes geometric-card-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }`}</style>
    </div>
  );
}
