/**
 * CUI BONO: INTERNAL-INTEGRITY-GUARD
 *
 * Returns measured scan results instead of unconditional success. A clean
 * result only applies to the files and patterns actually inspected.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { internalIntegrityAudit } = require("./integrity-guard.js");

const IntegrityGuard = {
  async scanSelf(root = process.cwd()) {
    return internalIntegrityAudit(root);
  },

  redactSensitive(data) {
    if (typeof data !== "string") {
      throw new TypeError("redactSensitive expects a string");
    }
    return data
      .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, "[REDACTED]")
      .replace(/\bAKIA[0-9A-Z]{16}\b/g, "[REDACTED]")
      .replace(
        /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
        "[REDACTED PRIVATE KEY]"
      );
  },
};

export default IntegrityGuard;
