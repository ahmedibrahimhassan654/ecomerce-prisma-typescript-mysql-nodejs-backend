import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  // Specifies the files that Jest will run before each test suite
  setupFiles: ["<rootDir>/src/jest.setup.ts"],
  // Specifies the files that Jest will run after each test suite is setup
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
  // Specifies the test environment that Jest will use
  testEnvironment: "node",
  // Specifies the preset to use for TypeScript
  preset: "ts-jest",
  // Specifies the pattern Jest uses to find test files
  testMatch: ["**/__tests__/**/*.ts"],
  // Ignores specified patterns while looking for test files
  testPathIgnorePatterns: ["/node_modules/", "/.history/"],
  // Specifies the global timeout for tests
  testTimeout: 30000, // Increase global timeout to 30 seconds
  // Optional: Code coverage configuration
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageProvider: "v8",
  verbose: true,
};

export default config;
