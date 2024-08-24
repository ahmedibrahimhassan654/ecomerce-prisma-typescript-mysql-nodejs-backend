import { PrismaClient } from "@prisma/client";
import express, { Express, query, Request, Response } from "express";
import bodyParser from "body-parser";

import { PORT } from "./secrets";
import rootRouter from "./routes";

const app: Express = express();
const prisma = new PrismaClient({
  log: ["query"],
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});
app.use("/api", rootRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
