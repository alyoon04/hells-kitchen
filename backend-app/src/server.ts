import express, { Request, Response } from "express";
import cors from "cors";
import { repository } from "./db/repository.js";
import { BadRequestError } from "./errors.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { validateQuery } from "./middleware/validate.js";
import { getRecipeDetail, searchRecipes } from "./services/recipes.js";
import { suggestRecipes } from "./services/suggest.js";
import {
  RecipeQuerySchema,
  SuggestRequestSchema,
  type RecipeQuery,
} from "./types/schemas.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

app.get(
  "/api/recipes",
  validateQuery(RecipeQuerySchema),
  (_req: Request, res: Response) => {
    const query = res.locals.query as RecipeQuery;
    res.json(searchRecipes(query));
  },
);

app.get("/api/ingredients", (_req: Request, res: Response) => {
  res.json(repository.getAllIngredients());
});

app.get("/api/tags", (_req: Request, res: Response) => {
  res.json(repository.getAllTags());
});

app.get("/api/recipes/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    throw new BadRequestError("id is required");
  }
  res.json(getRecipeDetail(id));
});

app.post(
  "/api/suggest",
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = SuggestRequestSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const result = await suggestRecipes(parsed.data);
    res.json(result);
  }),
);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
