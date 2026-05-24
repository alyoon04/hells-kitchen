"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { SortKey } from "@/lib/api";
import type { Difficulty, Ingredient } from "@/lib/types";

const DIETS = ["vegan", "vegetarian", "gluten-free", "keto", "high-protein"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const SORTS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "title", label: "Title" },
  { value: "prepTime", label: "Prep time" },
  { value: "cookTime", label: "Cook time" },
  { value: "difficulty", label: "Difficulty" },
  { value: "dateAdded", label: "Date added" },
];

function getSet(sp: URLSearchParams, key: string): Set<string> {
  return new Set(sp.get(key)?.split(",").filter(Boolean) ?? []);
}

export function FilterBar({
  tags,
  ingredients,
}: {
  tags: string[];
  ingredients: Ingredient[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const isFirstRender = useRef(true);

  const selectedTags = getSet(sp, "tags");
  const selectedIngredients = getSet(sp, "ingredients");
  const selectedDiets = getSet(sp, "diet");
  const difficulty = sp.get("difficulty") ?? "";
  const sort = sp.get("sort") ?? "title";
  const order = sp.get("order") ?? "asc";

  const hasActiveFilters =
    q ||
    selectedTags.size > 0 ||
    selectedIngredients.size > 0 ||
    selectedDiets.size > 0 ||
    difficulty;

  function update(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(sp.toString());
    mutate(params);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      update((p) => {
        if (q) p.set("q", q);
        else p.delete("q");
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function toggleInSet(param: string, value: string) {
    update((p) => {
      const set = getSet(p, param);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      if (set.size > 0) p.set(param, [...set].join(","));
      else p.delete(param);
    });
  }

  function setSingle(param: string, value: string) {
    update((p) => {
      if (value) p.set(param, value);
      else p.delete(param);
    });
  }

  function clearAll() {
    setQ("");
    isFirstRender.current = true;
    startTransition(() => router.replace(pathname));
  }

  return (
    <div className="space-y-4 mb-6 rounded-2xl border border-border/40 p-4 bg-card shadow-md">
      <div className="grid gap-3 sm:grid-cols-4">
        <input
          className="border rounded-md px-3 py-2 text-sm bg-background sm:col-span-2"
          placeholder="Search recipes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={difficulty}
          onChange={(e) => setSingle("difficulty", e.target.value)}
        >
          <option value="">Any difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
            value={sort}
            onChange={(e) => setSingle("sort", e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="border rounded-md px-3 py-2 text-sm bg-background w-10"
            onClick={() =>
              setSingle("order", order === "asc" ? "desc" : "asc")
            }
            title={order === "asc" ? "Ascending" : "Descending"}
          >
            {order === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1.5 text-muted-foreground">
          Diet
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DIETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleInSet("diet", d)}
            >
              <Badge variant={selectedDiets.has(d) ? "default" : "outline"}>
                {d}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium mb-1.5 text-muted-foreground">
          Tags
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleInSet("tags", t)}
            >
              <Badge variant={selectedTags.has(t) ? "default" : "outline"}>
                {t}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <details>
        <summary className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
          Ingredients
          {selectedIngredients.size > 0 && ` (${selectedIngredients.size})`}
        </summary>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ingredients.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => toggleInSet("ingredients", i.id)}
            >
              <Badge
                variant={
                  selectedIngredients.has(i.id) ? "default" : "outline"
                }
              >
                {i.name}
              </Badge>
            </button>
          ))}
        </div>
      </details>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs underline text-muted-foreground hover:text-foreground"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
