const test = require("node:test");
const assert = require("node:assert/strict");

const controllerModule = import("../src/core/master-audit-controller.js");
const sentinelModule = import("../src/core/mcp-schema-sentinel.js");

test("audit controller reports NOT_ASSESSED when no checks are registered", async () => {
  const { createAuditController } = await controllerModule;
  const result = await createAuditController().runFullDiagnostic();
  assert.equal(result.status, "NOT_ASSESSED");
  assert.equal(result.integrity, null);
  assert.equal(result.summary.registered, 0);
});

test("audit controller reports measured pass and fail results", async () => {
  const { createAuditController } = await controllerModule;
  const audit = createAuditController([
    { id: "passes", run: async () => true },
    { id: "fails", run: async () => false },
    { id: "throws", run: async () => { throw new TypeError("private detail"); } },
  ]);
  const result = await audit.runFullDiagnostic();
  assert.equal(result.status, "FAIL");
  assert.deepEqual(result.summary, { registered: 3, passed: 1, failed: 2 });
  assert.deepEqual(result.results.map((item) => item.status), ["PASS", "FAIL", "FAIL"]);
  assert.equal(JSON.stringify(result).includes("private detail"), false);
});

test("audit controller rejects duplicate and malformed checks", async () => {
  const { createAuditController } = await controllerModule;
  const audit = createAuditController();
  audit.registerCheck("integrity", () => true);
  assert.throws(() => audit.registerCheck("integrity", () => true), /already registered/);
  assert.throws(() => audit.registerCheck("../unsafe", () => true), /safe identifier/);
  assert.throws(() => audit.registerCheck("not-a-function", null), /must be a function/);
});

test("proprietary seal is not reported as verified without cryptographic verification", async () => {
  const { createAuditController } = await controllerModule;
  const result = createAuditController().verifyProprietarySeal();
  assert.equal(result.verified, false);
  assert.equal(result.status, "NOT_IMPLEMENTED");
});

test("MCP schema sentinel accepts an exact trusted HTTPS origin", async () => {
  const { default: sentinel } = await sentinelModule;
  assert.equal(
    sentinel.validateRemoteSchema({ type: "object", properties: { id: { type: "string" } } },
      "https://trusted.sovereign.mesh/schema.json"),
    true,
  );
});

test("MCP schema sentinel rejects untrusted and spoofed origins", async () => {
  const { default: sentinel } = await sentinelModule;
  for (const origin of [
    "http://trusted.sovereign.mesh/schema.json",
    "https://trusted.sovereign.mesh.attacker.example/schema.json",
    "https://trusted.sovereign.mesh@attacker.example/schema.json",
    "https://untrusted.example/schema.json",
    "https://trusted.sovereign.mesh:8443/schema.json",
  ]) {
    assert.throws(() => sentinel.validateRemoteSchema({}, origin), /UNTRUSTED_ORIGIN/);
  }
});

test("MCP schema sentinel rejects non-object and oversized schemas", async () => {
  const { default: sentinel } = await sentinelModule;
  assert.throws(() => sentinel.validateRemoteSchema([], "https://trusted.sovereign.mesh"),
    /SCHEMA_MUST_BE_AN_OBJECT/);
  assert.throws(() => sentinel.validateRemoteSchema({ description: "x".repeat(270000) },
    "https://trusted.sovereign.mesh"), /SCHEMA_SIZE_LIMIT_EXCEEDED/);
});

test("MCP schema sentinel blocks external references but permits local references", async () => {
  const { default: sentinel } = await sentinelModule;
  assert.throws(() => sentinel.validateRemoteSchema({ $ref: "https://evil.example/schema.json" },
    "https://trusted.sovereign.mesh"), /EXTERNAL_SCHEMA_REFERENCE_BLOCKED/);
  assert.equal(sentinel.validateRemoteSchema({ $ref: "#/$defs/identifier" },
    "https://trusted.sovereign.mesh"), true);
});

test("MCP schema sentinel does not reject harmless words in descriptions", async () => {
  const { default: sentinel } = await sentinelModule;
  assert.equal(sentinel.validateRemoteSchema({
    description: "A tool may fetch data and may document shell access in examples.",
    properties: { fetch: { type: "string" } },
  }, "https://trusted.sovereign.mesh"), true);
});
