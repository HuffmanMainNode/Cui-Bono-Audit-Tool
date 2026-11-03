/**
 * Local evidence-record integrity helpers.
 *
 * A matching SHA-256 digest establishes only that supplied content matches
 * the digest stored in the record. It does not authenticate the source,
 * prove that the observation is true, or establish chain of custody.
 */
import { createHash } from "node:crypto";

const MAX_CONTENT_BYTES = 5 * 1024 * 1024;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateMetadata({ id, source, observedAt, contentType }) {
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    throw new TypeError("id must be a 1-128 character safe identifier");
  }
  if (typeof source !== "string" || source.trim().length === 0 || source.length > 2048) {
    throw new TypeError("source must be a non-empty string of at most 2048 characters");
  }
  if (typeof observedAt !== "string" || !Number.isFinite(Date.parse(observedAt))) {
    throw new TypeError("observedAt must be a valid ISO 8601 timestamp");
  }
  if (new Date(observedAt).toISOString() !== observedAt) {
    throw new TypeError("observedAt must use canonical UTC ISO 8601 format");
  }
  if (typeof contentType !== "string" || contentType.trim().length === 0 || contentType.length > 255) {
    throw new TypeError("contentType must be a non-empty string of at most 255 characters");
  }
}

function digest(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Create a portable evidence record for UTF-8 text.
 * Binary evidence should be hashed by a dedicated byte-oriented workflow.
 */
export function createEvidenceRecord({
  id,
  source,
  observedAt,
  content,
  contentType = "text/plain; charset=utf-8",
}) {
  validateMetadata({ id, source, observedAt, contentType });
  if (typeof content !== "string") {
    throw new TypeError("content must be a UTF-8 string");
  }
  const byteLength = Buffer.byteLength(content, "utf8");
  if (byteLength > MAX_CONTENT_BYTES) {
    throw new RangeError("content exceeds the 5 MiB evidence-record limit");
  }

  return Object.freeze({
    schemaVersion: 1,
    id,
    source,
    observedAt,
    contentType,
    contentBytes: byteLength,
    hashAlgorithm: "sha256",
    contentHash: digest(content),
  });
}

/**
 * Compare supplied content with a previously recorded digest.
 * This is an integrity comparison, not source authentication or fact-checking.
 */
export function verifyEvidenceRecord(record, content) {
  if (!isPlainObject(record) || typeof content !== "string") {
    return {
      status: "NOT_ASSESSED",
      reason: "A plain evidence record and UTF-8 string content are required.",
    };
  }

  try {
    validateMetadata({
      id: record.id,
      source: record.source,
      observedAt: record.observedAt,
      contentType: record.contentType,
    });
  } catch {
    return { status: "NOT_ASSESSED", reason: "Evidence metadata is malformed." };
  }

  if (
    record.schemaVersion !== 1 ||
    record.hashAlgorithm !== "sha256" ||
    !Number.isSafeInteger(record.contentBytes) ||
    record.contentBytes < 0 ||
    record.contentBytes > MAX_CONTENT_BYTES ||
    typeof record.contentHash !== "string" ||
    !SHA256_PATTERN.test(record.contentHash)
  ) {
    return { status: "NOT_ASSESSED", reason: "Evidence record schema or digest metadata is unsupported." };
  }

  const actualBytes = Buffer.byteLength(content, "utf8");
  if (actualBytes > MAX_CONTENT_BYTES) {
    return { status: "NOT_ASSESSED", reason: "Supplied content exceeds the 5 MiB limit." };
  }
  if (actualBytes !== record.contentBytes) {
    return {
      status: "INTEGRITY_MISMATCH",
      reason: "Supplied content length differs from the recorded length.",
    };
  }

  const actualHash = digest(content);
  if (actualHash !== record.contentHash) {
    return {
      status: "INTEGRITY_MISMATCH",
      reason: "Supplied content does not match the recorded SHA-256 digest.",
    };
  }

  return {
    status: "INTEGRITY_MATCH",
    hashAlgorithm: "sha256",
    contentHash: actualHash,
    limitation: "A matching digest does not authenticate the source or prove the evidence is true.",
  };
}
