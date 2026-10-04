import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // Integration suites share one database and reset it between tests,
    // so test files must run sequentially (Jest's --runInBand equivalent).
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
    },
    testTimeout: 10_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/generated/**", "src/server.ts", "src/types/**"],
    },
  },
});
