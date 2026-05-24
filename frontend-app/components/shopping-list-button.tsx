"use client";

import { useShoppingList } from "@/lib/use-shopping-list";
import { cn } from "@/lib/utils";

interface Props {
  recipeId: string;
  size?: "sm" | "md";
  className?: string;
}

export function ShoppingListButton({ recipeId, size = "md", className }: Props) {
  const { isSelected, toggle, mounted } = useShoppingList();
  const active = mounted && isSelected(recipeId);
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
      aria-label={active ? "Remove from shopping list" : "Add to shopping list"}
      title={active ? "Remove from shopping list" : "Add to shopping list"}
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
        className={cn(active ? "text-emerald-600" : "text-muted-foreground")}
      >
        <path d="M3 3h2l2.4 12.5a2 2 0 0 0 2 1.5h9.6a2 2 0 0 0 2-1.6L23 6H6" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
    </button>
  );
}
