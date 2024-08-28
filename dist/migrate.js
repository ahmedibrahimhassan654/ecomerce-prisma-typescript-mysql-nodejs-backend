"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const child_process_1 = require("child_process");
// Load environment variables from the .env.test file
dotenv_1.default.config({ path: ".env.test" });
// Run Prisma migration
(0, child_process_1.execSync)("npx prisma migrate reset --force", { stdio: "inherit" });
