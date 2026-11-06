import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeLocale, translate, getLocaleMeta, writeLocale, readLocale } from '../utils/i18n.js'

test('supports the five product locales and falls back safely', () => {
  assert.deepEqual(['en','ar','fr','de','zh-cn'].map(normalizeLocale), ['en','ar','fr','de','zh-cn'])
  assert.equal(normalizeLocale('es-MX'), 'en')
  assert.equal(normalizeLocale('AR-eg'), 'ar')
})
test('Arabic is RTL and the other supported locales are LTR', () => {
  assert.equal(getLocaleMeta('ar').dir, 'rtl')
  for (const lang of ['en','fr','de','zh-cn']) assert.equal(getLocaleMeta(lang).dir, 'ltr')
})
test('core navigation labels exist in all five locales', () => {
  for (const lang of ['en','ar','fr','de','zh-cn']) {
    for (const key of ['overview','investigate','reports','newReport','saved','settings','language','appearance','appearanceHelp','dark','light','system','themeChanged']) {
      assert.notEqual(translate(lang, key), key, `${lang}:${key}`)
    }
  }
})
test('language preference persists through the supplied storage adapter', () => {
  let stored = ''
  const adapter = { setStorageSync: (_key, value) => { stored = value }, getStorageSync: () => stored }
  assert.deepEqual(writeLocale('zh-cn', adapter), { ok: true, locale: 'zh-cn' })
  assert.equal(readLocale(adapter), 'zh-cn')
})
test('invalid language values are normalized before persistence', () => {
  let stored = ''
  const adapter = { setStorageSync: (_key, value) => { stored = value }, getStorageSync: () => stored }
  writeLocale('xx', adapter)
  assert.equal(stored, 'en')
})
