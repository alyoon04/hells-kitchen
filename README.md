# Recipe Manager - Full Stack Take-Home Exercise

## Overview
Create a recipe management application that allows users to view, search, and organize recipes. This exercise tests your ability to build a full-stack web application with a focus on data relationships and user experience.

## Tips
- Use whatever frameworks/tools you're most comfortable with
- Focus on creating a working MVP before adding advanced features
- Be sure to document any assumptions or known limitations
- Test your application with different scenarios

## Setup Instructions

#### Backend setup
```
cd backend-app
cp .env.example .env       # then paste your ANTHROPIC_API_KEY into .env
npm install
npm run dev                # starts express server on port 8080
```

#### Frontend setup
```
cd frontend-app
cp .env.example .env       # default NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev                # starts next.js frontend on port 3000
```

#### Database setup
```
The application uses a JSON file (`backend-app/db/data.json`) as a mock database.
It's loaded once into memory at boot and validated with Zod.
```

**Note: Feel free to use whatever frontend or backend framework you want. The sample contains a Next.js + Express server scaffold, but use whatever you're comfortable with.**

## Requirements

#### Core Features (Required)
- Display a list of recipes with their basic information (`/recipes`)
- Implement recipe detail page (`/recipes/:id`) showing:
  - Ingredients with quantities
  - Cooking instructions
  - Tags
  - Nutritional information (calculated from ingredients)
- Add search/filter functionality on (`/recipes`) by:
  - Recipe name
  - Tags
  - Ingredients

#### Example Advanced Features (Bonus Points. Feel free to implement any of these or add your own. Some examples below)
- Implement dietary restriction filters (e.g., vegetarian, vegan, gluten-free)
- Create a calorie calculator based on serving size
- Add recipe scaling functionality (e.g., adjust ingredients for different serving sizes)
- Implement recipe favoriting/saving
- Add sorting options (prep time, difficulty, etc.)
- Add a "shopping list" generator for selected recipes
- Incorporate an LLM feature
- Types

## Evaluation Criteria
- Code organization and clarity
- UI/UX design and responsiveness
- API design and implementation
- Error handling and edge cases
- Performance considerations
- TypeScript/JavaScript best practices 

## Submission
1. Update this README with a new section below called `Candidate Notes:
   - Setup instructions if you've added any requirements
   - Brief explanation of your implementation choices
   - List of completed features
   - Any assumptions made
   - Known limitations or bugs
   - Additional features you'd add with more time
 

2. Send us (via email to scott.nguyen@sprx.tax & anthony.difalco@sprx.tax):
   - A zip file of the entire project (frontend and backend)
   - A link to a deployed version of the application (bonus points)


Good luck! We're excited to see your implementation.

---

## Candidate Notes

### Setup additions
- Both apps need a `.env` file (copy from `.env.example`).
- The LLM "Cook from pantry" feature requires `ANTHROPIC_API_KEY` in `backend-app/.env`. Without it, the rest of the app works normally — the suggest endpoint returns a clean `BAD_REQUEST` explaining the key is missing.
- Folder names are `backend-app/` and `frontend-app/` (the scaffold's git history shows a deliberate rename — kept as-is rather than re-rename).

### Stack
- **Backend**: Express + TypeScript (strict, `noUncheckedIndexedAccess`), `tsx` for dev, Zod for validation, `dotenv` for env loading, `@anthropic-ai/sdk` for the LLM feature.
- **Frontend**: Next.js 15 (App Router) + TypeScript, Tailwind 3 + shadcn/ui primitives (`Card`, `Badge`), Zod for response validation.
- **Data**: JSON file loaded once into memory at boot.

### Implementation choices
- **Two apps, not one Next.js fullstack.** The scaffold separates backend and frontend deliberately; "API design" is an explicit eval criterion, so I kept it as a discrete artifact rather than collapsing to Next.js API routes.
- **Server components for list and detail pages.** Filter bar writes to the URL (`?tags=italian&diet=vegan`), and the server component re-renders with the new `searchParams`. Filters are shareable, SSR-friendly, back-button-friendly, and need no client cache.
- **Filters happen server-side** (could be client at this scale, but it demonstrates the API).
- **Zod schemas defined in backend, copied into frontend** (`lib/types.ts`). A shared package or npm workspaces would have been overkill for a take-home.
- **Recipe scaling is client-local.** No round-trip per slider click; pure math on a small client island.
- **Nutrition computation lives in the API** (`/api/recipes/:id`), so the wire payload includes a ready-to-render `nutrition.total` and `nutrition.perServing`.
- **Centralized error handling** via `errors.ts` + `middleware/errorHandler.ts`. All non-2xx responses share the envelope `{ error: { code, message, details? } }`.
- **LLM uses Claude Haiku 4.5** with a strict JSON system prompt. Output is validated against a Zod schema, then `recipeId`s are hydrated to `RecipeSummary` server-side before the response goes out.

### Completed features
- ✅ `/recipes` list with all recipes, search by name, filter by tags / ingredients / diet / difficulty, sort by title / prepTime / cookTime / difficulty / dateAdded (asc/desc).
- ✅ `/recipes/:id` detail with hydrated ingredients (name + amount + unit), instructions, tags, nutrition per serving + total.
- ✅ Dietary restriction filter (vegan, vegetarian, gluten-free, keto, high-protein).
- ✅ Nutrition calculator (per-serving + total), driven from ingredient lookup.
- ✅ Recipe scaling (servings slider on detail page — scales ingredient amounts + nutrition total in real time, including fractional amounts like `1/3`).
- ✅ Sorting options.
- ✅ LLM "Cook from pantry" — pick ingredients you have, Claude ranks recipes with reasoning.
- ✅ TypeScript throughout (strict mode), Zod-validated request/response shapes.
- ✅ Loading skeletons, error boundaries, empty states, root + route-scoped 404s.
- ✅ Responsive layout (cards stack on mobile, detail grid collapses, scaling controls wrap).
- ✅ Vitest test suite (29 tests) covering `searchRecipes`, `getRecipeDetail`, and `scaleAmount` — run with `npm test` in either app.

### Assumptions
- **Nutrition portion**: `data.json` doesn't specify a portion unit on nutrition values. We sum nutrition across the recipe's ingredients (1 entry per ingredient), then divide by `servings` for per-serving. We don't multiply by `amount` because units are heterogeneous (cups / leaves / tbsp / oz).
- **Missing ingredient lookups**: 8 ingredient IDs are referenced by recipes but not defined in the lookup table (`basil`, `butter`, `brown_sugar`, `white_sugar`, `broccoli`, `carrot`, `soy_sauce`, `ginger`). They render with a humanized name + zero nutrition, so the recipe still shows but per-serving totals are slightly understated. A boot warning lists them.
- **Multi-select semantics**: tags / ingredients / diet filters use AND (recipe must match ALL selected values).
- **Diet=vegan** means EVERY ingredient in the recipe lists "vegan" in its `dietary` array. Recipes with a missing-lookup ingredient (zero dietary metadata) won't pass this filter.

### Known limitations
- **CORS is permissive** (`cors()` with defaults). Fine for the demo; would lock down to the deployed frontend origin in production.
- **Ingredient filter chips on `/recipes` don't show the 8 missing-from-lookup ingredients** (can still filter via URL param if you know the id).
- **Non-numeric ingredient amounts** (e.g., "pinch") would scale as `pinch ×1.5`. None in the current dataset, but the fallback is documented in `lib/scaling.ts`.
- **No favorites / shopping list** — deliberately out of scope this round.
- **No images** in the dataset; cards have no image. Placeholders would be a quick add.

### With more time
- Favorites in localStorage + `/favorites` view.
- Shopping list across selected recipes (group by ingredient id + unit; mismatched units listed separately).
- Recipe images (Unsplash by tag).
- LLM: streaming response, "find more like this" on a recipe page.
- Tighten CORS to the deployed frontend origin only.
- Real DB if the dataset grew (Postgres + Drizzle).

### Deploy
- **Frontend (Vercel)**: import the repo, set root directory to `frontend-app`, add env var `NEXT_PUBLIC_API_URL` pointing to the deployed backend. Build command and output are auto-detected.
- **Backend (Railway / Render)**: import the repo, set root directory to `backend-app`. Build: `npm run build`. Start: `npm start`. Env vars: `ANTHROPIC_API_KEY`, `PORT` (Railway provides this automatically).
