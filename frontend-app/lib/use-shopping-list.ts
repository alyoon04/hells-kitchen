"use client";

import { useStorageSet } from "./use-storage-set";

const KEY = "recipe-shopping-list";

export function useShoppingList() {
  const { value, has, toggle, clear, mounted } = useStorageSet(KEY);
  return {
    selected: value,
    isSelected: has,
    toggle,
    clear,
    mounted,
  };
}
