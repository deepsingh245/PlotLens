/**
 * File-upload validation — not spatial data, so this lives in src/lib/, not
 * src/gis/. See docs/SECURITY.md §File upload security: "Actual file-signature
 * (magic-byte) validation — never trust the Content-Type header alone." This
 * is a UX-only boundary in Track A (fail fast, better error message) — the
 * real enforcement point is Track B's storage.rules content-type check.
 */
export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function bytesMatch(header: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => header[index] === byte);
}

export async function validateImageFile(file: File): Promise<FileValidationResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { valid: false, reason: `unsupported file type "${file.type || "unknown"}" — only JPEG/PNG are allowed` };
  }

  if (file.size === 0) {
    return { valid: false, reason: "file is empty" };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: `file exceeds the ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB size limit` };
  }

  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const looksLikeJpeg = bytesMatch(header, JPEG_SIGNATURE);
  const looksLikePng = bytesMatch(header, PNG_SIGNATURE);
  if (!looksLikeJpeg && !looksLikePng) {
    return { valid: false, reason: "file content doesn't match a JPEG or PNG header — the extension/type may be wrong" };
  }

  return { valid: true };
}
