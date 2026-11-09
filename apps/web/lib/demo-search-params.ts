"use client";

import { useEffect, useState } from "react";

export function useDemoSearchParams(): URLSearchParams | null {
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);

  return params;
}

export function demoString(
  params: URLSearchParams,
  key: string,
  fallback: string,
): string {
  const value = params.get(key);
  return value === null || value === "" ? fallback : value;
}

export function demoNumber(
  params: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const raw = params.get(key);
  if (raw === null || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function demoBoolean(
  params: URLSearchParams,
  key: string,
  fallback: boolean,
): boolean {
  const raw = params.get(key);
  if (raw === null || raw === "") return fallback;
  return raw === "1" || raw === "true";
}

export function demoEnum<const T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const raw = params.get(key);
  return raw && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback;
}
