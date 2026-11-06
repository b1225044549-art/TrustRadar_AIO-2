import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addCaseNote, addEvidence, addObservation, addRelationship, buildCaseSummary,
  assessEvidenceMetadata, buildCaseReport, challengeObservation, compareCaseSnapshots,
  createInvestigation, emptyInvestigationStore, findDeclaredEvidenceConflicts, readInvestigationStore,
  setCaseStatus, validateInvestigationStore, writeInvestigationStore
} from '../utils/investigations.js'

function memoryStorage() {
  const map = new Map()
  return { getItem: key => map.has(key) ? map.get(key) : null, setItem: (key, value) => map.set(key, value) }
}

test('creates a clean case and rejects empty titles', () => {
  assert.equal(createInvestigation({ title: '  ' }).error, 'title_required')
  const result = createInvestigation({ title: 'Domain review', tags: ['osint', 'osint', ''] }, { id: 'case-1', now: '2026-11-05T00:00:00Z' })
  assert.equal(result.ok, true)
  assert.deepEqual(result.case.tags, ['osint'])
  assert.equal(result.case.timeline[0].type, 'case_created')
})

test('evidence validates source URLs and records provenance limitations', () => {
  const item = createInvestigation({ title: 'Evidence test' }).case
  assert.equal(addEvidence(item, { title: 'bad', sourceUrl: 'javascript:alert(1)' }).error, 'invalid_source_url')
  const result = addEvidence(item, { title: 'Public page capture', kind: 'public_source', sourceName: 'Example', sourceUrl: 'https://example.org/page', limitations: 'Page content not independently authenticated.' })
  assert.equal(result.ok, true)
  assert.equal(result.evidence.integrity.status, 'not_hashed')
  assert.ok(result.evidence.addedAt)
})

test('observed facts require linked evidence; interpretations remain explicitly labelled', () => {
  const item = createInvestigation({ title: 'Observation test' }).case
  assert.equal(addObservation(item, { claim: 'A claim', kind: 'observed_fact' }).error, 'fact_requires_linked_evidence')
  const evidence = addEvidence(item, { title: 'Analyst-provided record' }).evidence
  const fact = addObservation(item, { claim: 'Record contains this text', kind: 'observed_fact', evidenceId: evidence.id })
  const hypothesis = addObservation(item, { claim: 'Possible connection', kind: 'hypothesis' })
  assert.equal(fact.ok, true)
  assert.match(fact.observation.disclaimer, /authenticity is not independently established/)
  assert.equal(hypothesis.observation.kind, 'hypothesis')
})

test('relationships require distinct endpoints and an explicit basis', () => {
  const item = createInvestigation({ title: 'Relationship test' }).case
  assert.equal(addRelationship(item, { from: 'A', to: 'A', relation: 'same person', basis: 'match' }).ok, false)
  assert.equal(addRelationship(item, { from: 'A', to: 'B', relation: 'co-mentioned', basis: 'Both appear in the same public report.' }).ok, true)
})

test('notes, status transitions and summary remain transparent', () => {
  const item = createInvestigation({ title: 'Summary test' }).case
  assert.equal(addCaseNote(item, { body: 'Review source date.' }).ok, true)
  assert.equal(setCaseStatus(item, 'in_review').ok, true)
  const summary = buildCaseSummary(item)
  assert.equal(summary.status, 'in_review')
  assert.equal(summary.counts.notes, 1)
  assert.match(summary.caution, /not a measure of truth/)
})

test('store validates schema and fails closed on corrupt or unsupported data', () => {
  const storage = memoryStorage()
  const store = emptyInvestigationStore()
  store.cases.push(createInvestigation({ title: 'Stored case' }, { id: 'case-store' }).case)
  assert.equal(writeInvestigationStore(store, storage).ok, true)
  assert.equal(readInvestigationStore(storage).store.cases.length, 1)
  storage.setItem('trustradar.investigations.v1', '{broken')
  assert.equal(readInvestigationStore(storage).ok, false)
  assert.equal(readInvestigationStore(storage).reason, 'storage_unreadable')
  assert.equal(validateInvestigationStore({ schemaVersion: 99, cases: [] }).reason, 'unsupported_schema')
})


test('source metadata assessment never claims reachability, authenticity or factual accuracy', () => {
  const evidence = addEvidence(createInvestigation({ title: 'Source quality' }).case, {
    title: 'Public advisory reference', kind: 'public_source', sourceName: 'Official publisher',
    sourceUrl: 'https://example.org/advisory', limitations: 'Publication metadata only.'
  }, { now: '2026-10-01T00:00:00Z' }).evidence
  const assessment = assessEvidenceMetadata(evidence, { now: '2026-10-10T00:00:00Z' })
  assert.equal(assessment.metadataStatus, 'complete')
  assert.equal(assessment.sourceReachability, 'not_checked')
  assert.equal(assessment.sourceAuthenticity, 'not_independently_verified')
  assert.equal(assessment.factualAccuracy, 'not_assessed')
  assert.equal(assessment.freshness, 'within_window')
})

test('declared evidence conflicts require an explicit shared subject and opposing analyst positions', () => {
  const conflicts = findDeclaredEvidenceConflicts([
    { id: 'obs-1', subjectKey: 'domain ownership', stance: 'supports' },
    { id: 'obs-2', subjectKey: 'DOMAIN OWNERSHIP', stance: 'contradicts' },
    { id: 'obs-3', claim: 'unrelated statement', stance: 'contradicts' }
  ])
  assert.equal(conflicts.length, 1)
  assert.deepEqual(conflicts[0].supports, ['obs-1'])
  assert.deepEqual(conflicts[0].contradicts, ['obs-2'])
  assert.equal(conflicts[0].resolution, 'unresolved')
})

test('Challenge This Finding requires counter-evidence and preserves the original observation', () => {
  const item = createInvestigation({ title: 'Challenge workflow' }).case
  const originalEvidence = addEvidence(item, { title: 'Initial source record' }).evidence
  const observation = addObservation(item, { claim: 'A recorded observation', kind: 'observed_fact', evidenceId: originalEvidence.id }).observation
  assert.equal(challengeObservation(item, observation.id, { rationale: 'Counter evidence missing' }).error, 'counter_evidence_required')
  const counterEvidence = addEvidence(item, { title: 'Counter-source record' }).evidence
  const challenged = challengeObservation(item, observation.id, { counterEvidenceId: counterEvidence.id, rationale: 'The second record contradicts the initial interpretation.' }, { id: 'challenge-1', now: '2026-11-06T00:00:00Z' })
  assert.equal(challenged.ok, true)
  assert.equal(observation.reviewStatus, 'challenged')
  assert.equal(item.challenges.length, 1)
  assert.equal(item.challenges[0].reviewOutcome, 'undetermined')
})

test('snapshot comparison reports record-level changes without judging truth', () => {
  const before = createInvestigation({ title: 'Snapshot' }, { id: 'case-snapshot', now: '2026-11-01T00:00:00Z' }).case
  const oldEvidence = addEvidence(before, { title: 'Old evidence' }, { id: 'e-old' }).evidence
  const after = JSON.parse(JSON.stringify(before))
  addEvidence(after, { title: 'New evidence' }, { id: 'e-new' })
  after.status = 'in_review'
  const diff = compareCaseSnapshots(before, after)
  assert.equal(diff.ok, true)
  assert.deepEqual(diff.evidence.added, ['e-new'])
  assert.equal(diff.status.changed, true)
  assert.match(diff.limitation, /not proof/)
  assert.equal(oldEvidence.id, 'e-old')
  assert.equal(compareCaseSnapshots(before, { ...after, id: 'different-case' }).ok, false)
})

test('case report exports provenance assessments and explicit limitations', () => {
  const item = createInvestigation({ title: 'Report export' }, { id: 'case-report' }).case
  const evidence = addEvidence(item, { title: 'Reference', sourceName: 'Publisher', sourceUrl: 'https://example.org', limitations: 'Not fetched.' }, { id: 'e-report' }).evidence
  addObservation(item, { claim: 'A cautious interpretation', kind: 'inference', subjectKey: 'sample', stance: 'neutral' }, { id: 'o-report' })
  const built = buildCaseReport(item, { generatedAt: '2026-11-06T00:00:00Z' })
  assert.equal(built.ok, true)
  assert.equal(built.report.schema, 'trustradar.case-report.v1')
  assert.equal(built.report.evidence[0].metadataAssessment.sourceReachability, 'not_checked')
  assert.ok(built.report.limitations.length >= 4)
  assert.equal(buildCaseReport(null).ok, false)
})
