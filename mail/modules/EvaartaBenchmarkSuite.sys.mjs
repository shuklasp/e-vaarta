/* MPL-2.0 */
/**
 * Machine-readable benchmark definitions for e-Vaarta.
 * Results are evidence; benchmark definitions never imply that e-Vaarta has
 * passed a benchmark.
 */

export const BenchmarkDomain = Object.freeze({
  PDF: "pdf",
  RESEARCH: "research",
  DOCUMENTS: "documents",
  SEARCH: "search",
  KNOWLEDGE: "knowledge",
  CITATIONS: "citations",
  AI: "ai",
  PROJECTS: "projects",
  COLLABORATION: "collaboration",
  MOBILE: "mobile",
  ACCESSIBILITY: "accessibility",
  INTEROPERABILITY: "interoperability",
  SECURITY: "security",
  END_TO_END: "evidence-to-action",
});

const TASKS = Object.freeze({
  pdf: ["open", "navigate", "search", "select", "annotate", "reflow", "form-fill", "redact", "sign", "merge-export"],
  research: ["extract", "place", "connect", "compare", "trace-source", "multi-document"],
  documents: ["ingest", "classify", "find-duplicate", "smart-file", "version", "recover"],
  search: ["lexical", "semantic", "hybrid", "ocr", "evidence", "graph", "saved-search"],
  knowledge: ["markdown", "backlink", "block-reference", "canvas", "properties", "query", "export"],
  citations: ["identify", "normalize", "cite", "bibliography", "word-round-trip", "format-round-trip"],
  ai: ["grounded-answer", "citation-check", "summarize", "extract", "compare", "permissioned-action"],
  projects: ["task", "dependency", "timeline", "decision-to-task", "evidence-to-task", "report"],
  collaboration: ["offline-edit", "sync", "concurrent-edit", "conflict-review", "recovery"],
  mobile: ["open", "annotate", "scan", "ocr", "voice", "share", "offline-restart"],
  accessibility: ["keyboard", "screen-reader", "reflow", "text-scale", "contrast", "focus"],
  interoperability: ["import", "edit-export", "re-import", "loss-report"],
  security: ["malformed-pdf", "malicious-attachment", "redaction-recovery", "signature-integrity", "encrypted-vault"],
  "evidence-to-action": ["communication-to-evidence", "evidence-to-claim", "claim-to-decision", "decision-to-task", "task-to-project", "project-to-report", "report-to-citation", "citation-to-communication"],
});

export function benchmarkTasks(domain) {
  if (!Object.hasOwn(TASKS, domain)) {
    throw new RangeError("unknown benchmark domain");
  }
  return [...TASKS[domain]];
}

export function createBenchmarkCase({
  id,
  domain,
  task,
  corpusId,
  expected = {},
} = {}) {
  if (!id || !domain || !task || !corpusId) {
    throw new TypeError("id, domain, task and corpusId are required");
  }
  if (!benchmarkTasks(domain).includes(task)) {
    throw new RangeError("task is not defined for benchmark domain");
  }
  return Object.freeze({ id, domain, task, corpusId, expected });
}

export function createBenchmarkResult({
  caseId,
  product,
  version,
  elapsedMs,
  memoryMb = null,
  errors = [],
  completed = false,
  notes = "",
} = {}) {
  if (!caseId || !product || !version || !Number.isFinite(elapsedMs)) {
    throw new TypeError("caseId, product, version and elapsedMs are required");
  }
  return Object.freeze({
    caseId, product, version, elapsedMs, memoryMb,
    errors: [...errors], completed, notes,
  });
}
