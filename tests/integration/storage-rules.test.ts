import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, setDoc } from "firebase/firestore";
import { deleteObject, getBytes, ref, uploadBytes } from "firebase/storage";

// Runs against the Firestore + Storage Emulators using a fake `demo-` project
// ID — no real Firebase project needed. storage.rules' ownership check calls
// firestore.get() cross-service, so both emulators must be configured in the
// same test environment for it to resolve. See docs/plans/plan-3.md Task 7.

const PROJECT_ID = "demo-plotlens";
const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

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
    storage: {
      rules: readFileSync("storage.rules", "utf8"),
      host: "127.0.0.1",
      port: 9199,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("overlay image uploads", () => {
  const ownerId = "owner-a";
  const otherId = "owner-b";
  const path = "projects/proj-1/overlays/overlay-1/image.jpg";

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });
  });

  it("denies unauthenticated read/write", async () => {
    const unauthedStorage = testEnv.unauthenticatedContext().storage();
    await assertFails(
      uploadBytes(ref(unauthedStorage, path), JPEG_BYTES, { contentType: "image/jpeg" }),
    );
  });

  it("allows the project owner to upload, read, and delete an image", async () => {
    const ownerStorage = testEnv.authenticatedContext(ownerId).storage();
    const imageRef = ref(ownerStorage, path);

    await assertSucceeds(uploadBytes(imageRef, JPEG_BYTES, { contentType: "image/jpeg" }));
    await assertSucceeds(getBytes(imageRef));
    await assertSucceeds(deleteObject(imageRef));
  });

  it("rejects an upload with a disallowed content type", async () => {
    const ownerStorage = testEnv.authenticatedContext(ownerId).storage();
    await assertFails(
      uploadBytes(ref(ownerStorage, path), JPEG_BYTES, { contentType: "application/pdf" }),
    );
  });

  it("rejects an upload over the size cap", async () => {
    const ownerStorage = testEnv.authenticatedContext(ownerId).storage();
    const oversized = new Uint8Array(11 * 1024 * 1024);
    await assertFails(uploadBytes(ref(ownerStorage, path), oversized, { contentType: "image/jpeg" }));
  });

  it("denies User B reading, uploading to, or deleting from User A's project path", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await uploadBytes(ref(context.storage(), path), JPEG_BYTES, { contentType: "image/jpeg" });
    });

    const otherStorage = testEnv.authenticatedContext(otherId).storage();
    const imageRef = ref(otherStorage, path);
    await assertFails(getBytes(imageRef));
    await assertFails(uploadBytes(imageRef, JPEG_BYTES, { contentType: "image/jpeg" }));
    await assertFails(deleteObject(imageRef));
  });
});
