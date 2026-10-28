const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { internalIntegrityAudit } = require("../src/core/integrity-guard.js");

function withTempDir(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cui-bono-integrity-"));
  try { run(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test("clean directory reports measured success", () => {
  withTempDir((dir) => {
    fs.writeFileSync(path.join(dir, "note.txt"), "ordinary public text");
    const result = internalIntegrityAudit(dir);
    assert.equal(result.ok, true);
    assert.equal(result.scannedFiles, 1);
    assert.deepEqual(result.findings, []);
  });
});

test("credential-like value fails closed without exposing the value", () => {
  withTempDir((dir) => {
    const token = ["ghp_", "A".repeat(36)].join("");
    fs.writeFileSync(path.join(dir, "sample.txt"), token);
    const result = internalIntegrityAudit(dir);
    assert.equal(result.ok, false);
    assert.equal(result.findings[0].rule, "GitHub token");
    assert.equal(JSON.stringify(result).includes(token), false);
  });
});

test("unreadable or missing scan root is a failure, not a clean result", () => {
  const missing = path.join(os.tmpdir(), "cui-bono-missing-root-" + process.pid);
  const result = internalIntegrityAudit(missing);
  assert.equal(result.ok, false);
  assert.equal(result.findings[0].rule, "scan-error");
});

test("oversized files fail closed because they are not inspected", () => {
  withTempDir((dir) => {
    fs.writeFileSync(path.join(dir, "large.bin"), Buffer.alloc(1000001, 65));
    const result = internalIntegrityAudit(dir);
    assert.equal(result.ok, false);
    assert.equal(result.findings[0].rule, "file-too-large");
  });
});

test("binary files fail closed because the text scanner cannot inspect them", () => {
  withTempDir((dir) => {
    fs.writeFileSync(path.join(dir, "binary.dat"), Buffer.from([0, 1, 2, 3]));
    const result = internalIntegrityAudit(dir);
    assert.equal(result.ok, false);
    assert.equal(result.findings[0].rule, "binary-file-not-scanned");
  });
});
