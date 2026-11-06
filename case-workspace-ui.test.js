import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../pages/index/index.vue', import.meta.url), 'utf8')

test('case workspace is reachable from desktop and mobile navigation', () => {
  assert.match(page, /id: 'cases', label: 'Case workspace'/)
  assert.match(page, /id: 'cases', short: 'Cases'/)
  assert.match(page, /activeTab === 'cases'/)
})

test('case workspace exposes evidence, observation, note and timeline views', () => {
  for (const phrase of ['Evidence register', 'Observations &amp; analysis', 'Analyst notes', 'Activity timeline']) assert.ok(page.includes(phrase))
})

test('demo mode prevents case edits from mixing simulated and local records', () => {
  assert.match(page, /if \(this\.isDemoMode\) return this\.notify\('Case editing is disabled in demo mode/)
  assert.match(page, /Case workspace paused in demo/)
})

test('case observation UI includes an evidence link control and explicit epistemic labels', () => {
  assert.match(page, /observed_fact/)
  assert.match(page, /Link evidence \(required for observed fact\)/)
})

test('relationship records are visibly labelled as analyst assertions', () => {
  assert.match(page, /Analyst-asserted relationships/)
  assert.match(page, /Analyst assertion, not independently verified/)
})

test('case workspace exposes metadata status and does not claim source reachability', () => {
  assert.match(page, /evidenceMetadataStatus\(ev\)/)
  assert.match(page, /Reachability: not checked/)
})

test('case workspace supports evidence-backed challenges and declared conflict review', () => {
  assert.match(page, /Challenge this finding/)
  assert.match(page, /submitChallenge/)
  assert.match(page, /declaredConflicts/)
  assert.match(page, /Select counter-evidence/)
})
