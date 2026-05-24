import express, { Request, Response } from "express";
import cors from "cors";
import { repository } from "./db/repository.js";
import { RecipeSummarySchema } from "./types/schemas.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

app.get("/api/recipes", (_req: Request, res: Response) => {
  const summaries = repository
    .getAllRecipes()
    .map((r) => RecipeSummarySchema.parse(r));
  res.json(summaries);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
