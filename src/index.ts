import prisma from "./utils/prismaClient";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { config } from "./secrets";
import rootRouter from "./routes";
import requestLogger from "./middelwares/requestLogger";
import errorHandler from "./exceptions/errorHandler";

const app: Express = express();

console.log(`Environment: ${config.environment}`);
console.log(`Database URL: ${config.databaseUrl}`);
console.log(`Port: ${config.port}`);

app.use(bodyParser.json());
app.use(requestLogger);

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});

app.use("/api", rootRouter);
app.use(errorHandler);

if (require.main === module) {
  const server = app.listen(config.port || 8001, () => {
    console.log(`Server is running on port ${config.port || 8001}`);
  });
}

export { app }; // Ensure server is exported
