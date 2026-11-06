import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeTheme, readTheme, writeTheme, formatLocaleDate, formatLocaleNumber } from '../utils/preferences.js'

test('theme preference is constrained and defaults safely to dark', () => {
  assert.equal(normalizeTheme('light'), 'light')
  assert.equal(normalizeTheme('system'), 'system')
  assert.equal(normalizeTheme('neon'), 'dark')
})
test('theme preference persists through the storage adapter', () => {
  let stored = ''
  const adapter = { setStorageSync: (_key, value) => { stored = value }, getStorageSync: () => stored }
  assert.deepEqual(writeTheme('light', adapter), { ok: true, theme: 'light' })
  assert.equal(readTheme(adapter), 'light')
})
test('locale formatters return stable values and safely handle invalid input', () => {
  assert.match(formatLocaleDate('2026-01-02T00:00:00Z', 'en'), /2026/)
  assert.equal(formatLocaleDate('not-a-date', 'en'), '')
  assert.equal(formatLocaleNumber(1234.5, 'en'), '1,234.5')
  assert.equal(formatLocaleNumber('nope', 'en'), '')
})
