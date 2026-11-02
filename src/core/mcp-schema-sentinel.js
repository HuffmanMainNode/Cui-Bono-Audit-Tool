/**
 * Bounded policy checks for caller-supplied remote JSON Schemas.
 *
 * This module does not fetch schemas or implement a complete JSON Schema
 * validator. It checks the supplied origin against an exact HTTPS host
 * allowlist and rejects external schema references before downstream use.
 */

const TRUSTED_HOSTS = new Set([
  "trusted.sovereign.mesh",
  "internal.ai.agent",
]);
const MAX_SCHEMA_BYTES = 256 * 1024;
const MAX_DEPTH = 32;
const MAX_NODES = 10000;

function assertLocalReferences(value, depth = 0, state = { nodes: 0 }) {
  if (depth > MAX_DEPTH) {
    throw new Error("[MCP-SECURITY] SCHEMA_TOO_DEEP");
  }
  state.nodes += 1;
  if (state.nodes > MAX_NODES) {
    throw new Error("[MCP-SECURITY] SCHEMA_TOO_COMPLEX");
  }
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    for (const item of value) assertLocalReferences(item, depth + 1, state);
    return;
  }

  for (const [key, item] of Object.entries(value)) {
    if (key === "$ref" || key === "$dynamicRef") {
      if (typeof item !== "string" || !item.startsWith("#")) {
        throw new Error("[MCP-SECURITY] EXTERNAL_SCHEMA_REFERENCE_BLOCKED");
      }
    }
    assertLocalReferences(item, depth + 1, state);
  }
}

const MCPSchemaSentinel = {
  validateRemoteSchema(schema, originUrl) {
    if (typeof originUrl !== "string" || originUrl.length > 2048) {
      throw new TypeError("[MCP-SECURITY] INVALID_ORIGIN");
    }

    let parsed;
    try {
      parsed = new URL(originUrl);
    } catch {
      throw new TypeError("[MCP-SECURITY] INVALID_ORIGIN");
    }

    const hostname = parsed.hostname.toLowerCase();
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      !TRUSTED_HOSTS.has(hostname)
    ) {
      throw new Error("[MCP-SECURITY] UNTRUSTED_ORIGIN");
    }

    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
      throw new TypeError("[MCP-SECURITY] SCHEMA_MUST_BE_AN_OBJECT");
    }

    let serialized;
    try {
      serialized = JSON.stringify(schema);
    } catch {
      throw new TypeError("[MCP-SECURITY] SCHEMA_MUST_BE_SERIALIZABLE_JSON");
    }
    if (typeof serialized !== "string" || Buffer.byteLength(serialized, "utf8") > MAX_SCHEMA_BYTES) {
      throw new Error("[MCP-SECURITY] SCHEMA_SIZE_LIMIT_EXCEEDED");
    }

    assertLocalReferences(schema);
    return true;
  },
};

export default MCPSchemaSentinel;
