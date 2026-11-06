import test from 'node:test'
import assert from 'node:assert/strict'
import { detectType, analyzeIndicator } from '../utils/analyzer.js'

test('detects supported indicator formats conservatively', () => {
  assert.equal(detectType('person@example.com'), 'email')
  assert.equal(detectType('https://example.com/login'), 'url')
  assert.equal(detectType('example.com'), 'domain')
  assert.equal(detectType('+201012345678'), 'phone')
  assert.equal(detectType('@sample_user'), 'username')
})

test('rejects unsupported schemes and embedded URL credentials', () => {
  assert.equal(detectType('javascript:alert(1)'), 'unknown')
  assert.equal(detectType('https://user:pass@example.com'), 'unknown')
})

test('rejects empty and oversized inputs', () => {
  assert.equal(detectType('   '), 'unknown')
  assert.equal(detectType('x'.repeat(2049)), 'unknown')
})

test('analysis never invents a reputation score', () => {
  const result = analyzeIndicator('example.com')
  assert.equal(result.type, 'domain')
  assert.equal(result.score, null)
  assert.match(result.confidence, /No reputation confidence/)
})

test('URL analysis states that no destination request was sent', () => {
  const result = analyzeIndicator('https://example.com/path')
  assert.equal(result.type, 'url')
  assert.ok(result.findings.some(x => /No request was sent/.test(x.detail)))
})
