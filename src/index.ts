import express, { Express, Request, Response } from "express";

const app: Express = express();

app.get("/", async (req: Request, res: Response) => {
  res.send("working ");
});

app.listen(3000, () => {
  console.log("app listining ");
});
