import express, { Request, Response } from "express";
import cors from "cors";
import { repository } from "./db/repository.js";
import {
  NotFoundError,
  getRecipeDetail,
  searchRecipes,
} from "./services/recipes.js";
import { RecipeQuerySchema } from "./types/schemas.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

app.get("/api/recipes", (req: Request, res: Response) => {
  const parsed = RecipeQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "INVALID_QUERY",
        message: "Invalid query parameters",
        details: parsed.error.format(),
      },
    });
    return;
  }
  res.json(searchRecipes(parsed.data));
});

app.get("/api/ingredients", (_req: Request, res: Response) => {
  res.json(repository.getAllIngredients());
});

app.get("/api/tags", (_req: Request, res: Response) => {
  res.json(repository.getAllTags());
});

app.get("/api/recipes/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || id.length === 0) {
    res
      .status(400)
      .json({ error: { code: "INVALID_ID", message: "id is required" } });
    return;
  }
  try {
    res.json(getRecipeDetail(id));
  } catch (err) {
    if (err instanceof NotFoundError) {
      res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: err.message } });
      return;
    }
    console.error(err);
    res
      .status(500)
      .json({ error: { code: "INTERNAL", message: "Internal server error" } });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
