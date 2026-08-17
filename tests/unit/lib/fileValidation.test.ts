import { describe, expect, it } from "vitest";
import { validateImageFile } from "@/lib/fileValidation";

const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF_HEADER = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

function makeFile(bytes: Uint8Array, name: string, type: string, extraSize = 0): File {
  const padding = extraSize > 0 ? new Uint8Array(extraSize) : new Uint8Array(0);
  return new File([bytes as BlobPart, padding as BlobPart], name, { type });
}

describe("validateImageFile", () => {
  it("accepts a well-formed JPEG", async () => {
    const file = makeFile(JPEG_HEADER, "photo.jpg", "image/jpeg");
    expect(await validateImageFile(file)).toEqual({ valid: true });
  });

  it("accepts a well-formed PNG", async () => {
    const file = makeFile(PNG_HEADER, "photo.png", "image/png");
    expect(await validateImageFile(file)).toEqual({ valid: true });
  });

  it("rejects an unsupported MIME type", async () => {
    const file = makeFile(GIF_HEADER, "photo.gif", "image/gif");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
  });

  it("rejects a file whose content doesn't match its claimed type (spoofed extension/type)", async () => {
    // Claims to be a PNG via type, but the actual bytes are a GIF header — the
    // exact "never trust the Content-Type header alone" case this validator exists for.
    const file = makeFile(GIF_HEADER, "fake.png", "image/png");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/header/i);
  });

  it("rejects an empty file", async () => {
    const file = new File([], "empty.png", { type: "image/png" });
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
  });

  it("rejects a file exceeding the size limit", async () => {
    const file = makeFile(PNG_HEADER, "huge.png", "image/png", 11 * 1024 * 1024);
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/size limit/i);
  });
});
