"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/jest.setup.ts
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from the .env.test file
dotenv_1.default.config({ path: ".env.test" });
