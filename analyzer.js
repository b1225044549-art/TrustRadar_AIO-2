const EMAIL_RE = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i
const USERNAME_RE = /^@?[a-z0-9_](?:[a-z0-9._-]{0,28}[a-z0-9_-])?$/i
const PHONE_CHARS_RE = /^\+?[\d\s()\-]+$/
const URL_SCHEME_RE = /^https?:\/\//i

function isValidHostname(hostname) {
  if (!hostname || hostname.length > 253) return false
  const host = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname
  if (!host || host.toLowerCase() === 'localhost') return host.toLowerCase() === 'localhost'
  const labels = host.split('.')
  if (labels.length < 2) return false
  return labels.every(label =>
    label.length >= 1 && label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  ) && /^[a-z]{2,63}$/i.test(labels[labels.length - 1])
}

function parseUrl(value) {
  try {
    const candidate = URL_SCHEME_RE.test(value) ? value : `https://${value}`
    const parsed = new URL(candidate)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    if (parsed.username || parsed.password) return null
    if (!isValidHostname(parsed.hostname)) return null
    return parsed
  } catch {
    return null
  }
}

function isUrlLike(value) {
  if (URL_SCHEME_RE.test(value)) return true
  // A bare hostname is a domain; a path, query, or fragment makes it a URL.
  return /^[^\s/]+\.[^\s/]+(?:[/?#].*)$/.test(value)
}

function parseDomain(value) {
  if (isUrlLike(value)) return null
  const parsed = parseUrl(value)
  if (!parsed || parsed.pathname !== '/' || parsed.search || parsed.hash) return null
  return parsed
}

function isPhoneLike(value) {
  if (!PHONE_CHARS_RE.test(value)) return false
  const digits = value.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return false
  if (/^(\d)\1+$/.test(digits)) return false
  return true
}

export function detectType(raw) {
  const value = String(raw ?? '').trim()
  if (!value || value.length > 2048) return 'unknown'
  if (EMAIL_RE.test(value)) {
    const localPart = value.slice(0, value.lastIndexOf('@'))
    if (!localPart.startsWith('.') && !localPart.endsWith('.') && !localPart.includes('..')) return 'email'
  }
  if (isUrlLike(value) && parseUrl(value)) return 'url'
  if (parseDomain(value)) return 'domain'
  if (isPhoneLike(value)) return 'phone'
  if (USERNAME_RE.test(value) && /[a-z_]/i.test(value)) {
    const handle = value.replace(/^@/, '')
    if (!handle.includes('..') && !handle.includes('.-') && !handle.includes('-.')) return 'username'
  }
  return 'unknown'
}

function cleanDomain(value) {
  const parsed = parseDomain(value)
  return parsed ? parsed.hostname.toLowerCase() : ''
}

function analyzeUrl(value) {
  const parsed = parseUrl(value)
  if (!parsed) return []
  const findings = [
    { label: 'URL structure', detail: `The link was parsed locally as ${parsed.protocol}//${parsed.host}. No request was sent to the destination.`, state: 'info' },
    { label: 'Transport scheme', detail: parsed.protocol === 'https:' ? 'The URL uses HTTPS, but this alone does not establish that the site is trustworthy.' : 'The URL uses HTTP and does not indicate transport encryption.', state: parsed.protocol === 'https:' ? 'info' : 'warn' },
    { label: 'Hostname', detail: parsed.hostname, state: 'info' }
  ]
  if (parsed.hostname.toLowerCase().startsWith('xn--') || parsed.hostname.toLowerCase().includes('.xn--')) {
    findings.push({ label: 'Internationalized hostname', detail: 'The hostname contains a punycode label. Review the displayed domain carefully for look-alike characters.', state: 'warn' })
  }
  if (parsed.port) findings.push({ label: 'Non-default port', detail: `The URL specifies port ${parsed.port}. This is not automatically malicious, but should be expected for the service.`, state: 'warn' })
  if (parsed.search) findings.push({ label: 'Query parameters', detail: 'The URL contains query parameters. Avoid sharing the full link if they may contain personal or session information.', state: 'warn' })
  if (parsed.hash) findings.push({ label: 'Fragment', detail: 'The URL contains a fragment identifier. Review it before sharing because it may contain application-specific data.', state: 'info' })
  findings.push({ label: 'Reputation and destination', detail: 'No DNS, redirect, certificate, content, or reputation checks are connected. TrustRadar did not open or fetch this URL.', state: 'warn' })
  return findings
}

export function analyzeIndicator(raw) {
  const value = String(raw ?? '').trim()
  const type = detectType(value)
  const findings = []

  if (!value) {
    return { value, type, status: 'No input', findings, score: null, confidence: 'Not assessed', checkedAt: new Date().toISOString() }
  }

  if (type === 'url') {
    findings.push(...analyzeUrl(value))
  } else if (type === 'email') {
    const [, domain] = value.split('@')
    findings.push({ label: 'Address structure', detail: 'The value matches a conservative email-address syntax check; mailbox delivery was not tested.', state: 'info' })
    findings.push({ label: 'Email domain', detail: domain.toLowerCase(), state: 'info' })
    findings.push({ label: 'Mailbox verification', detail: 'This local build cannot confirm that the mailbox exists or that you control it.', state: 'warn' })
    findings.push({ label: 'Sender authenticity', detail: 'A valid-looking address does not authenticate the sender or a message.', state: 'warn' })
  } else if (type === 'domain') {
    const domain = cleanDomain(value)
    findings.push({ label: 'Domain structure', detail: `The domain-like value was parsed as ${domain}.`, state: 'info' })
    findings.push({ label: 'DNS records', detail: 'Live DNS, MX, SPF and DMARC checks are not connected in this offline MVP.', state: 'warn' })
    findings.push({ label: 'Registration details', detail: 'No RDAP or domain-age provider is connected, so registration data is unavailable.', state: 'warn' })
    findings.push({ label: 'Reputation', detail: 'No trusted reputation verdict is available from the current local analysis.', state: 'warn' })
  } else if (type === 'phone') {
    const digits = value.replace(/\D/g, '')
    findings.push({ label: 'Number structure', detail: `A phone-like value containing ${digits.length} digits was detected. This is not full numbering-plan validation.`, state: 'info' })
    findings.push({ label: 'Ownership', detail: 'The owner cannot be identified or verified from a phone number alone.', state: 'warn' })
    findings.push({ label: 'Carrier and location', detail: 'The current carrier or a person’s location cannot be reliably established by this local check.', state: 'warn' })
  } else if (type === 'username') {
    findings.push({ label: 'Handle structure', detail: 'The value matches a basic username-like pattern.', state: 'info' })
    findings.push({ label: 'Cross-platform matching', detail: 'A matching handle on another service would not prove that both accounts belong to the same person.', state: 'warn' })
    findings.push({ label: 'Profile verification', detail: 'No platform profile or ownership checks are performed in this local build.', state: 'warn' })
  } else {
    findings.push({ label: 'Input not recognized', detail: 'Try a phone number, email address, URL, valid domain or username-like handle.', state: 'warn' })
  }

  return {
    value,
    type,
    status: type === 'unknown' ? 'Needs review' : 'Preliminary analysis',
    findings,
    score: null,
    confidence: 'No reputation confidence assigned',
    checkedAt: new Date().toISOString()
  }
}
