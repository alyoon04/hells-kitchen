import express, { Request, Response } from "express";
import cors from "cors";
import { searchRecipes } from "./services/recipes.js";
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
