/**
 * CUI BONO INTERNAL INTEGRITY CHECK
 * Current-tree pattern scanner only. This is not a Git-history or remote scan.
 */
const fs = require("node:fs");
const path = require("node:path");

const SECRET_PATTERNS = [
  { name: "GitHub token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g },
  { name: "AWS access key ID", pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "Private key block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { name: "Credential assignment", pattern: /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"'\s]{12,}["']/gi },
];
const SKIP_DIRS = new Set([".git", "node_modules", ".venv", "venv", "dist", "build", "coverage"]);

function scanDirectory(directory, root, findings, scanned) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    findings.push({ file: path.relative(root, directory) || ".", rule: "scan-error" });
    return;
  }
  for (const entry of entries) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) scanDirectory(file, root, findings, scanned);
      continue;
    }
    if (!entry.isFile()) continue;
    try {
      const info = fs.statSync(file);
      if (info.size > 1000000) continue;
      const buffer = fs.readFileSync(file);
      if (buffer.includes(0)) continue;
      const text = buffer.toString("utf8");
      scanned.count += 1;
      for (const rule of SECRET_PATTERNS) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(text)) {
          findings.push({ file: path.relative(root, file), rule: rule.name, message: "Potential secret pattern detected; value omitted." });
        }
      }
    } catch {
      findings.push({ file: path.relative(root, file), rule: "scan-error" });
    }
  }
}

function internalIntegrityAudit(root = process.cwd()) {
  const resolvedRoot = path.resolve(root);
  const findings = [];
  const scanned = { count: 0 };
  scanDirectory(resolvedRoot, resolvedRoot, findings, scanned);
  return {
    ok: findings.length === 0,
    scannedFiles: scanned.count,
    findings,
    limitations: [
      "Current working tree only; Git history and remote repositories are not scanned.",
      "Pattern matching can produce false positives and miss unknown formats.",
      "Revoke or rotate a suspected live credential; deletion alone is insufficient.",
    ],
  };
}

module.exports = { internalIntegrityAudit };
