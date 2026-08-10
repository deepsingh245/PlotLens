import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

// Runs against the Firestore Emulator using a fake `demo-` project ID —
// no real Firebase project is needed. See docs/plans/plan-1.md Track A
// and docs/SECURITY_TEST_PLAN.md's IDOR matrix.

const PROJECT_ID = "demo-plotlens";

let testEnv: RulesTestEnvironment;

function baseProjectDoc(ownerId: string) {
  return {
    ownerId,
    name: "Agra Ring Road Investigation",
    map: { center: [78.0081, 27.1767], zoom: 12, bearing: 0, pitch: 0 },
    layers: [],
    overlays: [],
    annotations: [],
    savedViews: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("unauthenticated access", () => {
  it("denies reading any project", async () => {
    const ownerId = "owner-a";
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthedDb, "projects/proj-1")));
  });

  it("denies creating a project", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(unauthedDb, "projects/proj-1"), baseProjectDoc("owner-a")));
  });
});

describe("owner access", () => {
  it("allows an owner to create and read their own project", async () => {
    const ownerDb = testEnv.authenticatedContext("owner-a").firestore();
    await assertSucceeds(setDoc(doc(ownerDb, "projects/proj-1"), baseProjectDoc("owner-a")));
    await assertSucceeds(getDoc(doc(ownerDb, "projects/proj-1")));
  });

  it("rejects create with a non-empty layers/overlays/annotations/savedViews array", async () => {
    const ownerDb = testEnv.authenticatedContext("owner-a").firestore();
    const payload = { ...baseProjectDoc("owner-a"), layers: ["not-allowed-yet"] };
    await assertFails(setDoc(doc(ownerDb, "projects/proj-1"), payload));
  });

  it("rejects an update that changes ownerId", async () => {
    const ownerId = "owner-a";
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });

    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    await assertFails(updateDoc(doc(ownerDb, "projects/proj-1"), { ownerId: "owner-b" }));
  });

  it("rejects an update with an out-of-range zoom", async () => {
    const ownerId = "owner-a";
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });

    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    await assertFails(
      updateDoc(doc(ownerDb, "projects/proj-1"), {
        map: { center: [0, 0], zoom: 99, bearing: 0, pitch: 0 },
      }),
    );
  });
});

describe("cross-user IDOR matrix (docs/SECURITY_TEST_PLAN.md)", () => {
  const ownerId = "owner-a";
  const otherId = "owner-b";

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });
  });

  it("denies User B reading User A's project", async () => {
    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    await assertFails(getDoc(doc(otherDb, "projects/proj-1")));
  });

  it("denies User B updating User A's project", async () => {
    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    await assertFails(updateDoc(doc(otherDb, "projects/proj-1"), { name: "Hijacked" }));
  });

  it("denies User B deleting User A's project", async () => {
    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    await assertFails(deleteDoc(doc(otherDb, "projects/proj-1")));
  });

  it("allows User A to delete their own project (hard delete)", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    await assertSucceeds(deleteDoc(doc(ownerDb, "projects/proj-1")));
  });
});
