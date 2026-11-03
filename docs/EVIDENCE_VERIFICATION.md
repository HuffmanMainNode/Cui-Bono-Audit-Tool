# Evidence Verification API

This module provides a small local integrity primitive for UTF-8 text evidence.

## Example

```js
import {
  createEvidenceRecord,
  verifyEvidenceRecord,
} from "./src/core/evidence-verifier.js";

const content = "Observation copied from a public source.";
const record = createEvidenceRecord({
  id: "observation-001",
  source: "https://example.org/report",
  observedAt: "2026-11-02T12:00:00.000Z",
  content,
});

const result = verifyEvidenceRecord(record, content);
console.log(result.status); // INTEGRITY_MATCH
```

## Status meanings

- `INTEGRITY_MATCH`: supplied UTF-8 content matches the recorded SHA-256 digest and byte length.
- `INTEGRITY_MISMATCH`: content differs from the recorded byte length or digest.
- `NOT_ASSESSED`: record metadata, schema, algorithm, or input is invalid or unsupported.

## Security boundaries

A SHA-256 match proves only that the supplied content matches the digest in the supplied record. If an attacker can replace both the evidence and its record, this check alone cannot detect that replacement. It does not authenticate the source, prove a claim true, establish collection legality, provide a trusted timestamp, or create a tamper-evident audit log.

Records are not signed and are not persisted by this module. Store them in a separately protected journal and use a trusted signature or authenticated collection process when source identity matters. Binary evidence is not supported by this UTF-8 API.

The content limit is 5 MiB. This implementation uses Node.js built-in crypto and has no third-party dependency.
