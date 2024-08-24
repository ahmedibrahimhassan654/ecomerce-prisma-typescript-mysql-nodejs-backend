import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import { PORT } from "./secrets";
import rootRouter from "./routes";

const app: Express = express();
const prisma = new PrismaClient();

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});
app.use("/api", rootRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
