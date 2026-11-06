import test from 'node:test'
import assert from 'node:assert/strict'
import { listDemoScenarios, buildDemoScenario } from '../utils/demo.js'

const expected = { identities:20, phones:30, emails:35, domains:20, usernames:40, ips:25, cases:8, evidence:100, timelineEvents:60, simulatedFeed:40, sources:30, relationships:32 }

test('demo catalog exposes four distinct scenarios', () => {
  assert.deepEqual(listDemoScenarios().map(x => x.id), ['domain','email','footprint','threat'])
})
test('every demo record is visibly marked as simulated', () => {
  for (const scenario of listDemoScenarios()) {
    const data = buildDemoScenario(scenario.id)
    assert.equal(data.mode, 'DEMO / SIMULATED')
    for (const item of [...data.recent, ...data.saved, ...data.reports]) assert.equal(item.demo, true)
  }
})
test('unknown demo scenario falls back safely to domain scenario', () => {
  assert.equal(buildDemoScenario('not-a-scenario').id, 'domain')
})
test('demo fixtures use reserved example domains', () => {
  const data = buildDemoScenario('domain')
  assert.ok(data.recent.every(item => !item.value || !/^(?!.*\.example$).*\.[a-z]{2,}$/i.test(item.value.split('/')[0].split('@').pop())))
})
test('expanded inventory is available in all four scenarios', () => {
  for (const {id} of listDemoScenarios()) {
    const d = buildDemoScenario(id)
    assert.deepEqual(d.stats, expected)
    assert.equal(d.cases.length, 8); assert.equal(d.entities.length, 170)
    assert.equal(d.evidence.length, 100); assert.equal(d.timeline.length, 60)
    assert.equal(d.sources.length, 30); assert.equal(d.threatFeed.length, 40)
    assert.equal(d.relationships.length, 32)
  }
})
test('expanded fixtures use reserved domains and documentation-only IP space', () => {
  const d = buildDemoScenario('threat')
  assert.ok(d.entities.filter(x => x.kind === 'domain').every(x => x.value.endsWith('.example')))
  assert.ok(d.entities.filter(x => x.kind === 'ip').every(x => x.value.startsWith('192.0.2.')))
  assert.ok(d.entities.filter(x => x.kind === 'email').every(x => x.value.endsWith('.example')))
})
test('fixtures are deep-copied and limitations remain explicit', () => {
  const a = buildDemoScenario('domain'); a.evidence[0].title = 'mutated'; a.cases.pop()
  const b = buildDemoScenario('domain')
  assert.notEqual(b.evidence[0].title, 'mutated'); assert.equal(b.cases.length, 8)
  assert.equal(b.isSynthetic, true); assert.ok(b.safeguards.length >= 4)
  assert.ok(b.sources.every(x => x.reliability === 'not_assessed'))
  assert.ok(b.hypotheses.every(x => x.status === 'unresolved'))
})

test('all expanded inventory records are labelled as synthetic', () => {
  const d = buildDemoScenario('domain')
  for (const item of [...d.entities, ...d.cases, ...d.evidence, ...d.timeline, ...d.sources, ...d.threatFeed, ...d.relationships]) {
    assert.ok(item.status === 'DEMO / SIMULATED' || item.label === 'DEMO / SIMULATED', `unlabelled record: ${item.id}`)
  }
})

test('synthetic relationships use distinct entity endpoints', () => {
  const d = buildDemoScenario('threat')
  const ids = new Set(d.entities.map(x => x.id))
  for (const link of d.relationships) {
    assert.ok(ids.has(link.from)); assert.ok(ids.has(link.to)); assert.notEqual(link.from, link.to)
  }
})
