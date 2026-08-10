import { defineConfig } from "vitest/config";
import path from "node:path";

// Separate from vitest.config.ts (unit tests) because these require the
// Firestore Emulator running — see package.json's "test:rules" script,
// which starts the emulator via `firebase emulators:exec` before running this.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
