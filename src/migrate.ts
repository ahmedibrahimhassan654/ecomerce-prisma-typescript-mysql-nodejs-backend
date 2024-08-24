import dotenv from "dotenv";
import { execSync } from "child_process";

// Load environment variables from the .env.test file
dotenv.config({ path: ".env.test" });

// Run Prisma migration
execSync("npx prisma migrate reset --force", { stdio: "inherit" });
