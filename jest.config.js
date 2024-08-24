module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.history/"],
};
