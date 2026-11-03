# Cui Bono Audit Tool

An experimental collection of security-audit utilities and defensive prototypes for reviewing software and AI-adjacent workflows.

This repository is public and intended for independent inspection and use. Its historical phase names describe design goals and prototypes; they do not, by themselves, establish that a security control is implemented, effective, or independently verified.

## Current verified scope

The current mainline includes a local working-tree pattern scanner, a fail-closed command-execution boundary, an origin and schema-input policy check, and a diagnostic controller that reports only checks explicitly registered with it.

These utilities have important limits:

- The integrity scanner checks the current working tree for a small set of credential-like patterns. It does not scan Git history, remote repositories, running processes, or every secret format.
- The command-execution helper is deliberately disabled. It is not a sandbox or command runner.
- The MCP schema sentinel checks an exact HTTPS host allowlist, bounded JSON input, and local-only schema references. It does not fetch schemas, validate every JSON Schema rule, or make downstream tools safe.
- The audit controller does not perform a universal or automatic security audit. With no registered checks, its result is **NOT_ASSESSED**.
- Other phase modules are prototypes or design experiments unless their behavior is independently demonstrated by tests and documented evidence.

See [Capability Status](docs/CAPABILITY_STATUS.md) for the current implementation boundary and [Security Policy](SECURITY.md) for vulnerability reporting.

## Run the available checks

Requirements: Node.js with the built-in test runner and Python 3.

```bash
node --test tests/*.test.js
python -m unittest discover -s tests -p 'test_*.py' -v
python -m py_compile src/cures/python-security-layer.py
```

No hosted service or paid API is required for these local regression tests.

## Security use

Treat scanner findings as leads for human review, not proof that a repository is secure or compromised. A clean scan means only that the configured checks did not find a matching pattern in the inspected files.

Do not run this project against systems or data without authorization. Do not place credentials, private keys, or sensitive personal information in test fixtures or public issues. If a credential may have been exposed, revoke or rotate it rather than relying on deletion.

## Historical design and phase catalog

The following chapters preserve the project's original design vocabulary and intended research areas. They are a catalog of concepts and planned/prototyped controls, not a certification or claim that every item is implemented.

### Chapter I: Foundation & Kernel (Phases 1-50)
- **Phases 1-10:** CISA/MITRE baseline ingestion, multi-language execution safeguards, and audit-log integrity.
- **Phases 11-25:** memory-safety research, mesh-poisoning defenses, and AI logic checks.
- **Phases 26-40:** blockchain asset checks, side-channel research, and cloud SSRF defenses.
- **Phases 41-50:** system convergence and defensive orchestration concepts.

### Chapter II: Infrastructure & Mesh (Phases 51-150)
- **Phases 51-75:** node discovery, shard-mesh concepts, and distributed trust.
- **Phases 76-100:** state preservation, agent coordination, and recovery loops.
- **Phases 101-125:** agent safety and de-weaponization concepts.
- **Phases 126-150:** governance and human-control safeguards.

### Chapter III: Quantum & Multi-Architecture (Phases 151-250)
- **Phases 151-175:** Clara-Gatekeeper integration concepts.
- **Phases 176-200:** neural-lattice analysis and recursive hardening.
- **Phases 201-225:** mesh resilience and statelessness concepts.
- **Phases 226-250:** quantum-inspired lattice and decoherence research.

### Chapter IV: Silicon & Agentic Systems (Phases 251-300)
- **Phases 251-275:** hardware and side-channel research concepts.
- **Phases 276-281:** source alignment and agent goal-hijack defenses.
- **Phases 282-290:** supply-chain, MCP, and agent-persistence research.
- **Phases 291-300:** environment isolation and memory-handling concepts.

### Chapter V: Linguistic & Cognitive Systems (Phases 301-330+)
- **Phases 301-307:** multi-language security research.
- **Phases 308-312:** multi-agent role collision, ReDoS, and reasoning-integrity concepts.
- **Phases 313-320:** hallucination detection, sandbox assessment, evidence grounding, and cross-language verification.
- **Phases 321-330:** integration and release concepts.

### Later design chapters (Phases 333-400+)
- **Phases 333-335:** context and semantic consistency.
- **Phases 336-338:** physical/digital signal and timing research.
- **Phases 339-350:** biological-data privacy and identity concepts.
- **Phases 351-400+:** governance, recursive stability, and future certification goals.

These later chapters are exploratory descriptions. No claim is made here that quantum protection, biological identity proofs, a 10,000-node mesh, autonomous self-healing, or certification has been delivered.

## License and intellectual-property notice

The repository currently contains an MIT `LICENSE`, while `package.json` and `TERMS_OF_USE.md` contain different proprietary-language statements. This is a known metadata/legal ambiguity that must be resolved by the maintainer before redistribution terms are represented as settled. Until then, consult the actual license file and obtain qualified legal advice if the distinction affects your intended use.
