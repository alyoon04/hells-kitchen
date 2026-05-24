"use client";

import { useStorageSet } from "./use-storage-set";

const KEY = "recipe-favorites";

export function useFavorites() {
  const { value, has, toggle, mounted } = useStorageSet(KEY);
  return {
    favorites: value,
    isFavorite: has,
    toggle,
    mounted,
  };
}
