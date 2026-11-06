/**
 * TrustRadar Pro Features
 * Local-only analysis caching and portable audit-report export.
 * This module does not perform network lookups or create reputation verdicts.
 */
import { getAnalysisCacheEntry, setAnalysisCacheEntry } from './storage.js'

export const ANALYSIS_CACHE_TTL_MS = 5 * 60 * 1000
export const ANALYSIS_CACHE_SCHEMA = 'trustradar-local-analysis-v1'

function makeCacheKey(target) {
  return `${ANALYSIS_CACHE_SCHEMA}:${String(target ?? '').trim().toLowerCase()}`
}

function validCacheEntry(entry, now, ttlMs) {
  return !!(
    entry &&
    typeof entry === 'object' &&
    Number.isFinite(entry.timestamp) &&
    entry.timestamp <= now &&
    now - entry.timestamp < ttlMs &&
    entry.payload &&
    typeof entry.payload === 'object' &&
    !Array.isArray(entry.payload)
  )
}

/**
 * Return a fresh local analysis or a still-valid cached result.
 * `analyzeFn` may be synchronous or asynchronous; no fetch/network is implied.
 */
export async function getCachedOrFetchAnalysis(target, analyzeFn, forceRefresh = false, options = {}) {
  if (typeof analyzeFn !== 'function') throw new TypeError('analyzeFn must be a function')
  const ttlMs = Number.isFinite(options.ttlMs) && options.ttlMs > 0
    ? options.ttlMs
    : ANALYSIS_CACHE_TTL_MS
  const now = Number.isFinite(options.now) ? options.now : Date.now()
  const key = makeCacheKey(target)

  if (!forceRefresh) {
    const cached = getAnalysisCacheEntry(key)
    if (cached.ok && validCacheEntry(cached.entry, now, ttlMs)) {
      return {
        ...cached.entry.payload,
        cacheInfo: {
          isCached: true,
          cachedAt: new Date(cached.entry.timestamp).toISOString(),
          expiresAt: new Date(cached.entry.timestamp + ttlMs).toISOString(),
          persisted: true
        }
      }
    }
  }

  const freshData = await analyzeFn(target)
  if (!freshData || typeof freshData !== 'object' || Array.isArray(freshData)) {
    throw new TypeError('Analysis function must return an object')
  }
  const storedAt = Number.isFinite(options.now) ? options.now : Date.now()
  const stored = setAnalysisCacheEntry(key, { timestamp: storedAt, payload: freshData })
  return {
    ...freshData,
    cacheInfo: {
      isCached: false,
      cachedAt: null,
      expiresAt: new Date(storedAt + ttlMs).toISOString(),
      persisted: stored.ok
    }
  }
}

/** Build a versioned, transparent JSON audit payload. */
export function buildAuditReport(analysisResult, options = {}) {
  if (!analysisResult || typeof analysisResult !== 'object' || Array.isArray(analysisResult)) {
    throw new TypeError('A valid analysis result is required')
  }
  return {
    schema: 'trustradar.audit-report.v1',
    product: 'TrustRadar AIO',
    appVersion: options.appVersion || '3.0.0-alpha.7',
    generatedAt: (options.now instanceof Date ? options.now : new Date()).toISOString(),
    analysis: { ...analysisResult },
    provenance: {
      engine: 'local-format-analysis',
      networkRequestsMade: false,
      externalSourcesUsed: [],
      cache: analysisResult.cacheInfo || { isCached: false, persisted: false }
    },
    limitations: [
      'This report contains a preliminary local format review only.',
      'No DNS, RDAP, reputation, certificate, redirect, mailbox, carrier, or platform lookup was performed.',
      'A syntactically valid indicator is not proof of trustworthiness, identity, ownership, or wrongdoing.',
      'The exported indicator and findings may contain sensitive information; review before sharing.'
    ]
  }
}

function safeFilenamePart(value) {
  const cleaned = String(value || 'audit-report')
    .trim()
    .replace(/[^a-z0-9._-]+/gi, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
    .slice(0, 80)
  return cleaned || 'audit-report'
}

/**
 * Export on H5 using a Blob download, or App-Plus using its private documents
 * directory. Unsupported runtimes receive an explicit failure result.
 */
export async function exportAuditReport(analysisResult, targetName = 'audit-report', options = {}) {
  const report = buildAuditReport(analysisResult, options)
  const json = JSON.stringify(report, null, 2)
  const filename = `TrustRadar_${safeFilenamePart(targetName)}_${Date.now()}.json`

  if (typeof document !== 'undefined' && typeof URL !== 'undefined' && typeof Blob !== 'undefined') {
    let objectUrl
    try {
      objectUrl = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
      return { ok: true, method: 'browser-download', filename, report }
    } catch (error) {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      return { ok: false, error: 'download_failed', detail: String(error?.message || error) }
    }
  }

  if (typeof plus !== 'undefined' && plus.io && typeof plus.io.requestFileSystem === 'function') {
    return new Promise(resolve => {
      const publicDocuments = typeof plus.io.PUBLIC_DOCUMENTS !== 'undefined'
    const fileSystemType = publicDocuments ? plus.io.PUBLIC_DOCUMENTS : plus.io.PRIVATE_DOC
    plus.io.requestFileSystem(fileSystemType, fs => {
        fs.root.getFile(filename, { create: true }, fileEntry => {
          fileEntry.createWriter(writer => {
            writer.onwrite = () => resolve({ ok: true, method: publicDocuments ? 'app-public-documents' : 'app-private-documents', filename, path: fileEntry.toLocalURL(), report })
            writer.onerror = () => resolve({ ok: false, error: 'file_write_failed' })
            writer.write(json)
          }, () => resolve({ ok: false, error: 'file_writer_unavailable' }))
        }, () => resolve({ ok: false, error: 'file_creation_failed' }))
      }, () => resolve({ ok: false, error: 'file_system_unavailable' }))
    })
  }

  return { ok: false, error: 'export_unsupported', report }
}
