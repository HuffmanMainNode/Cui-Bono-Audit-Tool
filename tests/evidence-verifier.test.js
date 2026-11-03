const test = require("node:test");
const assert = require("node:assert/strict");

const verifierModule = import("../src/core/evidence-verifier.js");

const metadata = {
  id: "case-001",
  source: "https://example.org/report",
  observedAt: "2026-11-02T12:00:00.000Z",
  contentType: "text/plain; charset=utf-8",
};

test("creates a deterministic SHA-256 evidence record", async () => {
  const { createEvidenceRecord } = await verifierModule;
  const first = createEvidenceRecord({ ...metadata, content: "public evidence" });
  const second = createEvidenceRecord({ ...metadata, content: "public evidence" });
  assert.deepEqual(first, second);
  assert.equal(first.hashAlgorithm, "sha256");
  assert.equal(first.contentBytes, Buffer.byteLength("public evidence", "utf8"));
  assert.equal(Object.isFrozen(first), true);
});

test("reports integrity match for unchanged evidence", async () => {
  const { createEvidenceRecord, verifyEvidenceRecord } = await verifierModule;
  const record = createEvidenceRecord({ ...metadata, content: "source text" });
  const result = verifyEvidenceRecord(record, "source text");
  assert.equal(result.status, "INTEGRITY_MATCH");
  assert.equal(result.contentHash, record.contentHash);
});

test("detects altered content and altered recorded digest", async () => {
  const { createEvidenceRecord, verifyEvidenceRecord } = await verifierModule;
  const record = createEvidenceRecord({ ...metadata, content: "original" });
  assert.equal(verifyEvidenceRecord(record, "changed").status, "INTEGRITY_MISMATCH");
  assert.equal(
    verifyEvidenceRecord({ ...record, contentHash: "0".repeat(64) }, "original").status,
    "INTEGRITY_MISMATCH",
  );
});

test("does not assess malformed records or unsupported algorithms", async () => {
  const { createEvidenceRecord, verifyEvidenceRecord } = await verifierModule;
  const record = createEvidenceRecord({ ...metadata, content: "original" });
  assert.equal(verifyEvidenceRecord(null, "original").status, "NOT_ASSESSED");
  assert.equal(
    verifyEvidenceRecord({ ...record, hashAlgorithm: "sha1" }, "original").status,
    "NOT_ASSESSED",
  );
  assert.equal(
    verifyEvidenceRecord({ ...record, observedAt: "not-a-date" }, "original").status,
    "NOT_ASSESSED",
  );
});

test("rejects invalid metadata and non-string content", async () => {
  const { createEvidenceRecord } = await verifierModule;
  assert.throws(() => createEvidenceRecord({ ...metadata, id: "../case", content: "x" }), /safe identifier/);
  assert.throws(() => createEvidenceRecord({ ...metadata, observedAt: "2026-11-02", content: "x" }), /canonical UTC/);
  assert.throws(() => createEvidenceRecord({ ...metadata, content: Buffer.from("x") }), /UTF-8 string/);
});

test("enforces the evidence content size limit", async () => {
  const { createEvidenceRecord, verifyEvidenceRecord } = await verifierModule;
  const tooLarge = "x".repeat(5 * 1024 * 1024 + 1);
  assert.throws(() => createEvidenceRecord({ ...metadata, content: tooLarge }), /5 MiB/);
  const record = createEvidenceRecord({ ...metadata, content: "small" });
  assert.equal(verifyEvidenceRecord(record, tooLarge).status, "NOT_ASSESSED");
});

test("does not claim source authenticity or factual truth", async () => {
  const { createEvidenceRecord, verifyEvidenceRecord } = await verifierModule;
  const record = createEvidenceRecord({ ...metadata, content: "claim" });
  const result = verifyEvidenceRecord(record, "claim");
  assert.match(result.limitation, /does not authenticate the source/);
});
