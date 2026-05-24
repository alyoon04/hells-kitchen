import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

const getData = async (): Promise<{ recipes: unknown[] }> => {
  const data = await fs.readFile(path.join(__dirname, '../db/data.json'), 'utf8');
  return JSON.parse(data);
};

app.get('/api/recipes', async (_req: Request, res: Response) => {
  try {
    const data = await getData();
    res.json(data.recipes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
