/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/integration/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "apps/backend/src/**/*.ts",
    "!apps/backend/src/**/*.spec.ts",
    "!apps/backend/src/main.ts",
  ],
  coverageDirectory: "coverage/integration",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/backend/src/$1",
  },
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
};
