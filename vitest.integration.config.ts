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
    // All integration files share one Firestore/Storage Emulator instance and
    // project ID. Running files in parallel lets one file's clearFirestore()
    // wipe data another file just seeded (observed: storage-rules.test.ts's
    // seeded project doc disappearing mid-run because of a concurrent
    // firestore-rules.test.ts beforeEach) — so these must run sequentially.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
