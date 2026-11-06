// Deterministic, fictional-only fixtures for TrustRadar Demo Mode.
// No network requests, live lookups, real people, or real indicators are used.
const SIM = 'DEMO / SIMULATED'
const iso = (day, hour = 9) => `2026-10-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00.000Z`

const identities = Array.from({ length: 20 }, (_, i) => ({
  id: `demo-identity-${String(i + 1).padStart(2, '0')}`,
  label: `Fictional Entity ${String(i + 1).padStart(2, '0')}`,
  kind: 'fictional_identity', status: SIM,
  note: 'Synthetic training record; not a real person.'
}))
const domains = Array.from({ length: 20 }, (_, i) => ({
  id: `demo-domain-${i + 1}`, value: `node-${String(i + 1).padStart(2, '0')}.example`,
  kind: 'domain', status: SIM, observation: 'Reserved example namespace; no DNS lookup performed.'
}))
const emails = Array.from({ length: 35 }, (_, i) => ({
  id: `demo-email-${i + 1}`, value: `analyst${String(i + 1).padStart(2, '0')}@mail-${(i % 5) + 1}.example`,
  kind: 'email', status: SIM, observation: 'Fictional address; mailbox existence not checked.'
}))
const usernames = Array.from({ length: 40 }, (_, i) => ({
  id: `demo-user-${i + 1}`, value: `@sample_handle_${String(i + 1).padStart(2, '0')}`,
  kind: 'username', status: SIM, observation: 'Synthetic handle; no platform search performed.'
}))
const phones = Array.from({ length: 30 }, (_, i) => ({
  id: `demo-phone-${i + 1}`, value: `+1-202-555-${String(100 + i).padStart(4, '0')}`,
  kind: 'phone', status: SIM, observation: 'Fictional example number; no carrier or subscriber lookup.'
}))
const ips = Array.from({ length: 25 }, (_, i) => ({
  id: `demo-ip-${i + 1}`, value: `192.0.2.${(i % 254) + 1}`,
  kind: 'ip', status: SIM, observation: 'Documentation-only TEST-NET-1 address; not a live host.'
}))
const entities = [...identities, ...domains, ...emails, ...usernames, ...phones, ...ips]

const cases = [
  ['case-domain','Domain Investigation','Review fictional domain records and provenance.'],
  ['case-email','Suspicious Email Review','Document a simulated message and its observable properties.'],
  ['case-footprint','Digital Footprint Review','Compare fictional handles without asserting identity.'],
  ['case-threat','Threat Correlation Exercise','Practice grouping simulated indicators and source notes.'],
  ['case-brand','Brand Impersonation Exercise','Review fictional lookalike examples in a safe dataset.'],
  ['case-url','URL Structure Review','Inspect reserved example URLs without opening them.'],
  ['case-network','Network Indicator Exercise','Review documentation-only IP records.'],
  ['case-mixed','Cross-Source Correlation','Compare synthetic observations across fictional records.']
].map(([id, title, summary], i) => ({ id, title, summary, status: i < 3 ? 'in_review' : 'open', label: SIM, createdAt: iso(i + 1) }))

const sources = Array.from({ length: 30 }, (_, i) => ({
  id: `demo-source-${i + 1}`, name: `Synthetic Training Source ${String(i + 1).padStart(2, '0')}`,
  sourceType: ['fixture','analyst_note','simulated_feed'][i % 3], reliability: 'not_assessed',
  retrievedAt: iso((i % 20) + 1), status: SIM,
  limitation: 'Generated locally for demonstration; not an external source.'
}))
const evidence = Array.from({ length: 100 }, (_, i) => ({
  id: `demo-evidence-${String(i + 1).padStart(3, '0')}`,
  caseId: cases[i % cases.length].id,
  title: `Synthetic evidence item ${String(i + 1).padStart(3, '0')}`,
  type: ['analyst_note','indicator_record','message_metadata','source_snapshot'][i % 4],
  sourceId: sources[i % sources.length].id,
  confidence: ['low','medium','unrated'][i % 3],
  createdAt: iso((i % 20) + 1, 8 + (i % 9)), label: SIM,
  integrity: 'Synthetic fixture; no original external artifact exists.'
}))
const timeline = Array.from({ length: 60 }, (_, i) => ({
  id: `demo-event-${String(i + 1).padStart(3, '0')}`,
  caseId: cases[i % cases.length].id,
  title: ['Fixture loaded','Observation recorded','Evidence linked','Alternative hypothesis noted','Review completed'][i % 5],
  occurredAt: iso((i % 20) + 1, 7 + (i % 12)), label: SIM
}))
const threatFeed = Array.from({ length: 40 }, (_, i) => ({
  id: `demo-feed-${i + 1}`, title: `Simulated training signal ${String(i + 1).padStart(2, '0')}`,
  category: ['domain_pattern','email_pattern','url_pattern','network_example'][i % 4],
  severity: ['informational','low','moderate'][i % 3], label: SIM,
  explanation: 'Synthetic exercise record; not a live threat-intelligence alert.'
}))
const relationships = Array.from({ length: 32 }, (_, i) => ({
  id: `demo-link-${i + 1}`, from: entities[i].id, to: entities[(i * 7 + 11) % entities.length].id,
  relation: ['mentioned_with','same_fixture_group','referenced_by','temporal_proximity'][i % 4],
  rationale: 'Synthetic training relationship only; does not establish identity, ownership, or wrongdoing.',
  confidence: 'unrated', label: SIM
}))

const scenarioMeta = [
  { id: 'domain', title: 'Domain Investigation', description: 'Trace a fictional domain through synthetic observations, evidence, and timeline events.', indicator: 'northstar-labs.example', focus: 'domain' },
  { id: 'email', title: 'Suspicious Email Investigation', description: 'Review a fictional email scenario while separating observable message details from assumptions.', indicator: 'analyst01@mail-1.example', focus: 'email' },
  { id: 'footprint', title: 'Digital Footprint Investigation', description: 'Compare synthetic handles and records without treating similarity as proof of identity.', indicator: '@sample_handle_01', focus: 'username' },
  { id: 'threat', title: 'Threat Correlation', description: 'Practice correlating reserved example domains and documentation-only IP addresses.', indicator: '192.0.2.44', focus: 'ip' }
]

export function listDemoScenarios() {
  return scenarioMeta.map(({ id, title }) => ({ id, title }))
}

export function buildDemoScenario(id = 'domain') {
  const meta = scenarioMeta.find(item => item.id === id) || scenarioMeta[0]
  const copy = value => JSON.parse(JSON.stringify(value))
  const recent = [
    { value: meta.indicator, type: meta.focus, checkedAt: iso(20), status: SIM, demo: true },
    { value: 'northstar-labs.example', type: 'domain', checkedAt: iso(19), status: SIM, demo: true },
    { value: 'analyst01@mail-1.example', type: 'email', checkedAt: iso(18), status: SIM, demo: true },
    { value: '192.0.2.44', type: 'ip', checkedAt: iso(17), status: SIM, demo: true },
    { value: 'sample_handle_01', type: 'username', checkedAt: iso(16), status: SIM, demo: true }
  ]
  const saved = [recent[0], recent[1], recent[3]].map((item, i) => ({ ...item, savedAt: iso(20 - i), demo: true }))
  const reports = [
    { id: `demo-report-${meta.id}-1`, indicator: meta.indicator, category: 'Training observation', description: '[DEMO] Synthetic observation for the selected scenario.', createdAt: iso(20), verification: 'simulated', demo: true },
    { id: `demo-report-${meta.id}-2`, indicator: 'northstar-labs.example', category: 'Source review', description: '[DEMO] Example-only record; no external verification was attempted.', createdAt: iso(19), verification: 'simulated', demo: true }
  ]
  return copy({
    ...meta, label: SIM, mode: SIM, isSynthetic: true, generatedAt: iso(20),
    stats: { identities: 20, phones: 30, emails: 35, domains: 20, usernames: 40, ips: 25, cases: 8, evidence: 100, timelineEvents: 60, simulatedFeed: 40, sources: 30, relationships: 32 },
    recent: recent.map(x => ({ ...x, demo: true })), saved: saved.map(x => ({ ...x, demo: true })), reports: reports.map(x => ({ ...x, demo: true })), cases, entities, evidence, timeline, sources, threatFeed, relationships,
    notes: [
      { id: 'demo-note-1', text: 'Observed value comes from a synthetic fixture.', classification: 'fact', evidenceId: 'demo-evidence-001', label: SIM },
      { id: 'demo-note-2', text: 'A possible relationship may warrant review in this exercise.', classification: 'hypothesis', evidenceId: null, label: SIM }
    ],
    hypotheses: [
      { id: 'demo-hypothesis-1', statement: 'Records may belong to the same synthetic exercise group.', supporting: ['demo-evidence-001'], opposing: ['demo-evidence-002'], status: 'unresolved', label: SIM }
    ],
    safeguards: ['No external network requests', 'No real people or private accounts', 'No live reputation or threat verdicts', 'All records reset when the demo is reloaded']
  })
}
