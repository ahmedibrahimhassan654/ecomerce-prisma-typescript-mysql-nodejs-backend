import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  setupFiles: ["<rootDir>/src/jest.setup.ts"],
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.history/"],
  testTimeout: 30000, // Increase global timeout to 30 seconds
};

export default config;
