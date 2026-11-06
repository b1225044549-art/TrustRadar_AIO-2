/**
 * TrustRadar local investigation core.
 * This module stores analyst-authored case records only; it never fetches URLs,
 * identifies people, or treats a correlation as proof of identity.
 */
export const CASE_SCHEMA_VERSION = 1
export const CASE_STATUSES = Object.freeze(['open', 'in_review', 'closed'])
export const OBSERVATION_KINDS = Object.freeze(['observed_fact', 'inference', 'hypothesis'])
export const CONFIDENCE_LEVELS = Object.freeze(['low', 'medium', 'high'])

const STORE_KEY = 'trustradar.investigations.v1'
const MAX_CASES = 500
const MAX_EVIDENCE = 1000
const MAX_TEXT = 4000

const cleanText = (value, max = MAX_TEXT) => String(value ?? '').trim().slice(0, max)
const makeId = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
const validDate = (value) => {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
const confidence = (value) => CONFIDENCE_LEVELS.includes(value) ? value : 'low'

export function emptyInvestigationStore() {
  return { schemaVersion: CASE_SCHEMA_VERSION, cases: [] }
}

export function validateInvestigationStore(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, reason: 'invalid_root' }
  if (input.schemaVersion !== CASE_SCHEMA_VERSION) return { ok: false, reason: 'unsupported_schema' }
  if (!Array.isArray(input.cases) || input.cases.length > MAX_CASES) return { ok: false, reason: 'invalid_cases' }
  const ids = new Set()
  for (const item of input.cases) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.id !== 'string' || !item.id || ids.has(item.id)) {
      return { ok: false, reason: 'invalid_or_duplicate_case' }
    }
    ids.add(item.id)
    if (!CASE_STATUSES.includes(item.status) || !Array.isArray(item.evidence) || !Array.isArray(item.observations) || !Array.isArray(item.notes) || !Array.isArray(item.relationships) || !Array.isArray(item.timeline) || (item.challenges !== undefined && !Array.isArray(item.challenges))) {
      return { ok: false, reason: 'invalid_case_shape' }
    }
    if (item.evidence.length > MAX_EVIDENCE) return { ok: false, reason: 'evidence_limit' }
  }
  return { ok: true }
}

export function createInvestigation(input, options = {}) {
  const title = cleanText(input?.title, 160)
  if (!title) return { ok: false, error: 'title_required' }
  const now = validDate(options.now) || new Date().toISOString()
  const id = options.id || makeId('case')
  const item = {
    id, title, objective: cleanText(input?.objective, 1000),
    status: 'open', tags: Array.isArray(input?.tags) ? [...new Set(input.tags.map(x => cleanText(x, 32)).filter(Boolean))].slice(0, 20) : [],
    createdAt: now, updatedAt: now, evidence: [], observations: [], notes: [], relationships: [], challenges: [], timeline: [
      { id: makeId('event'), type: 'case_created', summary: 'Investigation created', occurredAt: now }
    ]
  }
  return { ok: true, case: item }
}

function appendEvent(item, type, summary, now) {
  item.timeline.push({ id: makeId('event'), type, summary: cleanText(summary, 240), occurredAt: now })
  item.updatedAt = now
}

export function addEvidence(caseItem, input, options = {}) {
  if (!caseItem || !Array.isArray(caseItem.evidence)) return { ok: false, error: 'invalid_case' }
  if (caseItem.evidence.length >= MAX_EVIDENCE) return { ok: false, error: 'evidence_limit' }
  const title = cleanText(input?.title, 160)
  if (!title) return { ok: false, error: 'title_required' }
  const now = validDate(options.now) || new Date().toISOString()
  const sourceUrl = cleanText(input?.sourceUrl, 2048)
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl)
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return { ok: false, error: 'invalid_source_url' }
    } catch { return { ok: false, error: 'invalid_source_url' } }
  }
  const evidence = {
    id: options.id || makeId('evidence'), title,
    kind: ['user_supplied', 'public_source', 'analyst_note', 'file_reference'].includes(input?.kind) ? input.kind : 'user_supplied',
    description: cleanText(input?.description), sourceName: cleanText(input?.sourceName, 160), sourceUrl,
    observedAt: input?.observedAt ? (validDate(input.observedAt) || now) : now, addedAt: now,
    confidence: confidence(input?.confidence), limitations: cleanText(input?.limitations, 1000),
    integrity: { hash: null, algorithm: null, status: 'not_hashed' }
  }
  caseItem.evidence.push(evidence)
  appendEvent(caseItem, 'evidence_added', `Evidence added: ${title}`, now)
  return { ok: true, evidence }
}

export function addObservation(caseItem, input, options = {}) {
  if (!caseItem || !Array.isArray(caseItem.observations)) return { ok: false, error: 'invalid_case' }
  const claim = cleanText(input?.claim, 1000)
  if (!claim) return { ok: false, error: 'claim_required' }
  const kind = OBSERVATION_KINDS.includes(input?.kind) ? input.kind : 'hypothesis'
  const evidenceId = cleanText(input?.evidenceId, 100)
  if (kind === 'observed_fact' && (!evidenceId || !caseItem.evidence.some(x => x.id === evidenceId))) return { ok: false, error: 'fact_requires_linked_evidence' }
  const now = validDate(options.now) || new Date().toISOString()
  const observation = {
    id: options.id || makeId('observation'), claim, kind,
    evidenceId: evidenceId || null,
    confidence: confidence(input?.confidence),
    rationale: cleanText(input?.rationale, 1000),
    subjectKey: cleanText(input?.subjectKey, 120).toLowerCase(),
    stance: ['supports', 'contradicts', 'neutral'].includes(input?.stance) ? input.stance : 'neutral',
    reviewStatus: 'unreviewed',
    createdAt: now,
    disclaimer: kind === 'observed_fact' ? 'Recorded as an observation linked to evidence; authenticity is not independently established.' : 'Analyst interpretation; not an established fact.'
  }
  caseItem.observations.push(observation)
  appendEvent(caseItem, 'observation_added', `${kind.replaceAll('_', ' ')} added`, now)
  return { ok: true, observation }
}

export function addRelationship(caseItem, input, options = {}) {
  if (!caseItem || !Array.isArray(caseItem.relationships)) return { ok: false, error: 'invalid_case' }
  const from = cleanText(input?.from, 100)
  const to = cleanText(input?.to, 100)
  const relation = cleanText(input?.relation, 80)
  const basis = cleanText(input?.basis, 1000)
  if (!from || !to || from === to || !relation || !basis) return { ok: false, error: 'relationship_requires_distinct_endpoints_and_basis' }
  const now = validDate(options.now) || new Date().toISOString()
  const item = { id: options.id || makeId('relation'), from, to, relation, basis, confidence: confidence(input?.confidence), createdAt: now, status: 'analyst_asserted' }
  caseItem.relationships.push(item)
  appendEvent(caseItem, 'relationship_added', `Relationship recorded: ${relation}`, now)
  return { ok: true, relationship: item }
}

export function addCaseNote(caseItem, input, options = {}) {
  if (!caseItem || !Array.isArray(caseItem.notes)) return { ok: false, error: 'invalid_case' }
  const body = cleanText(input?.body)
  if (!body) return { ok: false, error: 'note_required' }
  const now = validDate(options.now) || new Date().toISOString()
  const note = { id: options.id || makeId('note'), body, createdAt: now, authorLabel: cleanText(input?.authorLabel, 80) || 'Local analyst' }
  caseItem.notes.push(note)
  appendEvent(caseItem, 'note_added', 'Analyst note added', now)
  return { ok: true, note }
}

export function setCaseStatus(caseItem, status, options = {}) {
  if (!caseItem || !CASE_STATUSES.includes(status)) return { ok: false, error: 'invalid_status' }
  const now = validDate(options.now) || new Date().toISOString()
  caseItem.status = status
  appendEvent(caseItem, 'status_changed', `Status changed to ${status}`, now)
  return { ok: true, case: caseItem }
}

export function buildCaseSummary(caseItem) {
  if (!caseItem) return null
  const counts = { evidence: caseItem.evidence?.length || 0, observations: caseItem.observations?.length || 0, notes: caseItem.notes?.length || 0, relationships: caseItem.relationships?.length || 0, challenges: caseItem.challenges?.length || 0 }
  return {
    id: caseItem.id, title: caseItem.title, status: caseItem.status,
    counts, createdAt: caseItem.createdAt, updatedAt: caseItem.updatedAt,
    evidenceCoverage: counts.observations ? Math.round((caseItem.observations.filter(x => x.evidenceId).length / counts.observations) * 100) : 0,
    caution: 'Coverage describes linkage only; it is not a measure of truth, completeness, or investigation quality.'
  }
}


/**
 * Metadata-only source assessment. It never fetches a URL and never claims
 * that a source is authentic, reachable, or factually correct.
 */
export function assessEvidenceMetadata(evidence, options = {}) {
  const now = validDate(options.now) || new Date().toISOString()
  const observedAt = validDate(evidence?.observedAt)
  const sourceUrl = cleanText(evidence?.sourceUrl, 2048)
  let validUrl = false
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl)
      validUrl = ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password
    } catch { validUrl = false }
  }
  const ageDays = observedAt ? Math.floor((Date.parse(now) - Date.parse(observedAt)) / 86400000) : null
  const staleAfterDays = Number.isFinite(options.staleAfterDays) ? Math.max(1, options.staleAfterDays) : 90
  const freshness = ageDays === null || ageDays < 0 ? 'unknown' : ageDays > staleAfterDays ? 'stale' : 'within_window'
  const missing = []
  if (!cleanText(evidence?.sourceName, 160)) missing.push('source_name')
  if (!sourceUrl) missing.push('source_url')
  else if (!validUrl) missing.push('valid_http_source_url')
  if (!observedAt) missing.push('observed_at')
  if (!cleanText(evidence?.limitations, 1000)) missing.push('limitations')
  return {
    metadataStatus: missing.length ? 'incomplete' : 'complete',
    missingFields: missing,
    sourceUrlFormat: sourceUrl ? (validUrl ? 'valid_http_url_format' : 'invalid') : 'not_provided',
    sourceReachability: 'not_checked',
    sourceAuthenticity: 'not_independently_verified',
    factualAccuracy: 'not_assessed',
    freshness,
    ageDays,
    staleAfterDays
  }
}

/**
 * Detects only explicitly declared opposing analyst positions sharing a
 * subject key. It does not perform semantic contradiction detection.
 */
export function findDeclaredEvidenceConflicts(observations = []) {
  const groups = new Map()
  for (const item of Array.isArray(observations) ? observations : []) {
    const key = cleanText(item?.subjectKey, 120).toLowerCase()
    const stance = item?.stance
    if (!key || !['supports', 'contradicts'].includes(stance)) continue
    if (!groups.has(key)) groups.set(key, { subjectKey: key, supports: [], contradicts: [] })
    groups.get(key)[stance].push(item.id)
  }
  return [...groups.values()]
    .filter(group => group.supports.length && group.contradicts.length)
    .map(group => ({ ...group, status: 'review_required', resolution: 'unresolved' }))
}

/**
 * Records a challenge only when counter-evidence already exists in the case.
 * The original observation is retained and marked for human review.
 */
export function challengeObservation(caseItem, observationId, input, options = {}) {
  if (!caseItem || !Array.isArray(caseItem.observations) || !Array.isArray(caseItem.evidence)) return { ok: false, error: 'invalid_case' }
  const observation = caseItem.observations.find(item => item.id === observationId)
  if (!observation) return { ok: false, error: 'observation_not_found' }
  const counterEvidenceId = cleanText(input?.counterEvidenceId, 100)
  if (!counterEvidenceId || !caseItem.evidence.some(item => item.id === counterEvidenceId)) return { ok: false, error: 'counter_evidence_required' }
  const rationale = cleanText(input?.rationale, 1000)
  if (!rationale) return { ok: false, error: 'challenge_rationale_required' }
  if (!Array.isArray(caseItem.challenges)) caseItem.challenges = []
  const now = validDate(options.now) || new Date().toISOString()
  const challenge = {
    id: options.id || makeId('challenge'), observationId,
    counterEvidenceId, rationale, createdAt: now,
    status: 'open', reviewOutcome: 'undetermined'
  }
  caseItem.challenges.push(challenge)
  observation.reviewStatus = 'challenged'
  appendEvent(caseItem, 'finding_challenged', `Observation challenged: ${observationId}`, now)
  return { ok: true, challenge, observation }
}

/** Compare two saved case snapshots by stable record IDs. */
export function compareCaseSnapshots(previous, current) {
  if (!previous || !current || previous.id !== current.id) return { ok: false, error: 'matching_case_snapshots_required' }
  const diff = (before = [], after = []) => {
    const oldMap = new Map(before.map(item => [item.id, item]))
    const newMap = new Map(after.map(item => [item.id, item]))
    return {
      added: [...newMap.keys()].filter(id => !oldMap.has(id)),
      removed: [...oldMap.keys()].filter(id => !newMap.has(id)),
      unchanged: [...newMap.keys()].filter(id => oldMap.has(id))
    }
  }
  return {
    ok: true,
    caseId: current.id,
    status: previous.status === current.status ? { changed: false, from: previous.status, to: current.status } : { changed: true, from: previous.status, to: current.status },
    evidence: diff(previous.evidence, current.evidence),
    observations: diff(previous.observations, current.observations),
    notes: diff(previous.notes, current.notes),
    relationships: diff(previous.relationships, current.relationships),
    comparedAt: new Date().toISOString(),
    limitation: 'This is a record-level snapshot comparison, not proof that removed or changed records were false.'
  }
}

/** Build a portable report payload while preserving provenance and caveats. */
export function buildCaseReport(caseItem, options = {}) {
  if (!caseItem || typeof caseItem !== 'object' || !caseItem.id) return { ok: false, error: 'invalid_case' }
  const generatedAt = validDate(options.generatedAt) || new Date().toISOString()
  const evidence = Array.isArray(caseItem.evidence) ? caseItem.evidence : []
  const observations = Array.isArray(caseItem.observations) ? caseItem.observations : []
  return {
    ok: true,
    report: {
      schema: 'trustradar.case-report.v1', generatedAt,
      case: { id: caseItem.id, title: cleanText(caseItem.title, 160), status: caseItem.status, createdAt: caseItem.createdAt, updatedAt: caseItem.updatedAt },
      evidence: evidence.map(item => ({ ...item, metadataAssessment: assessEvidenceMetadata(item, { now: generatedAt }) })),
      observations: observations.map(item => ({ ...item })),
      notes: Array.isArray(caseItem.notes) ? caseItem.notes.map(item => ({ ...item })) : [],
      relationships: Array.isArray(caseItem.relationships) ? caseItem.relationships.map(item => ({ ...item })) : [],
      challenges: Array.isArray(caseItem.challenges) ? caseItem.challenges.map(item => ({ ...item })) : [],
      conflicts: findDeclaredEvidenceConflicts(observations),
      limitations: [
        'Source URLs are stored as metadata and are not fetched by this local module.',
        'Source reachability and authenticity are not independently verified.',
        'Analyst observations, inferences, hypotheses and relationships must not be presented as independently established facts.',
        'No automated reputation verdict or validated risk score is produced.'
      ]
    }
  }
}

function adapterFrom(storage) {
  if (storage && typeof storage.getStorageSync === 'function' && typeof storage.setStorageSync === 'function') {
    return { read: key => storage.getStorageSync(key), write: (key, value) => storage.setStorageSync(key, value) }
  }
  if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function') {
    return { read: key => { const raw = storage.getItem(key); return raw === null ? null : JSON.parse(raw) }, write: (key, value) => storage.setItem(key, JSON.stringify(value)) }
  }
  return null
}

export function readInvestigationStore(storage = globalThis.uni) {
  const adapter = adapterFrom(storage)
  if (!adapter) return { ok: false, reason: 'storage_unavailable', store: emptyInvestigationStore() }
  try {
    const raw = adapter.read(STORE_KEY)
    if (raw === null || raw === undefined || raw === '') return { ok: true, store: emptyInvestigationStore() }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    const validation = validateInvestigationStore(parsed)
    return validation.ok ? { ok: true, store: parsed } : { ok: false, reason: validation.reason, store: emptyInvestigationStore() }
  } catch { return { ok: false, reason: 'storage_unreadable', store: emptyInvestigationStore() } }
}

export function writeInvestigationStore(store, storage = globalThis.uni) {
  const validation = validateInvestigationStore(store)
  if (!validation.ok) return { ok: false, reason: validation.reason }
  const adapter = adapterFrom(storage)
  if (!adapter) return { ok: false, reason: 'storage_unavailable' }
  try { adapter.write(STORE_KEY, store); return { ok: true } }
  catch { return { ok: false, reason: 'storage_write_failed' } }
}
