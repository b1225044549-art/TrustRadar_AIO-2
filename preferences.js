const THEME_KEY = 'trustradar.theme.v1'
export const SUPPORTED_THEMES = Object.freeze(['dark', 'light', 'system'])

export function normalizeTheme(theme) {
  return SUPPORTED_THEMES.includes(String(theme || '').toLowerCase()) ? String(theme).toLowerCase() : 'dark'
}
export function readTheme(storage = globalThis.uni) {
  try {
    const value = storage?.getStorageSync?.(THEME_KEY)
    if (value) return normalizeTheme(value)
  } catch (_) { /* try web storage */ }
  try { return normalizeTheme(globalThis.localStorage?.getItem(THEME_KEY)) } catch (_) { return 'dark' }
}
export function writeTheme(theme, storage = globalThis.uni) {
  const value = normalizeTheme(theme)
  try {
    if (storage?.setStorageSync) { storage.setStorageSync(THEME_KEY, value); return { ok: true, theme: value } }
  } catch (_) { /* try web storage */ }
  try {
    if (globalThis.localStorage) { globalThis.localStorage.setItem(THEME_KEY, value); return { ok: true, theme: value } }
  } catch (_) { /* unavailable */ }
  return { ok: false, theme: value }
}
export function formatLocaleDate(value, locale = 'en', options = {}) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try { return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', ...options }).format(date) }
  catch (_) { return date.toISOString().slice(0, 10) }
}
export function formatLocaleNumber(value, locale = 'en', options = {}) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  try { return new Intl.NumberFormat(locale, options).format(number) }
  catch (_) { return String(number) }
}
