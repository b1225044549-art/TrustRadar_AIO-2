const KEY = 'trustradar_local_v2'
const RECENT_KEY = 'trustradar_recent_v2'
const ANALYSIS_CACHE_KEY = 'trustradar_analysis_cache_v1'
const ANALYSIS_CACHE_LIMIT = 50
const EMPTY = () => ({ reports: [], saved: [] })

function normalize(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return EMPTY()
  return {
    reports: Array.isArray(data.reports) ? data.reports.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : [],
    saved: Array.isArray(data.saved) ? data.saved.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : []
  }
}

function getStorageAdapter() {
  if (typeof uni !== 'undefined' &&
      typeof uni.getStorageSync === 'function' &&
      typeof uni.setStorageSync === 'function' &&
      typeof uni.removeStorageSync === 'function') {
    return {
      name: 'uni',
      read: key => uni.getStorageSync(key),
      write: (key, value) => uni.setStorageSync(key, value),
      remove: key => uni.removeStorageSync(key)
    }
  }
  if (typeof localStorage !== 'undefined' &&
      typeof localStorage.getItem === 'function' &&
      typeof localStorage.setItem === 'function' &&
      typeof localStorage.removeItem === 'function') {
    return {
      name: 'browser',
      read: key => {
        const raw = localStorage.getItem(key)
        return raw === null ? null : JSON.parse(raw)
      },
      write: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
      remove: key => localStorage.removeItem(key)
    }
  }
  return null
}

function readKey(adapter, key) {
  try {
    return { ok: true, value: adapter.read(key) }
  } catch {
    return { ok: false, value: null }
  }
}

function readAllState() {
  const adapter = getStorageAdapter()
  if (!adapter) return { ok: false, data: EMPTY(), storage: 'unavailable' }
  const result = readKey(adapter, KEY)
  if (!result.ok) return { ok: false, data: EMPTY(), storage: 'unreadable' }
  if (!isEmptyStoredValue(result.value) && (typeof result.value !== 'object' || Array.isArray(result.value))) {
    return { ok: false, data: EMPTY(), storage: 'invalid' }
  }
  return { ok: true, data: normalize(result.value), storage: adapter.name }
}

function writeAll(data) {
  const safeData = normalize(data)
  const adapter = getStorageAdapter()
  if (!adapter) return { ...safeData, persisted: false, storage: 'unavailable' }
  try {
    adapter.write(KEY, safeData)
    return { ...safeData, persisted: true, storage: adapter.name }
  } catch {
    return { ...safeData, persisted: false, storage: 'unavailable' }
  }
}

export function getDataState() {
  return readAllState()
}

export function getData() {
  return readAllState().data
}

export function getRecentState() {
  const adapter = getStorageAdapter()
  if (!adapter) return { ok: false, recent: [], storage: 'unavailable' }
  const result = readKey(adapter, RECENT_KEY)
  if (!result.ok) return { ok: false, recent: [], storage: 'unreadable' }
  if (!isEmptyStoredValue(result.value) && !Array.isArray(result.value)) {
    return { ok: false, recent: [], storage: 'invalid' }
  }
  const recent = Array.isArray(result.value)
    ? result.value.filter(item => item && typeof item === 'object' && !Array.isArray(item)).slice(0, 30)
    : []
  return { ok: true, recent, storage: adapter.name }
}

export function getRecent() {
  return getRecentState().recent
}

export function setRecent(items) {
  const adapter = getStorageAdapter()
  if (!adapter) return { persisted: false, storage: 'unavailable', recent: [] }
  const current = readKey(adapter, RECENT_KEY)
  if (!current.ok || (!isEmptyStoredValue(current.value) && !Array.isArray(current.value))) {
    return { persisted: false, storage: current.ok ? 'invalid' : 'unreadable', recent: [] }
  }
  const safeItems = Array.isArray(items)
    ? items.filter(item => item && typeof item === 'object' && !Array.isArray(item)).slice(0, 30)
    : []
  try {
    adapter.write(RECENT_KEY, safeItems)
    return { persisted: true, storage: adapter.name, recent: safeItems }
  } catch {
    return { persisted: false, storage: 'unavailable', recent: safeItems }
  }
}

function mutateData(mutator) {
  const state = readAllState()
  if (!state.ok) return { ...EMPTY(), persisted: false, storage: state.storage }
  const data = state.data
  mutator(data)
  return writeAll(data)
}

export function addReport(report) {
  return mutateData(data => data.reports.unshift({ ...report }))
}

export function toggleSaved(item) {
  return mutateData(data => {
    const index = data.saved.findIndex(entry => entry.value === item.value && entry.type === item.type)
    if (index >= 0) data.saved.splice(index, 1)
    else data.saved.unshift({ ...item })
  })
}

export function removeSaved(item) {
  return mutateData(data => {
    data.saved = data.saved.filter(entry => !(entry.value === item.value && entry.type === item.type))
  })
}

function isEmptyStoredValue(value) {
  return value === null || value === undefined || value === ''
}


/** Read one local analysis-cache entry without touching workspace records. */
export function getAnalysisCacheEntry(cacheKey) {
  const adapter = getStorageAdapter()
  if (!adapter) return { ok: false, entry: null, storage: 'unavailable' }
  const result = readKey(adapter, ANALYSIS_CACHE_KEY)
  if (!result.ok) return { ok: false, entry: null, storage: 'unreadable' }
  const cache = result.value
  if (isEmptyStoredValue(cache)) return { ok: true, entry: null, storage: adapter.name }
  if (!cache || typeof cache !== 'object' || Array.isArray(cache)) {
    return { ok: false, entry: null, storage: 'invalid' }
  }
  const entry = cache[cacheKey]
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return { ok: true, entry: null, storage: adapter.name }
  }
  return { ok: true, entry, storage: adapter.name }
}

/** Store a bounded cache entry; cache failures never affect reports or cases. */
export function setAnalysisCacheEntry(cacheKey, entry) {
  const adapter = getStorageAdapter()
  if (!adapter) return { ok: false, storage: 'unavailable' }
  const current = readKey(adapter, ANALYSIS_CACHE_KEY)
  if (!current.ok) return { ok: false, storage: 'unreadable' }
  const cache = current.value && typeof current.value === 'object' && !Array.isArray(current.value)
    ? { ...current.value }
    : {}
  cache[cacheKey] = entry
  const keys = Object.keys(cache)
  while (keys.length > ANALYSIS_CACHE_LIMIT) delete cache[keys.shift()]
  try {
    adapter.write(ANALYSIS_CACHE_KEY, cache)
    return { ok: true, storage: adapter.name }
  } catch {
    return { ok: false, storage: 'unavailable' }
  }
}

export function removeAnalysisCacheEntry(cacheKey) {
  const adapter = getStorageAdapter()
  if (!adapter) return { ok: false, storage: 'unavailable' }
  const current = readKey(adapter, ANALYSIS_CACHE_KEY)
  if (!current.ok) return { ok: false, storage: 'unreadable' }
  const cache = current.value && typeof current.value === 'object' && !Array.isArray(current.value)
    ? { ...current.value }
    : {}
  delete cache[cacheKey]
  try {
    adapter.write(ANALYSIS_CACHE_KEY, cache)
    return { ok: true, storage: adapter.name }
  } catch {
    return { ok: false, storage: 'unavailable' }
  }
}

export function clearWorkspace() {
  const adapter = getStorageAdapter()
  if (!adapter) return false
  try {
    adapter.remove(KEY)
    adapter.remove(RECENT_KEY)
    adapter.remove(ANALYSIS_CACHE_KEY)
    const mainAfter = readKey(adapter, KEY)
    const recentAfter = readKey(adapter, RECENT_KEY)
    const cacheAfter = readKey(adapter, ANALYSIS_CACHE_KEY)
    return mainAfter.ok && recentAfter.ok && cacheAfter.ok &&
      isEmptyStoredValue(mainAfter.value) && isEmptyStoredValue(recentAfter.value) &&
      isEmptyStoredValue(cacheAfter.value)
  } catch {
    return false
  }
}
