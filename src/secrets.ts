import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: `.env.${env}` });

export const config = {
  environment: env,
  databaseUrl: process.env.DATABASE_URL!,
  port: process.env.PORT || 3000,
};

export const JWT_SECRET = process.env.JWT_SECRET!;
