import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ANALYSIS_CACHE_TTL_MS,
  getCachedOrFetchAnalysis,
  buildAuditReport,
  exportAuditReport
} from '../utils/pro-features.js'
import { clearWorkspace, getAnalysisCacheEntry, setAnalysisCacheEntry } from '../utils/storage.js'

function installMemoryStorage() {
  const values = new Map()
  globalThis.localStorage = {
    getItem(key) { return values.has(key) ? JSON.stringify(values.get(key)) : null },
    setItem(key, value) { values.set(key, JSON.parse(value)) },
    removeItem(key) { values.delete(key) }
  }
  return values
}

test('analysis cache reuses a fresh local result within the five-minute TTL', async () => {
  installMemoryStorage()
  let runs = 0
  const analyze = target => ({ value: target, type: 'domain', status: 'Preliminary analysis', findings: [], checkedAt: '2026-11-06T00:00:00.000Z' })
  const first = await getCachedOrFetchAnalysis('Example.com', target => { runs += 1; return analyze(target) }, false, { now: 1000 })
  const second = await getCachedOrFetchAnalysis('example.com', target => { runs += 1; return analyze(target) }, false, { now: 2000 })
  assert.equal(runs, 1)
  assert.equal(first.cacheInfo.isCached, false)
  assert.equal(second.cacheInfo.isCached, true)
  assert.equal(second.value, 'Example.com')
  assert.equal(second.cacheInfo.persisted, true)
})

test('forced refresh bypasses cache and replaces the cached payload', async () => {
  installMemoryStorage()
  let runs = 0
  const analyze = target => ({ value: target, revision: ++runs })
  await getCachedOrFetchAnalysis('example.com', analyze, false, { now: 1000 })
  const refreshed = await getCachedOrFetchAnalysis('example.com', analyze, true, { now: 2000 })
  assert.equal(runs, 2)
  assert.equal(refreshed.revision, 2)
  assert.equal(refreshed.cacheInfo.isCached, false)
})

test('expired entries are recalculated instead of reused', async () => {
  installMemoryStorage()
  let runs = 0
  const analyze = target => ({ value: target, revision: ++runs })
  await getCachedOrFetchAnalysis('example.com', analyze, false, { now: 1000 })
  const fresh = await getCachedOrFetchAnalysis('example.com', analyze, false, { now: 1000 + ANALYSIS_CACHE_TTL_MS })
  assert.equal(runs, 2)
  assert.equal(fresh.cacheInfo.isCached, false)
})

test('cache validates the analyzer output and propagates analyzer errors', async () => {
  installMemoryStorage()
  await assert.rejects(() => getCachedOrFetchAnalysis('x', () => null), /must return an object/)
  await assert.rejects(() => getCachedOrFetchAnalysis('x', () => { throw new Error('analysis failed') }), /analysis failed/)
})

test('audit export is versioned and states the local-analysis limitations', () => {
  const report = buildAuditReport({ value: 'example.com', type: 'domain', findings: [], cacheInfo: { isCached: true } }, { now: new Date('2026-11-06T00:00:00.000Z') })
  assert.equal(report.schema, 'trustradar.audit-report.v1')
  assert.equal(report.provenance.networkRequestsMade, false)
  assert.equal(report.provenance.cache.isCached, true)
  assert.ok(report.limitations.some(item => item.includes('preliminary local format review')))
})

test('export reports unsupported environments honestly instead of claiming success', async () => {
  delete globalThis.document
  delete globalThis.plus
  const result = await exportAuditReport({ value: 'example.com', type: 'domain', findings: [] })
  assert.equal(result.ok, false)
  assert.equal(result.error, 'export_unsupported')
  assert.equal(result.report.schema, 'trustradar.audit-report.v1')
})


test('clearing the workspace also clears the separate analysis cache', () => {
  installMemoryStorage()
  setAnalysisCacheEntry('trustradar-local-analysis-v1:example.com', { timestamp: 1000, payload: { value: 'example.com' } })
  assert.equal(getAnalysisCacheEntry('trustradar-local-analysis-v1:example.com').entry.payload.value, 'example.com')
  assert.equal(clearWorkspace(), true)
  assert.equal(getAnalysisCacheEntry('trustradar-local-analysis-v1:example.com').entry, null)
})
