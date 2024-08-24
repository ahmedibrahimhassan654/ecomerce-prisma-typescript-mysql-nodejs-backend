import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";

import { PORT } from "./secrets";
import rootRouter from "./routes";
import requestLogger from "./middelwares/requestLogger";
import errorHandler from "./exceptions/errorHandler";

const app: Express = express();
const prisma = new PrismaClient({
  log: ["query"],
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(requestLogger);

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});
app.use("/api", rootRouter);
// Use the error handler middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app; // Ensure this is a default export
