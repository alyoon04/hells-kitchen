"use client";

import { useFavorites } from "@/lib/use-favorites";
import { cn } from "@/lib/utils";

interface Props {
  recipeId: string;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ recipeId, size = "md", className }: Props) {
  const { isFavorite, toggle, mounted } = useFavorites();
  const active = mounted && isFavorite(recipeId);
  const dimensions = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(recipeId);
      }}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      title={active ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "inline-flex items-center justify-center rounded-md border bg-background transition hover:bg-secondary",
        dimensions,
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(active ? "text-red-500" : "text-muted-foreground")}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
