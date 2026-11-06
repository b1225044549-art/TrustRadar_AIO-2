import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const page = readFileSync(new URL('../pages/index/index.vue', import.meta.url), 'utf8')

test('mobile navigation includes a direct settings entry', () => {
  assert.match(page, /activeTab==='settings'/)
  assert.match(page, /@click="go\('settings'\)"/)
})

test('keyboard focus has a visible treatment', () => {
  assert.match(page, /:focus-visible/)
  assert.match(page, /outline: 3px solid/)
})

test('reduced-motion preference is respected', () => {
  assert.match(page, /prefers-reduced-motion: reduce/)
})

test('mobile inputs use a readable text size and safe-area spacing', () => {
  assert.match(page, /font-size: 16px/)
  assert.match(page, /env\(safe-area-inset-bottom\)/)
})

test('visible version metadata consistently identifies alpha.7', () => {
  const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'))
  const app = readFileSync(new URL('../App.vue', import.meta.url), 'utf8')
  assert.equal(manifest.versionName, '3.0.0-alpha.7')
  assert.match(app, /3\.0\.0-alpha\.7 launched/)
  assert.doesNotMatch(page, /3\.0\.0-alpha\.4/)
})

test('dashboard uses accurate labels for locally saved indicators and device data', () => {
  assert.match(page, /SAVED INDICATORS/)
  assert.match(page, /DEVICE DATA/)
})

test('mobile metadata labels receive a readability floor', () => {
  assert.match(page, /\.mobile-nav-item[\s\S]*?font-size: 8px/)
  assert.match(page, /\.demo-scenario-button[\s\S]*?font-size: 8px/)
})


test('analysis workspace exposes cache state, forced refresh, and audit export outside demo mode', () => {
  assert.match(page, /result\.cacheInfo\?\.isCached/)
  assert.match(page, /@click="runSearch\(true\)"/)
  assert.match(page, /@click="exportCurrentReport"/)
  assert.match(page, /v-if="!isDemoMode" class="button-outline" @click="runSearch\(true\)"/)
  assert.match(page, /v-if="!isDemoMode" class="button-outline" :disabled="exportBusy" @click="exportCurrentReport"/)
})
