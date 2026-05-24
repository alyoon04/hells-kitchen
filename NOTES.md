# Implementation Notes

A running log of notable decisions and changes. Source of truth for context across sessions.

## Stack

- **Backend**: Express + TypeScript (strict, NodeNext), tsx for dev, Zod for validation. Port 8080.
- **Frontend**: Next.js 15 (App Router) + TypeScript, Tailwind + shadcn/ui. Port 3000.
- **Data**: JSON file at `backend-app/db/data.json` loaded once into memory at boot.
- **LLM**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) for the "what can I cook" feature.
- **Deploy**: Vercel (frontend), Railway (backend).

## Architecture decisions

- **Two apps, not one Next.js fullstack**: scaffold separates `backend-app/` and `frontend-app/` deliberately — the assignment is partly a test of REST API design as a discrete artifact. Keeping them separate.
- **No TanStack Query**: list/detail are server components reading `searchParams`. Filter bar writes to URL → server re-renders. No client-side fetching needed for the main flow.
- **No database**: 15 read-only recipes fit trivially in memory. Favorites/shopping list live in localStorage (per-user state).
- **Zod schemas**: defined in backend, mirrored (copy) in frontend `lib/types.ts`. npm workspaces would be overkill.

## Open assumptions to document in Candidate Notes

- **Nutrition interpretation**: data.json has no portion unit on nutrition values. We sum nutrition across listed ingredients, then divide by `servings` for per-serving. Document explicitly in README.
- **Shopping list units**: ingredients have heterogeneous units (cups, leaves, tbsp). When aggregating across recipes, group by ingredient id + unit; mismatched units listed separately.
- **Missing ingredient lookups in data.json**: 8 ingredient IDs are referenced by recipes but not defined in the lookup table (basil, butter, brown_sugar, white_sugar, broccoli, carrot, soy_sauce, ginger). We render them with placeholder data (humanized name from the id, "unknown" category, zero nutrition) and skip them in nutrition totals. Boot logs a warning listing missing IDs.

## Implementation log

### Commit: search + filter bar
- `components/filter-bar.tsx` — client component, single source of truth: the URL.
  - Text search (debounced 300ms, `useEffect` + setTimeout, skipped on initial render via `isFirstRender` ref).
  - Difficulty: native `<select>` (single).
  - Sort + order: `<select>` + `↑/↓` toggle button.
  - Diet, tags, ingredients: clickable `Badge` pills, multi-select (AND semantics on backend). Ingredients collapsed inside `<details>` with selection count (46 items would be too noisy expanded by default).
  - "Clear all filters" link appears only when any filter is active.
- State flow: badge click → `update()` mutates a fresh `URLSearchParams` → `router.replace(?qs)` inside `startTransition` → server component re-runs with new `searchParams` → fetches filtered recipes → streams in new HTML. Filter bar stays mounted; pill selected-state re-derives from `useSearchParams()`.
- `page.tsx` now fetches `[recipes, tags, ingredients]` in parallel via `Promise.all` and passes the latter two to `FilterBar`.
- Verified: filter bar renders all controls, `?tags=italian` returns 4, `?diet=vegan&difficulty=medium` returns 1.

### Commit: /recipes list page (server component)
- `app/recipes/page.tsx` — server component, reads `searchParams` (Promise in Next 15), calls `getRecipes(query)`. Parses query string params back into typed `RecipeQuery` (split comma lists, narrow `difficulty`/`sort`/`order` enums).
- `components/recipe-card.tsx` — title, description, difficulty pill (colored by easy/medium/hard), prep/cook/servings line, tag badges. Whole card is a `<Link>` to `/recipes/[id]`.
- `components/ui/card.tsx` + `components/ui/badge.tsx` — shadcn primitives written inline (avoids the interactive shadcn CLI prompt).
- `lib/format.ts` — `difficultyStyles` map for the pill colors.
- `app/recipes/loading.tsx` — pulsing skeleton grid for Suspense fallback.
- `app/recipes/error.tsx` — client error boundary with `reset()` button.
- Empty state: dashed border card "No recipes match your filters."
- Result count rendered in the header ("15 recipes").
- Verified end-to-end against both servers running: root redirects to `/recipes`, list renders all 15 alphabetized, `?q=pasta` narrows to 3, `?q=nothingmatches` shows empty state.

### Commit: frontend typed API client
- `lib/api.ts` exposes:
  - `getRecipes(query?)`: list with optional `q`, `tags`, `ingredients`, `diet`, `difficulty`, `sort`, `order`. Query encoded as comma-separated values.
  - `getRecipe(id)`: detail.
  - `getIngredients()`: full lookup table.
  - `getTags()`: sorted unique tag list.
- All responses Zod-validated client-side against the schemas in `lib/types.ts` (defensive against backend drift).
- `ApiError(status, code, message)` thrown on non-2xx; parses backend's `{ error: { code, message } }` envelope.
- Uses `cache: "no-store"` so dev edits show up immediately. Can revisit for prod caching strategy later.
- Single env var: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`) — works in both server and client components. Dropped the redundant private `API_URL`.

### Commit: backend error middleware + centralized validation
- New `src/errors.ts` defines the error hierarchy:
  - `HttpError` (base; carries `status`, `code`, `message`).
  - `NotFoundError` (404, `NOT_FOUND`).
  - `BadRequestError` (400, `BAD_REQUEST`, optional `details`).
- New `src/middleware/errorHandler.ts`:
  - `notFoundHandler` — catches unmatched routes with `{ code: "NOT_FOUND", message: "Route not found: METHOD /path" }`.
  - `errorHandler` — handles ZodError (400 VALIDATION_ERROR with `.format()` details), HttpError (uses subclass status/code/message), default (500 INTERNAL + console.error).
- New `src/middleware/validate.ts`:
  - `validateQuery(schema)` parses `req.query`, stores typed result on `res.locals.query`, forwards ZodError to next() on failure.
- `services/recipes.ts` now imports `NotFoundError` from `errors.ts` (was locally defined).
- Refactored `server.ts`: handlers are thin — no inline try/catch, no inline 400/404. Express 4 catches sync throws and routes them to `errorHandler`.
- Response envelope is now consistent across all error paths: `{ error: { code, message, details? } }`.
- Verified: list, detail, invalid query (400), missing recipe (404), bogus route (404) — all return the envelope correctly.

### Commit: GET /api/ingredients and /api/tags
- `GET /api/ingredients` → returns the full ingredient lookup array (46 items). Frontend filter UI uses `id` + `name`.
- `GET /api/tags` → returns the sorted, deduped tag list derived from all recipes (22 tags).
- Both endpoints back the filter dropdowns / multi-selects on `/recipes`.

### Commit: GET /api/recipes/:id with hydrated ingredients + nutrition
- Added `getRecipeDetail(id)` to `services/recipes.ts`:
  - Hydrates each `RecipeIngredient` by merging with the ingredient lookup → `HydratedIngredient` (id, name, category, amount, unit, allergens, dietary, nutrition).
  - Missing lookup → placeholder (humanized name from id, "unknown" category, zero nutrition, empty arrays). Recipe still renders.
  - `nutrition.total`: sum of all ingredient nutrition values.
  - `nutrition.perServing`: total ÷ recipe.servings.
  - Both rounded to 1 decimal place.
  - Throws `NotFoundError` if recipe id is missing.
- Repository now logs a boot warning listing any ingredient IDs referenced by recipes but missing from the lookup (currently 8: basil, butter, brown_sugar, white_sugar, broccoli, carrot, soy_sauce, ginger).
- Server route `GET /api/recipes/:id` returns `RecipeDetail` or `404 { error: { code: "NOT_FOUND" } }`. Inline error handling for now — will centralize in commit 8.
- Verified: Margherita Pizza returns 5 ingredients including placeholder "Basil"; 220 kcal/serving × 4 servings = 880 total (math checks); `/api/recipes/999` → 404.

### Commit: GET /api/recipes with search + filter + sort
- New `src/services/recipes.ts` with `searchRecipes(query)`:
  - `q`: case-insensitive substring match on `title + description`.
  - `tags`: AND semantics — recipe must include ALL specified tags.
  - `ingredients`: AND semantics — recipe must include ALL specified ingredient IDs.
  - `diet`: strict — every ingredient in the recipe must have the diet flag in its `dietary` array (so a recipe is "vegan" iff every ingredient is marked vegan). AND semantics across multiple diet flags.
  - `difficulty`: exact match.
  - `sort`: `title | prepTime | cookTime | difficulty | dateAdded`. PrepTime/cookTime parsed via `parseInt`. Difficulty uses custom order (easy < medium < hard).
  - `order`: asc | desc (default asc).
- Filter accepts query params in single (`tags=italian`), comma (`tags=italian,pasta`), or repeated-param (`tags=italian&tags=pasta`) form thanks to the `RecipeQuerySchema` transform.
- Server wires `RecipeQuerySchema.safeParse(req.query)`; on validation failure returns `400 { error: { code: 'INVALID_QUERY', message, details } }`. Centralized middleware comes in commit 8.
- Verified against all required filters + an invalid difficulty (returns 400).

### Commit: backend in-memory repository
- `backend-app/src/db/repository.ts`:
  - Loads `data.json` once at boot via `fs.readFileSync`.
  - Validates with `DataFileSchema.safeParse` — throws with logged details on failure (fail-fast).
  - Builds `recipeMap` and `ingredientMap` for O(1) id lookups; derives sorted unique `tags`.
  - Exposes: `getAllRecipes`, `getRecipeById`, `getAllIngredients`, `getIngredient`, `getAllTags`.
- Refactored `server.ts` to use the repository instead of per-request `fs.readFile`. `/api/recipes` now returns `RecipeSummary[]` (drops `ingredients` + `instructions` from list payload — smaller wire size, leaner UI contract).
- Local imports use `.js` extensions for NodeNext module resolution compatibility.
- Verified: typecheck clean; `GET /api/recipes` returns 15 summary objects with `[id, title, description, servings, prepTime, cookTime, difficulty, tags, dateAdded]`.

### Commit: add zod schemas (shared types)
- Installed `zod` in both backend and frontend.
- `backend-app/src/types/schemas.ts`:
  - `DifficultySchema` (enum: easy/medium/hard).
  - `NutritionSchema` (calories, protein, carbs, fat).
  - `IngredientSchema` (lookup item: id, name, category, nutrition, allergens, dietary).
  - `RecipeIngredientSchema` (embedded in recipe: ingredientId, amount, unit).
  - `RecipeSchema` (raw recipe from data.json).
  - `RecipeSummarySchema` (omits ingredients + instructions; used by list endpoint).
  - `HydratedIngredientSchema` (merged lookup + embedded amount/unit).
  - `RecipeDetailSchema` (recipe + hydrated ingredients + computed nutrition.total + nutrition.perServing).
  - `DataFileSchema` (top-level shape for data.json validation at boot).
  - `RecipeQuerySchema` (validates list endpoint query params — handles single/array/comma-separated forms for tags/ingredients/diet).
- `frontend-app/lib/types.ts` mirrors the public-facing schemas the UI uses: `RecipeSummary`, `RecipeDetail`, `HydratedIngredient`, `Ingredient`, `Nutrition`, `Difficulty`.
- Verified: typecheck clean on both apps.

### Commit: migrate frontend to typescript + tailwind + shadcn
- Installed `typescript`, `@types/{react,react-dom,node}`, `tailwindcss@3`, `postcss`, `autoprefixer`, `tailwindcss-animate`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`.
- Added `tsconfig.json` (strict, noUncheckedIndexedAccess, `@/*` paths).
- Added `tailwind.config.ts` + `postcss.config.mjs` with shadcn theme (zinc base, new-york style).
- Replaced `globals.css` with Tailwind directives + shadcn CSS variables (light/dark).
- Renamed `app/{page,layout}.js` → `.tsx`. `page.tsx` redirects to `/recipes`. Deleted `page.module.css`, `jsconfig.json`.
- Added `lib/utils.ts` with `cn()` helper.
- Added `components.json` for shadcn CLI (so `npx shadcn add ...` works).
- Added `types.d.ts` declaring `*.css` for strict TS to accept side-effect css imports.
- Added `.env.example` (NEXT_PUBLIC_API_URL, API_URL).
- Updated `.gitignore` to allow `.env.example` through.
- Verified: `npx next build` succeeds.

### Commit: migrate backend to typescript
- Installed `typescript`, `tsx`, `@types/express`, `@types/cors`, `@types/node`.
- Removed `nodemon`.
- Added `tsconfig.json` with strict + noUncheckedIndexedAccess + NodeNext.
- Renamed `src/server.js` → `src/server.ts`, added explicit types.
- Updated `package.json` scripts: `dev: tsx watch src/server.ts`, `build: tsc`, `typecheck: tsc --noEmit`.
- Added `.env.example` (PORT, ANTHROPIC_API_KEY).
- Updated `.gitignore` to allow `.env.example` through `!.env.example`.
- Verified: `npm run dev` serves `GET /api/recipes` correctly.
