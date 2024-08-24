import { PrismaClient } from "@prisma/client";
import { config } from "../secrets";

const prisma = new PrismaClient({
  log: ["query"],
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});
export default prisma;
