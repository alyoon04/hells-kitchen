"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function read(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function write(key: string, eventName: string, next: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([...next]));
  window.dispatchEvent(new CustomEvent(eventName));
}

export function useStorageSet(key: string) {
  const eventName = `${key}-changed`;
  const [value, setValue] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  useEffect(() => {
    const initial = read(key);
    ref.current = initial;
    setValue(initial);
    setMounted(true);
    const sync = () => {
      const next = read(key);
      ref.current = next;
      setValue(next);
    };
    window.addEventListener(eventName, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(eventName, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key, eventName]);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(ref.current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      ref.current = next;
      setValue(next);
      write(key, eventName, next);
    },
    [key, eventName],
  );

  const clear = useCallback(() => {
    const next = new Set<string>();
    ref.current = next;
    setValue(next);
    write(key, eventName, next);
  }, [key, eventName]);

  const has = useCallback((id: string) => value.has(id), [value]);

  return { value, has, toggle, clear, mounted };
}
