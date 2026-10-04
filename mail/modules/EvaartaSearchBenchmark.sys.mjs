/* MPL-2.0 */
/**
 * Search quality and latency contract.
 */

export const SearchMetric = Object.freeze({
  RECALL: "recall",
  PRECISION: "precision",
  NDCG: "ndcg",
  P95_LATENCY_MS: "p95-latency-ms",
  INDEX_THROUGHPUT: "index-throughput",
  MEMORY_MB: "memory-mb",
});

export function createSearchBenchmark({
  id,
  corpusId,
  queryCount,
  expectedRelevance = {},
} = {}) {
  if (!id || !corpusId || !Number.isInteger(queryCount) || queryCount <= 0) {
    throw new TypeError("id, corpusId and positive queryCount are required");
  }
  return Object.freeze({ id, corpusId, queryCount, expectedRelevance: {...expectedRelevance} });
}

export function createSearchResult({
  benchmarkId,
  metrics = {},
  queryResults = [],
} = {}) {
  if (!benchmarkId) throw new TypeError("benchmarkId is required");
  return Object.freeze({ benchmarkId, metrics: {...metrics}, queryResults: [...queryResults] });
}

export function meetsSearchTarget(result, targets = {}) {
  return Object.entries(targets).every(([key, target]) =>
    Number.isFinite(result?.metrics?.[key]) &&
    (key === SearchMetric.P95_LATENCY_MS || key === SearchMetric.MEMORY_MB
      ? result.metrics[key] <= target
      : result.metrics[key] >= target)
  );
}
