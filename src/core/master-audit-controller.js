/**
 * Measured diagnostic runner.
 *
 * Only explicitly registered checks are executed. This module does not
 * discover controls automatically and does not certify a system as secure.
 */

const CHECK_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;

export function createAuditController(initialChecks = []) {
  const checks = new Map();

  function registerCheck(id, run) {
    if (typeof id !== "string" || !CHECK_ID.test(id)) {
      throw new TypeError("check id must be 1-64 safe identifier characters");
    }
    if (typeof run !== "function") {
      throw new TypeError("check must be a function");
    }
    if (checks.has(id)) {
      throw new Error(`diagnostic check already registered: ${id}`);
    }
    checks.set(id, run);
    return () => checks.delete(id);
  }

  for (const entry of initialChecks) {
    if (!entry || typeof entry !== "object") {
      throw new TypeError("initial checks must be { id, run } objects");
    }
    registerCheck(entry.id, entry.run);
  }

  return {
    registerCheck,

    async runFullDiagnostic() {
      if (checks.size === 0) {
        return {
          status: "NOT_ASSESSED",
          integrity: null,
          summary: { registered: 0, passed: 0, failed: 0 },
          results: [],
          limitation: "No diagnostic checks are registered; no security assessment was performed.",
        };
      }

      const results = [];
      for (const [id, run] of checks) {
        try {
          const outcome = await run();
          const passed = outcome === true || (outcome && outcome.ok === true);
          results.push({
            id,
            status: passed ? "PASS" : "FAIL",
            detail: passed ? undefined : "Check did not return true or { ok: true }.",
          });
        } catch (error) {
          results.push({
            id,
            status: "FAIL",
            error: error && typeof error.name === "string" ? error.name : "Error",
          });
        }
      }

      const passed = results.filter((item) => item.status === "PASS").length;
      const failed = results.length - passed;
      return {
        status: failed === 0 ? "PASS" : "FAIL",
        integrity: null,
        summary: { registered: results.length, passed, failed },
        results,
        limitation: "Results cover only registered checks and are not a security certification.",
      };
    },

    verifyProprietarySeal() {
      return {
        verified: false,
        status: "NOT_IMPLEMENTED",
        reason: "No cryptographic signature or seal-verification procedure is configured.",
      };
    },
  };
}

const MasterAudit = createAuditController();
export default MasterAudit;
