import prisma from "./utils/prismaClient";
import express, { Express, Request, Response } from "express";

import bodyParser from "body-parser";

import { config } from "./secrets";
import rootRouter from "./routes";
import requestLogger from "./middelwares/requestLogger";
import errorHandler from "./exceptions/errorHandler";

const app: Express = express();
// Log the current environment, database URL, and port
console.log(`Environment: ${config.environment}`);
console.log(`Database URL: ${config.databaseUrl}`);
console.log(`Port: ${config.port}`);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(requestLogger);

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});
app.use("/api", rootRouter);
// Use the error handler middleware
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log("Process terminated");
  });
});

export { app, server }; // Ensure this is a default export
