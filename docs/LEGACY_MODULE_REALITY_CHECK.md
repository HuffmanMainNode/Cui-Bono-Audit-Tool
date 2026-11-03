# Legacy Module Reality Check

**Review date:** 2026-11-02  
**Branch reviewed:** `main`  
**Method:** Source inspection plus repository-scoped code search for exported symbols and call sites. Search results are not a proof that no dynamic or external caller exists.

This review records what the inspected modules actually do. It does not delete or silently replace legacy files.

## Findings

| Module | Observed implementation | Accurate status |
|---|---|---|
| `entanglement-consensus.js` | Logs a message, returns a fixed “verified” string, and logs a purge message. No shard hashes, consensus protocol, purge, or restoration are implemented. | Placeholder; false assurance if treated as an integrity control. |
| `mas-consensus-guard.js` | Counts votes with `integrity_score > 0.99`, divides by total votes, and compares to 0.66. No identity authentication, Sybil resistance, validator set, quorum configuration, equivocation handling, or consensus rounds. | Toy threshold heuristic, not Byzantine fault-tolerant consensus. Empty input also produces a non-finite ratio rather than an explicit invalid result. |
| `truth-lattice-anchor.js` | Delegates to caller-provided `sourceMesh.validate(assertion.hash)`; on failure logs a purge message and calls a method that only logs. | Unspecified external verifier; no actual data-location purge. Caller must define what was verified and against which trust root. |
| `hallucination-absolute-cure.js` | Delegates to `meshRegistry.checkProof(assertion.id)` and returns caller-provided data if truthy. | Wrapper around an unverified dependency, not a hallucination cure or proof verifier. |
| `truth-sovereignty-guard.js` | Searches a report string for three exact marker strings; “sealing” returns a timestamped text label. | Narrow marker filter; no signature, cryptographic seal, or tamper evidence. |
| `fabric-integrity-guard.js` | Logs a state hash and returns `true`; reconstruction returns a fixed “Integrity 100%” string. | Placeholder; no distribution, shard storage, proof validation, or reconstruction. |
| `anti-coverup-guard.js` | Freezes its own initially empty array and compares JSON serialization of a supplied value. | In-memory comparison only; no durable append-only log, authenticated writer, or tamper-evident storage. |
| `context-integrity-guard.js` | Rejects SQL strings containing selected substrings; drift calculation always returns `0.1`. | Not SQL injection protection or semantic drift detection. SQL safety requires parameterized queries and constrained query interfaces, not keyword filtering. |
| `forensic-integrity-guard.js` | HTML-escapes a string; context clearing fills a supplied typed array with random bytes. | Escaping is context-specific and does not make arbitrary logs safe in every renderer. Random overwrite is not a guaranteed secure memory wipe in managed runtimes. |
| `integrity-guard.js` | Scans current-tree files for selected credential-like patterns and redacts values. | Useful limited pattern scanner, not full secret scanning or credential validation. Its scope and limitations are already documented in the capability status. |

## Trust-boundary and safety conclusions

1. Do not use any module above as an authorization decision, proof of agent identity, distributed consensus, cryptographic attestation, secure erasure, or production-grade SQL defense.
2. A caller-supplied function such as `sourceMesh.validate` or `meshRegistry.checkProof` is a trust boundary. The wrapper cannot establish the dependency's integrity or correctness.
3. A boolean or string saying “verified” is not evidence. Results should identify the exact check, evidence, verifier, timestamp, and limitations.
4. The 2/3 threshold in `mas-consensus-guard.js` does not by itself provide Byzantine fault tolerance. BFT safety depends on authenticated validator identities, a defined fault model, quorum rules, protocol rounds, and handling of equivocation and membership changes.
5. Do not implement “purge” as a side effect of a failed evidence check. Quarantine and operator review are safer defaults; deletion of evidence can destroy forensic value.

## Recommended treatment

- Preserve the legacy files for compatibility until callers and downstream consumers are mapped.
- Mark the above modules as experimental/legacy in documentation and prevent them from being presented as completed controls.
- Add a new, small evidence-verification API with explicit inputs, bounded data, deterministic outputs, and test vectors rather than trying to retrofit distributed claims into these modules.
- Replace fake “seal” and “verified” strings with explicit `NOT_IMPLEMENTED` or `NOT_ASSESSED` states before any public claim of capability.
- Keep cryptographic identity, distributed consensus, SQL execution, and secure memory erasure out of scope unless a real protocol/library and threat model are selected.

## Search limitation

Repository-scoped code search found the module symbols in their defining files but did not return additional call sites for the searched method names. Dynamic imports, generated code, external consumers, and differently named wrappers may not be discoverable this way. A full local checkout and static import graph are required before changing exports or behavior.
