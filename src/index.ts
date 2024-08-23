import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";

const app: Express = express();
const prisma = new PrismaClient();

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
