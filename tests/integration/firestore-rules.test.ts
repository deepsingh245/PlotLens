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

describe("annotations subcollection (docs/plans/plan-2.md Track B)", () => {
  const ownerId = "owner-a";
  const otherId = "owner-b";

  function baseAnnotationDoc(projectId: string) {
    return {
      projectId,
      type: "point",
      geometry: { type: "Point", coordinates: [78.0081, 27.1767] },
      title: "Candidate site",
      tags: [],
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });
  });

  it("denies unauthenticated read/create", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauthedDb, "projects/proj-1/annotations/anno-1")));
    await assertFails(
      setDoc(doc(unauthedDb, "projects/proj-1/annotations/anno-1"), baseAnnotationDoc("proj-1")),
    );
  });

  it("allows the project owner to create, read, update, and delete an annotation", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    const annotationRef = doc(ownerDb, "projects/proj-1/annotations/anno-1");

    await assertSucceeds(setDoc(annotationRef, baseAnnotationDoc("proj-1")));
    await assertSucceeds(getDoc(annotationRef));
    await assertSucceeds(updateDoc(annotationRef, { title: "Renamed" }));
    await assertSucceeds(deleteDoc(annotationRef));
  });

  it("rejects a create whose projectId doesn't match the parent path", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    await assertFails(
      setDoc(doc(ownerDb, "projects/proj-1/annotations/anno-1"), baseAnnotationDoc("some-other-project")),
    );
  });

  it("denies User B reading/updating/deleting an annotation under User A's project", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1/annotations/anno-1"), baseAnnotationDoc("proj-1"));
    });

    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    const annotationRef = doc(otherDb, "projects/proj-1/annotations/anno-1");
    await assertFails(getDoc(annotationRef));
    await assertFails(updateDoc(annotationRef, { title: "Hijacked" }));
    await assertFails(deleteDoc(annotationRef));
    await assertFails(setDoc(doc(otherDb, "projects/proj-1/annotations/anno-2"), baseAnnotationDoc("proj-1")));
  });
});

describe("overlays subcollection (docs/plans/plan-3.md Track B)", () => {
  const ownerId = "owner-a";
  const otherId = "owner-b";

  function baseOverlayDoc(projectId: string) {
    return {
      projectId,
      imageUrl: "https://example.invalid/image.jpg",
      // Stored as {lng,lat} objects, not [lng,lat] pairs: Firestore forbids
      // nested arrays, so storage/overlays.ts serializes each corner to an
      // object (an array of 4 objects still satisfies the rule's size()==4).
      coordinates: [
        { lng: 77.9, lat: 27.2 },
        { lng: 78.1, lat: 27.2 },
        { lng: 78.1, lat: 27.0 },
        { lng: 77.9, lat: 27.0 },
      ],
      opacity: 1,
      visible: true,
      rotation: null,
      blendMode: "normal",
      locked: false,
      name: "Overlay",
      sourceMetadata: { description: "", approximateDate: null },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });
  });

  it("allows the project owner to create, read, update, and delete an overlay", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    const overlayRef = doc(ownerDb, "projects/proj-1/overlays/overlay-1");

    await assertSucceeds(setDoc(overlayRef, baseOverlayDoc("proj-1")));
    await assertSucceeds(getDoc(overlayRef));
    await assertSucceeds(updateDoc(overlayRef, { opacity: 0.5 }));
    await assertSucceeds(deleteDoc(overlayRef));
  });

  it("rejects create with an out-of-range opacity or a malformed corner count", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    await assertFails(
      setDoc(doc(ownerDb, "projects/proj-1/overlays/overlay-1"), { ...baseOverlayDoc("proj-1"), opacity: 1.5 }),
    );
    await assertFails(
      setDoc(doc(ownerDb, "projects/proj-1/overlays/overlay-2"), {
        ...baseOverlayDoc("proj-1"),
        coordinates: baseOverlayDoc("proj-1").coordinates.slice(0, 3),
      }),
    );
  });

  it("denies User B reading/updating/deleting an overlay under User A's project", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1/overlays/overlay-1"), baseOverlayDoc("proj-1"));
    });

    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    const overlayRef = doc(otherDb, "projects/proj-1/overlays/overlay-1");
    await assertFails(getDoc(overlayRef));
    await assertFails(updateDoc(overlayRef, { opacity: 0.1 }));
    await assertFails(deleteDoc(overlayRef));
  });
});

describe("savedViews subcollection (docs/plans/plan-8.md Track B)", () => {
  const ownerId = "owner-a";
  const otherId = "owner-b";

  function baseSavedViewDoc(projectId: string) {
    return {
      projectId,
      name: "Initial survey",
      map: { center: [78.0081, 27.1767], zoom: 12, bearing: 0, pitch: 0 },
      activeLayers: [],
      selectedFeatureId: null,
      createdAt: Date.now(),
    };
  }

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });
  });

  it("allows the project owner to create, read, and delete a saved view", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    const viewRef = doc(ownerDb, "projects/proj-1/savedViews/view-1");

    await assertSucceeds(setDoc(viewRef, baseSavedViewDoc("proj-1")));
    await assertSucceeds(getDoc(viewRef));
    await assertSucceeds(deleteDoc(viewRef));
  });

  it("denies User B reading or deleting a saved view under User A's project", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1/savedViews/view-1"), baseSavedViewDoc("proj-1"));
    });

    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    const viewRef = doc(otherDb, "projects/proj-1/savedViews/view-1");
    await assertFails(getDoc(viewRef));
    await assertFails(deleteDoc(viewRef));
  });
});

describe("investigationEvents subcollection (docs/plans/plan-8.md Track B)", () => {
  const ownerId = "owner-a";
  const otherId = "owner-b";

  function baseEventDoc(projectId: string) {
    return {
      projectId,
      type: "note_added",
      summary: "Checked the site boundary",
      relatedEntityId: null,
      timestamp: Date.now(),
    };
  }

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1"), baseProjectDoc(ownerId));
    });
  });

  it("allows the project owner to create and read an event, but never update or delete it", async () => {
    const ownerDb = testEnv.authenticatedContext(ownerId).firestore();
    const eventRef = doc(ownerDb, "projects/proj-1/investigationEvents/event-1");

    await assertSucceeds(setDoc(eventRef, baseEventDoc("proj-1")));
    await assertSucceeds(getDoc(eventRef));
    await assertFails(updateDoc(eventRef, { summary: "Edited after the fact" }));
    await assertFails(deleteDoc(eventRef));
  });

  it("denies User B reading or creating an event under User A's project", async () => {
    const otherDb = testEnv.authenticatedContext(otherId).firestore();
    await assertFails(
      setDoc(doc(otherDb, "projects/proj-1/investigationEvents/event-1"), baseEventDoc("proj-1")),
    );

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "projects/proj-1/investigationEvents/event-1"), baseEventDoc("proj-1"));
    });
    await assertFails(getDoc(doc(otherDb, "projects/proj-1/investigationEvents/event-1")));
  });
});
