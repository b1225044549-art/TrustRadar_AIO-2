<template>
  <view class="app-shell" :class="['theme-' + theme, { 'theme-system': theme === 'system' }]" :lang="locale" :dir="localeDirection">
    <view class="ambient ambient-one"></view><view class="ambient ambient-two"></view>
    <view class="topbar">
      <view class="brand-lockup" @click="go('dashboard')">
        <view class="brand-symbol"><text>TR</text><view class="symbol-spark"></view></view>
        <view class="brand-copy"><text class="brand-name">TrustRadar</text><text class="brand-caption">ALL-IN-ONE OSINT & THREAT INVESTIGATION</text></view>
      </view>
      <view class="topbar-right"><button v-if="!isDemoMode" class="demo-launch-button" @click="startDemo()">▶ Launch demo</button><button v-else class="demo-exit-button" @click="exitDemo">Exit demo</button><view class="workspace-state"><view class="state-pulse"></view><text>{{ isDemoMode ? 'SIMULATED DATA' : 'LOCAL WORKSPACE' }}</text></view><view class="avatar">TR</view></view>
    </view>

    <view v-if="isDemoMode" class="demo-banner"><view class="demo-banner-main"><text class="demo-kicker">DEMO ENVIRONMENT · NO REAL DATA</text><text class="demo-banner-title">{{ demoScenario.title }}</text><text class="demo-banner-copy">{{ demoScenario.description }}</text></view><view class="demo-scenarios"><button v-for="scenario in demoScenarios" :key="scenario.id" :class="['demo-scenario-button', { active: demoScenario.id === scenario.id }]" @click="startDemo(scenario.id)">{{ scenario.title }}</button></view></view>

    <view class="app-layout">
      <view class="sidebar">
        <text class="side-label">YOUR WORKSPACE</text>
        <view v-for="item in nav" :key="item.id" class="nav-link" :class="{ selected: activeTab === item.id }" @click="go(item.id)">
          <text class="nav-glyph">{{ item.icon }}</text><text class="nav-name">{{ item.id === 'dashboard' ? t('overview') : item.id === 'search' ? t('investigate') : item.id === 'feed' ? t('reports') : item.id === 'report' ? t('newReport') : item.id === 'saved' ? t('saved') : item.id === 'cases' ? 'Cases' : t('settings') }}</text><text v-if="item.id==='saved' && saved.length" class="nav-count">{{ saved.length }}</text>
        </view>
        <view class="side-divider"></view>
        <text class="side-label">WORKSPACE STATUS</text>
        <view class="privacy-card"><view class="privacy-icon">⌑</view><text class="privacy-title">Private by default</text><text class="privacy-copy">{{ isDemoMode ? 'This isolated session uses fictional training records only.' : 'Your searches, reports and saved indicators stay on this device.' }}</text><view class="privacy-status"><view class="inline-dot"></view> {{ isDemoMode ? 'SIMULATED SESSION' : 'LOCAL STORAGE ACTIVE' }}</view></view>
        <view class="sidebar-bottom"><text>TRUSTRADAR AIO</text><text>VERSION 3.0.0-ALPHA.7 · DEMO MODE</text></view>
      </view>

      <view class="main-content">
        <view class="page-topline"><view><text class="breadcrumb">WORKSPACE <text>/</text> {{ pageTitle.toUpperCase() }}</text><text class="page-title">{{ pageTitle }}</text><text class="page-subtitle">{{ pageSubtitle }}</text></view><view class="date-chip"><text class="date-dot"></text><text>{{ isDemoMode ? 'DEMO ENVIRONMENT' : 'PERSONAL ENVIRONMENT' }}</text></view></view>

        <template v-if="activeTab === 'dashboard'">
          <view class="welcome-banner">
            <view class="welcome-copy"><view class="welcome-tag"><text class="tag-star">✦</text> YOUR DIGITAL SAFETY DESK</view><text class="welcome-title">Make sense of the <text class="gradient-text">signals.</text></text><text class="welcome-description">Review suspicious indicators, organize what you find, and keep your decisions grounded in evidence.</text><view class="welcome-actions"><button class="button-primary" @click="go('search')">Start an investigation <text>↗</text></button><button class="button-quiet" @click="go('report')">＋ Add a report</button></view></view>
            <view class="banner-art"><view class="art-orbit orbit-a"></view><view class="art-orbit orbit-b"></view><view class="art-core"><text>TR</text><view class="core-dot"></view></view><view class="art-satellite sat-a">✓</view><view class="art-satellite sat-b">⌕</view><view class="art-satellite sat-c">◈</view></view>
            <view class="banner-index">01 <text>/ 04</text></view>
          </view>

          <view class="section-heading"><view><text class="section-title">Workspace overview</text><text class="section-caption">A snapshot of your activity on this device</text></view><view class="updated-label"><view class="inline-dot"></view> DEVICE DATA</view></view>
          <view class="stats-grid">
            <view class="stat-card stat-blue"><view class="stat-top"><text class="stat-label">RECENT CHECKS</text><view class="stat-icon">⌕</view></view><text class="stat-number">{{ recent.length }}</text><text class="stat-foot">Latest searches kept in history</text><view class="stat-accent"></view></view>
            <view class="stat-card stat-violet"><view class="stat-top"><text class="stat-label">SAVED INDICATORS</text><view class="stat-icon">▣</view></view><text class="stat-number">{{ saved.length }}</text><text class="stat-foot">Indicators you want to revisit</text><view class="stat-accent"></view></view>
            <view class="stat-card stat-amber"><view class="stat-top"><text class="stat-label">LOCAL REPORTS</text><view class="stat-icon">◈</view></view><text class="stat-number">{{ reports.length }}</text><text class="stat-foot">Your submitted, unverified notes</text><view class="stat-accent"></view></view>
          </view>

          <view v-if="isDemoMode" class="surface demo-inventory-surface">
            <view class="surface-heading"><view><text class="surface-title">Demo dataset inventory</text><text class="surface-subtitle">A larger, interconnected synthetic training workspace</text></view><view class="principle-badge">SIMULATED</view></view>
            <view class="demo-inventory-grid">
              <view v-for="(count, label) in demoScenario.stats" :key="label" class="demo-inventory-item"><text class="demo-inventory-count">{{ count }}</text><text class="demo-inventory-label">{{ label.replace(/([A-Z])/g, ' $1') }}</text></view>
            </view>
            <view class="demo-inventory-note">All records are fictional. Reserved example domains and documentation-only IP ranges are used. No live lookups, external requests, real identities, or threat verdicts are involved.</view>
            <view class="demo-inventory-actions"><button class="button-outline small" @click="notify(demoScenario.cases.length + ' synthetic cases · ' + demoScenario.evidence.length + ' evidence records · ' + demoScenario.timeline.length + ' timeline events')">Show dataset summary</button><button class="button-quiet" @click="clearLocalData">Reset scenario</button></view>
          </view>

          <view class="dashboard-grid">
            <view class="surface recent-surface"><view class="surface-heading"><view><text class="surface-title">Recent investigations</text><text class="surface-subtitle">Pick up where you left off</text></view><button class="text-button" @click="go('search')">New search ↗</button></view>
              <view v-if="recent.length" class="recent-list"><view v-for="entry in recent.slice(0,5)" :key="entry.value + entry.checkedAt" class="recent-item" @click="openResult(entry)"><view class="indicator-icon" :class="'kind-'+entry.type">{{ typeIcon(entry.type) }}</view><view class="recent-info"><text class="recent-value">{{ entry.value }}</text><text class="recent-meta">{{ entry.type.toUpperCase() }} <text>·</text> {{ formatDate(entry.checkedAt) }}</text></view><view class="recent-status">FORMAT CHECKED</view><text class="row-arrow">↗</text></view></view>
              <view v-else class="empty-inline"><view class="empty-illustration">⌕</view><view><text class="empty-title">Your workspace starts here</text><text class="empty-copy">Run a search to create your first investigation record.</text></view><button class="button-outline small" @click="go('search')">Run first search</button></view>
            </view>
            <view class="surface principles-surface"><view class="surface-heading"><view><text class="surface-title">Built on good judgment</text><text class="surface-subtitle">How TrustRadar handles information</text></view><view class="principle-badge">CORE</view></view>
              <view class="principle-row"><view class="principle-number">01</view><view><text class="principle-title">Evidence first</text><text class="principle-copy">Separate observable facts from assumptions.</text></view></view>
              <view class="principle-row"><view class="principle-number">02</view><view><text class="principle-title">No false verdicts</text><text class="principle-copy">A format match is not proof of fraud or identity.</text></view></view>
              <view class="principle-row"><view class="principle-number">03</view><view><text class="principle-title">Privacy matters</text><text class="principle-copy">Your local records are not uploaded or shared.</text></view></view>
            </view>
          </view>
        </template>

        <template v-else-if="activeTab === 'search'">
          <view class="search-layout"><view class="surface search-workspace"><view class="search-intro"><view class="search-emblem">⌕</view><view><text class="surface-title">Indicator analysis</text><text class="surface-subtitle">Start with a phone number, email, URL, domain or username.</text></view></view>
              <view class="search-field-wrap"><text class="field-overline">WHAT WOULD YOU LIKE TO CHECK?</text><view class="search-field"><text class="search-field-icon">⌕</text><input v-model="searchInput" class="search-entry" placeholder="Enter an indicator..." confirm-type="search" @confirm="runSearch"/><text v-if="searchInput" class="clear-entry" @click="searchInput=''">×</text></view><view class="input-helper">Examples: +2010… · name@example.com · https://example.com · @username</view><button class="button-primary analyze-button" @click="runSearch">Analyze indicator <text>↗</text></button></view>
              <view class="supported-types"><text class="field-overline">SUPPORTED INDICATORS</text><view class="type-pills"><view class="type-pill" @click="searchInput='+201012345678'"><text>☎</text> Phone</view><view class="type-pill" @click="searchInput='name@example.com'"><text>✉</text> Email</view><view class="type-pill" @click="searchInput='example.com'"><text>◎</text> Domain</view><view class="type-pill" @click="searchInput='https://example.com/login'"><text>↗</text> URL</view><view class="type-pill" @click="searchInput='@username'"><text>@</text> Username</view></view></view>
            </view>
            <view class="surface result-workspace"><view class="surface-heading"><view><text class="surface-title">Analysis report</text><text class="surface-subtitle">Clear findings, no invented reputation score</text></view><view class="report-live"><view class="inline-dot"></view> READY</view></view>
              <view v-if="result" class="analysis-result"><view class="analysis-header"><view><text class="analysis-overline">INDICATOR UNDER REVIEW</text><text class="analysis-value">{{ result.value }}</text></view><view class="analysis-type">{{ result.type.toUpperCase() }}</view></view><view class="analysis-state"><view class="state-icon">i</view><view><text class="state-title">{{ result.status }}</text><text class="state-desc">{{ result.confidence }}</text></view></view><view v-if="!isDemoMode" class="analysis-cache-meta"><text>{{ result.cacheInfo?.isCached ? 'CACHED RESULT' : 'FRESH LOCAL ANALYSIS' }}</text><text v-if="result.cacheInfo?.cachedAt"> · {{ formatDate(result.cacheInfo.cachedAt) }}</text><text v-else> · {{ formatDate(result.checkedAt) }}</text><text v-if="result.cacheInfo && !result.cacheInfo.persisted"> · Cache unavailable; result was not stored</text></view><view class="findings-heading">FINDINGS <text>{{ result.findings.length }} ITEMS</text></view><view v-for="(finding,i) in result.findings" :key="i" class="finding-item"><view class="finding-bullet" :class="finding.state"></view><view><text class="finding-name">{{ finding.label }}</text><text class="finding-description">{{ finding.detail }}</text></view></view><view class="analysis-disclaimer"><text>IMPORTANT CONTEXT</text><text>This is a preliminary, local format review. URLs are not opened or fetched, and no external reputation service is connected. It cannot verify ownership, identity, or wrongdoing.</text></view><view class="analysis-actions"><button class="button-primary" @click="saveCurrent">{{ isCurrentSaved ? '✓ Saved to cases' : '＋ Save case' }}</button><button class="button-outline" @click="copyResult">Copy summary</button><button v-if="!isDemoMode" class="button-outline" @click="runSearch(true)">↻ Refresh analysis</button><button v-if="!isDemoMode" class="button-outline" :disabled="exportBusy" @click="exportCurrentReport">{{ exportBusy ? 'Preparing export…' : 'Export audit JSON' }}</button></view></view>
              <view v-else class="analysis-empty"><view class="empty-rings"><text>TR</text></view><text class="empty-title">Your findings will appear here</text><text class="empty-copy">Enter an indicator to generate a structured preliminary report.</text><view class="empty-steps"><text><text>01</text> Identify the input</text><text><text>02</text> Review available signals</text><text><text>03</text> Save useful context</text></view></view>
            </view></view>
        </template>

        <template v-else-if="activeTab === 'cases'">
          <view v-if="isDemoMode" class="surface full-surface"><text class="surface-title">Case workspace paused in demo</text><text class="surface-subtitle">Exit demo mode to work with your private local investigation records. Demo records never mix with real cases.</text></view>
          <view v-else class="case-layout">
            <view class="surface case-list-panel">
              <view class="surface-heading"><view><text class="surface-title">Your investigations</text><text class="surface-subtitle">Stored locally on this device</text></view><view class="saved-count">{{ investigationCases.length }} <text>CASES</text></view></view>
              <view class="case-create-form"><input class="form-input" v-model="caseForm.title" maxlength="160" placeholder="Investigation title"/><textarea class="form-textarea compact-textarea" v-model="caseForm.objective" maxlength="1000" placeholder="Objective (optional)"/><button class="button-primary" @click="createCase">＋ Create case</button></view>
              <view v-if="investigationCases.length" class="case-list"><view v-for="item in investigationCases" :key="item.id" class="case-list-item" :class="{ selected: selectedCaseId === item.id }" @click="selectedCaseId = item.id"><text class="case-list-title">{{ item.title }}</text><text class="case-list-meta">{{ item.status.replace('_',' ').toUpperCase() }} · {{ item.evidence.length }} evidence · {{ item.observations.length }} observations</text></view></view>
              <view v-else class="empty-inline"><text class="empty-copy">No cases yet. Create one to start documenting an investigation.</text></view>
            </view>
            <view class="surface case-detail-panel" v-if="currentCase">
              <view class="surface-heading"><view><text class="surface-title">{{ currentCase.title }}</text><text class="surface-subtitle">{{ currentCase.objective || 'No objective supplied' }}</text></view><view class="case-status">{{ currentCase.status.replace('_',' ').toUpperCase() }}</view></view>
              <view class="case-status-actions"><button class="button-outline small" @click="updateCaseStatus('open')">Open</button><button class="button-outline small" @click="updateCaseStatus('in_review')">In review</button><button class="button-outline small" @click="updateCaseStatus('closed')">Close</button></view>
              <view class="case-metrics"><view><strong>{{ currentCase.evidence.length }}</strong><text>Evidence</text></view><view><strong>{{ currentCase.observations.length }}</strong><text>Observations</text></view><view><strong>{{ currentCase.notes.length }}</strong><text>Notes</text></view><view><strong>{{ currentCase.challenges?.length || 0 }}</strong><text>Challenges</text></view></view>
              <view class="case-section"><text class="case-section-title">Evidence register</text><view v-for="ev in currentCase.evidence" :key="ev.id" class="case-record"><text class="case-record-title">{{ ev.title }}</text><text class="case-record-meta">{{ ev.kind.replace('_',' ') }} · {{ ev.confidence }} confidence · {{ formatDate(ev.observedAt) }}</text><text class="case-record-copy">{{ ev.description || ev.sourceName || 'No additional description' }}</text><text v-if="ev.sourceUrl" class="case-record-copy">{{ ev.sourceUrl }}</text><text class="case-record-caution">{{ ev.limitations || 'Source authenticity has not been independently established.' }}</text><text class="case-record-meta">Metadata: {{ evidenceMetadataStatus(ev) }} · Reachability: not checked</text></view><view v-if="!currentCase.evidence.length" class="case-empty">No evidence has been added.</view>
                <view class="case-form"><input class="form-input" v-model="evidenceForm.title" placeholder="Evidence title *"/><input class="form-input" v-model="evidenceForm.sourceName" placeholder="Source name (optional)"/><input class="form-input" v-model="evidenceForm.sourceUrl" placeholder="Public source URL (optional)"/><textarea class="form-textarea compact-textarea" v-model="evidenceForm.description" placeholder="What does this record contain?"/><textarea class="form-textarea compact-textarea" v-model="evidenceForm.limitations" placeholder="Limitations / caveats"/><button class="button-outline" @click="addCaseEvidence">＋ Add evidence metadata</button></view>
              </view>
              <view class="case-section"><text class="case-section-title">Observations &amp; analysis</text><view v-for="obs in currentCase.observations" :key="obs.id" class="case-record"><text class="case-record-title">{{ obs.kind.replaceAll('_',' ').toUpperCase() }} · {{ obs.claim }}</text><text class="case-record-meta">{{ obs.confidence }} confidence <text v-if="obs.evidenceId">· Evidence linked</text> · Review: {{ obs.reviewStatus || 'unreviewed' }}</text><text class="case-record-caution">{{ obs.disclaimer }}</text><button class="button-quiet" @click="beginChallenge(obs.id)">Challenge this finding</button></view><view v-if="!currentCase.observations.length" class="case-empty">No observations recorded.</view>
                <view v-if="declaredConflicts.length" class="case-record conflict-notice"><text class="case-record-title">{{ declaredConflicts.length }} declared evidence conflict(s)</text><text class="case-record-caution">Opposing analyst positions were recorded for the same subject. Each conflict remains unresolved until reviewed.</text><text v-for="conflict in declaredConflicts" :key="conflict.subjectKey" class="case-record-meta">{{ conflict.subjectKey }} · {{ conflict.supports.length }} supporting · {{ conflict.contradicts.length }} contradicting</text></view>
                <view v-if="challengeForm.observationId" class="case-form challenge-form"><text class="case-record-title">Challenge selected finding</text><picker :range="currentCase.evidence.map(x => x.title)" @change="e => challengeForm.counterEvidenceId = currentCase.evidence[Number(e.detail.value)]?.id || ''"><view class="form-select">{{ currentCase.evidence.find(x => x.id === challengeForm.counterEvidenceId)?.title || 'Select counter-evidence *' }} <text>⌄</text></view></picker><textarea class="form-textarea compact-textarea" v-model="challengeForm.rationale" placeholder="Explain how this evidence challenges the finding *"/><view class="case-form-actions"><button class="button-outline" @click="challengeForm = { observationId: '', counterEvidenceId: '', rationale: '' }">Cancel</button><button class="button-primary" @click="submitChallenge">Submit challenge</button></view></view>
                <view class="case-form"><textarea class="form-textarea compact-textarea" v-model="observationForm.claim" placeholder="Observation / interpretation *"/><picker :range="['hypothesis','inference','observed_fact']" @change="e => observationForm.kind = ['hypothesis','inference','observed_fact'][Number(e.detail.value)]"><view class="form-select">{{ observationForm.kind.replace('_',' ') }} <text>⌄</text></view></picker><picker :range="currentCase.evidence.map(x => x.title)" @change="e => observationForm.evidenceId = currentCase.evidence[Number(e.detail.value)]?.id || ''"><view class="form-select">{{ currentCase.evidence.find(x => x.id === observationForm.evidenceId)?.title || 'Link evidence (required for observed fact)' }} <text>⌄</text></view></picker><input class="form-input" v-model="observationForm.subjectKey" placeholder="Shared subject key (optional, for conflict review)"/><picker :range="['neutral','supports','contradicts']" @change="e => observationForm.stance = ['neutral','supports','contradicts'][Number(e.detail.value)]"><view class="form-select">Position: {{ observationForm.stance }} <text>⌄</text></view></picker><textarea class="form-textarea compact-textarea" v-model="observationForm.rationale" placeholder="Reasoning / basis (optional)"/><button class="button-outline" @click="addCaseObservation">＋ Add observation</button></view>
              </view>
              <view class="case-section"><text class="case-section-title">Analyst-asserted relationships</text><view v-for="rel in currentCase.relationships" :key="rel.id" class="case-record"><text class="case-record-title">{{ rel.from }} — {{ rel.relation }} — {{ rel.to }}</text><text class="case-record-copy">Basis: {{ rel.basis }}</text><text class="case-record-caution">{{ rel.confidence }} confidence · Analyst assertion, not independently verified</text></view><view v-if="!currentCase.relationships.length" class="case-empty">No relationships recorded.</view><view class="case-form"><input class="form-input" v-model="relationshipForm.from" placeholder="First entity / indicator"/><input class="form-input" v-model="relationshipForm.to" placeholder="Second entity / indicator"/><input class="form-input" v-model="relationshipForm.relation" placeholder="Relationship label (e.g. co-mentioned)"/><textarea class="form-textarea compact-textarea" v-model="relationshipForm.basis" placeholder="Why are you recording this relationship? *"/><button class="button-outline" @click="addCaseRelationship">＋ Record relationship</button></view></view>
              <view class="case-section"><text class="case-section-title">Analyst notes</text><view v-for="note in currentCase.notes" :key="note.id" class="case-record"><text class="case-record-copy">{{ note.body }}</text><text class="case-record-meta">{{ formatDate(note.createdAt) }}</text></view><textarea class="form-textarea compact-textarea" v-model="caseNote" placeholder="Private analyst note"/><button class="button-outline" @click="addCaseAnalystNote">Save note</button></view>
              <view class="case-section"><text class="case-section-title">Activity timeline</text><view v-for="event in [...currentCase.timeline].reverse()" :key="event.id" class="timeline-record"><view class="timeline-dot"></view><view><text class="case-record-title">{{ event.summary }}</text><text class="case-record-meta">{{ formatDate(event.occurredAt) }}</text></view></view></view>
              <text class="case-disclaimer">Evidence coverage is a linkage indicator only—not proof of authenticity, truth, identity, or completeness. TrustRadar does not fetch source URLs.</text>
            </view>
            <view v-else class="surface case-detail-panel empty-state"><text class="empty-title">Select or create a case</text><text class="empty-copy">Your case workspace keeps evidence, analyst observations and timeline entries together.</text></view>
          </view>
        </template>

        <template v-else-if="activeTab === 'feed'">
          <view class="surface full-surface"><view class="surface-heading"><view><text class="surface-title">Your report register</text><text class="surface-subtitle">{{ isDemoMode ? 'Fictional observations from this isolated demo session' : 'A private log of observations submitted from this device' }}</text></view><button class="button-primary compact-button" @click="go('report')">＋ Create report</button></view><view v-if="reports.length" class="report-register"><view v-for="report in reports" :key="report.id" class="register-item"><view class="register-mark">!</view><view class="register-main"><text class="register-indicator">{{ report.indicator }}</text><text class="register-description">{{ report.description }}</text><text class="register-meta">{{ report.category }} <text>·</text> {{ formatDate(report.createdAt) }}</text></view><view class="unverified-tag" :class="{ simulated: report.demo || report.verification === 'simulated' }">{{ report.demo || report.verification === 'simulated' ? 'SIMULATED' : 'UNVERIFIED' }}</view></view></view><view v-else class="empty-state"><view class="empty-illustration">◈</view><text class="empty-title">No reports yet</text><text class="empty-copy">Create a private note when you want to document a suspicious interaction.</text><button class="button-outline" @click="go('report')">Create your first report</button></view></view>
        </template>

        <template v-else-if="activeTab === 'report'">
          <view class="report-layout"><view class="surface report-form-surface"><view class="surface-heading"><view><text class="surface-title">Document an observation</text><text class="surface-subtitle">Keep the details factual and useful for later review.</text></view><view class="form-step">NEW ENTRY <text>01</text></view></view><view class="form-field"><text class="field-overline">INDICATOR <text>REQUIRED</text></text><input class="form-input" v-model="reportForm.indicator" placeholder="Phone, email, domain or account handle" maxlength="180"/></view><view class="form-field"><text class="field-overline">OBSERVATION TYPE</text><picker :range="categories" @change="onCategoryChange"><view class="form-select">{{ reportForm.category }} <text>⌄</text></view></picker></view><view class="form-field"><text class="field-overline">WHAT HAPPENED? <text>REQUIRED</text></text><textarea class="form-textarea" v-model="reportForm.description" maxlength="500" placeholder="Describe what you directly observed. Avoid assumptions or unnecessary personal details."/><text class="character-count">{{ reportForm.description.length }}/500</text></view><view class="form-notice"><text>BE RESPONSIBLE</text><text>Reports are private notes on this device and are not verified or shared. Do not include passwords, financial details, or sensitive personal information.</text></view><view class="form-actions"><button class="button-primary" @click="submitReport">Save report <text>↗</text></button><button class="button-quiet" @click="resetReport">Clear form</button></view></view><view class="surface guidance-surface"><view class="guidance-icon">✳</view><text class="guidance-title">A useful report is specific.</text><text class="guidance-copy">Focus on the behavior or message, not assumptions about who may be behind it.</text><view class="guidance-example"><text class="example-label">GOOD CONTEXT</text><text>“Received a message claiming to be from a delivery company and requesting payment through an unfamiliar link.”</text></view><view class="guidance-example avoid"><text class="example-label">AVOID</text><text>“This person is definitely a criminal.”</text></view></view></view>
        </template>

        <template v-else-if="activeTab === 'saved'">
          <view class="surface full-surface"><view class="surface-heading"><view><text class="surface-title">Saved investigations</text><text class="surface-subtitle">Indicators you have chosen to keep for reference</text></view><view class="saved-count">{{ saved.length }} <text>SAVED</text></view></view><view v-if="saved.length" class="saved-list"><view v-for="entry in saved" :key="entry.value + entry.type" class="saved-item"><view class="indicator-icon" :class="'kind-'+entry.type">{{ typeIcon(entry.type) }}</view><view class="saved-main" @click="openResult(entry)"><text class="saved-value">{{ entry.value }}</text><text class="saved-meta">{{ entry.type.toUpperCase() }} <text>·</text> Saved {{ formatDate(entry.savedAt) }}</text></view><button class="remove-button" @click="removeCase(entry)">Remove</button><text class="row-arrow" @click="openResult(entry)">↗</text></view></view><view v-else class="empty-state"><view class="empty-illustration">▣</view><text class="empty-title">Nothing saved yet</text><text class="empty-copy">Save an indicator after analysis and it will be available here.</text><button class="button-outline" @click="go('search')">Start an investigation</button></view></view>
        </template>

        <template v-else>
          <view class="settings-grid"><view class="surface settings-main"><view class="surface-heading"><view><text class="surface-title">{{ t('workspaceSettings') }}</text><text class="surface-subtitle">How this version handles your data</text></view></view><view class="locale-panel"><view class="locale-panel-copy"><text class="setting-name">{{ t('language') }}</text><text class="setting-description">{{ t('languageHelp') }}</text></view><view class="locale-options"><button v-for="option in localeOptions" :key="option.code" :class="['locale-option', { selected: locale === option.code }]" @click="setLocale(option.code)">{{ option.native }}</button></view></view><view class="theme-panel"><view class="locale-panel-copy"><text class="setting-name">{{ t('appearance') }}</text><text class="setting-description">{{ t('appearanceHelp') }}</text></view><view class="theme-options"><button v-for="option in themeOptions" :key="option" :class="['theme-option', { selected: theme === option }]" @click="setTheme(option)">{{ t(option) }}</button></view></view><view class="setting-entry"><view class="setting-symbol">▤</view><view class="setting-info"><text class="setting-name">{{ isDemoMode ? 'Demo session storage' : 'Local device storage' }}</text><text class="setting-description">{{ isDemoMode ? 'Demo changes exist only in memory and are discarded when you exit.' : 'Search history, reports, saved indicators and investigation cases are stored on this device.' }}</text></view><view class="setting-state good">{{ isDemoMode ? 'SESSION ONLY' : 'ACTIVE' }}</view></view><view class="setting-entry"><view class="setting-symbol">◎</view><view class="setting-info"><text class="setting-name">External intelligence providers</text><text class="setting-description">No external reputation, DNS or registration provider is connected in this MVP.</text></view><view class="setting-state off">NOT CONNECTED</view></view><view class="setting-entry"><view class="setting-symbol">⇄</view><view class="setting-info"><text class="setting-name">Community synchronization</text><text class="setting-description">Reports are not uploaded or visible to other users.</text></view><view class="setting-state off">DISABLED</view></view><view class="setting-entry"><view class="setting-symbol">ⓘ</view><view class="setting-info"><text class="setting-name">Application version</text><text class="setting-description">TrustRadar 3.0.0-alpha.7 · Integrated demo + case workspace</text></view><view class="setting-state good">3.0 A7</view></view><view class="backup-row"><view><text class="setting-name">{{ isDemoMode ? 'Local backup unavailable in demo' : 'Copy local backup' }}</text><text class="setting-description">{{ isDemoMode ? 'Exit demo mode to export your real workspace data.' : 'Copy reports, saved indicators, investigation cases and recent searches as JSON.' }}</text></view><button class="button-outline" :disabled="isDemoMode" @click="copyBackup">{{ isDemoMode ? 'Demo disabled' : 'Copy backup' }}</button></view></view><view class="surface danger-zone"><view class="danger-icon">⌫</view><text class="danger-title">{{ isDemoMode ? 'Reset demo session' : 'Clear workspace data' }}</text><text class="danger-copy">{{ isDemoMode ? 'Reload the selected fictional scenario. Your real local records are not affected.' : 'Permanently remove all locally stored searches, reports and saved cases from this device.' }}</text><button class="danger-button" @click="clearLocalData">{{ isDemoMode ? 'Reset demo session' : 'Clear all local data' }}</button></view></view>
        </template>
        <view class="footer"><view class="footer-brand">TR <text>TRUSTRADAR AIO</text></view><text>Built around evidence, transparency and privacy.</text><text>{{ isDemoMode ? 'Demo data is fictional · No live OSINT sources connected' : 'Local-first MVP · Not a verified scam-detection service' }}</text></view>
      </view>
    </view>
    <view class="mobile-nav"><view v-for="item in mobileNav" :key="item.id" class="mobile-nav-item" :class="{ active: activeTab===item.id }" @click="go(item.id)"><text class="mobile-icon">{{ item.icon }}</text><text>{{ item.id === 'dashboard' ? t('home') : item.id === 'search' ? t('search') : item.id === 'report' ? t('add') : item.id === 'saved' ? t('saved') : item.id === 'cases' ? 'Cases' : t('reports') }}</text></view><view class="mobile-nav-item" :class="{active:activeTab==='settings'}" @click="go('settings')"><text class="mobile-icon">⚙</text><text>{{ t('more') }}</text></view></view>
    <view v-if="toast" class="toast-message">{{ toast }}</view>
  </view>
</template>

<script>
import { analyzeIndicator } from '../../utils/analyzer'
import { getDataState, getRecentState, setRecent, addReport, toggleSaved, removeSaved, clearWorkspace } from '../../utils/storage'
import { getCachedOrFetchAnalysis, exportAuditReport } from '../../utils/pro-features'
import { buildDemoScenario, listDemoScenarios } from '../../utils/demo'
import { SUPPORTED_LOCALES, LOCALE_META, readLocale, writeLocale, translate, getLocaleMeta } from '../../utils/i18n'
import { SUPPORTED_THEMES, readTheme, writeTheme, formatLocaleDate } from '../../utils/preferences'
import { createInvestigation, addEvidence, addObservation, addCaseNote, addRelationship, assessEvidenceMetadata, challengeObservation, findDeclaredEvidenceConflicts, setCaseStatus, readInvestigationStore, writeInvestigationStore, emptyInvestigationStore, buildCaseSummary } from '../../utils/investigations'

export default {
  data() {
    return {
      activeTab: 'dashboard',
      locale: readLocale(),
      theme: readTheme(),
      themeOptions: SUPPORTED_THEMES,
      localeOptions: SUPPORTED_LOCALES.map(code => ({ code, ...LOCALE_META[code] })),
      nav: [
        { id: 'dashboard', label: 'Overview', icon: '⌂' },
        { id: 'search', label: 'Investigate', icon: '⌕' },
        { id: 'cases', label: 'Case workspace', icon: '▤' },
        { id: 'feed', label: 'Report register', icon: '◈' },
        { id: 'report', label: 'New report', icon: '＋' },
        { id: 'saved', label: 'Saved indicators', icon: '▣' },
        { id: 'settings', label: 'Settings', icon: '⚙' }
      ],
      mobileNav: [
        { id: 'dashboard', short: 'Home', icon: '⌂' },
        { id: 'search', short: 'Search', icon: '⌕' },
        { id: 'cases', short: 'Cases', icon: '▤' },
        { id: 'feed', short: 'Reports', icon: '◈' },
        { id: 'report', short: 'Add', icon: '＋' },
        { id: 'saved', short: 'Saved', icon: '▣' }
      ],
      categories: ['Suspicious message', 'Possible impersonation', 'Unwanted contact', 'Suspicious website', 'Other'],
      searchInput: '', result: null, recent: [], reports: [], saved: [], toast: '', exportBusy: false,
      isDemoMode: false, demoScenario: null, demoScenarios: listDemoScenarios(),
      reportForm: { indicator: '', category: 'Suspicious message', description: '' },
      investigationCases: [], selectedCaseId: '',
      caseForm: { title: '', objective: '' },
      evidenceForm: { title: '', sourceName: '', sourceUrl: '', description: '', limitations: '' },
      observationForm: { claim: '', kind: 'hypothesis', evidenceId: '', rationale: '', confidence: 'low', subjectKey: '', stance: 'neutral' },
      challengeForm: { observationId: '', counterEvidenceId: '', rationale: '' },
      relationshipForm: { from: '', to: '', relation: '', basis: '', confidence: 'low' },
      caseNote: ''
    }
  },
  computed: {
    pageTitle() { return this.activeTab === 'cases' ? 'Investigation workspace' : this.t(({ dashboard: 'overview', search: 'investigate', feed: 'reports', report: 'newReport', saved: 'saved', settings: 'settings' })[this.activeTab]) },
    localeDirection() { return getLocaleMeta(this.locale).dir },
    pageSubtitle() { return ({ dashboard: 'Your personal space for reviewing and organizing digital trust signals.', search: 'Review an indicator with a clear, structured preliminary analysis.', cases: 'Create cases, preserve evidence provenance, and separate facts from analyst interpretation.', feed: 'Your private record of reported observations.', report: 'Capture the facts while the details are still clear.', saved: 'Your bookmarked indicators, ready for another look.', settings: 'Manage your local workspace and understand its current capabilities.' })[this.activeTab] },
    isCurrentSaved() { return !!(this.result && this.saved.some(x => x.value === this.result.value && x.type === this.result.type)) },
    currentCase() { return this.investigationCases.find(x => x.id === this.selectedCaseId) || null },
    currentCaseSummary() { return this.currentCase ? buildCaseSummary(this.currentCase) : null },
    declaredConflicts() { return this.currentCase ? findDeclaredEvidenceConflicts(this.currentCase.observations) : [] }
  },
  onShow() { this.refreshData(); this.$nextTick(() => { if (typeof document !== 'undefined' && document.documentElement) { document.documentElement.lang = this.locale; document.documentElement.dir = this.localeDirection } }) },
  methods: {
    t(key) { return translate(this.locale, key) },
    setTheme(value) { const result = writeTheme(value); this.theme = result.theme; this.notify(result.ok ? this.t('themeChanged') : 'Theme changed for this session; preference could not be saved.') },
    setLocale(code) { const result = writeLocale(code); this.locale = result.locale; this.$nextTick(() => { if (typeof document !== 'undefined' && document.documentElement) { document.documentElement.lang = this.locale; document.documentElement.dir = this.localeDirection } }); this.notify(result.ok ? this.t('languageChanged') : 'Language changed for this session; preference could not be saved.') },
    go(tab) { this.activeTab = tab; if (tab === 'cases') this.loadInvestigationCases() },
    loadInvestigationCases() { if (this.isDemoMode) return; const state = readInvestigationStore(); if (!state.ok) return this.notify('Case storage is unavailable or unreadable; no data was changed.'); this.investigationCases = state.store.cases; if (!this.investigationCases.some(x => x.id === this.selectedCaseId)) this.selectedCaseId = this.investigationCases[0]?.id || '' },
    persistInvestigationCases(nextCases) { const result = writeInvestigationStore({ schemaVersion: 1, cases: nextCases }); if (!result.ok) return this.notify('Could not safely save case changes.'); this.investigationCases = nextCases; return true },
    createCase() { if (this.isDemoMode) return this.notify('Case editing is disabled in demo mode to keep simulated and real data separate.'); const made = createInvestigation(this.caseForm); if (!made.ok) return this.notify('Add a case title first.'); const next = [made.case, ...this.investigationCases]; if (this.persistInvestigationCases(next)) { this.selectedCaseId = made.case.id; this.caseForm = { title: '', objective: '' }; this.notify('Investigation case created on this device.') } },
    evidenceMetadataStatus(evidence) { return assessEvidenceMetadata(evidence).metadataStatus },
    beginChallenge(observationId) { this.challengeForm = { observationId, counterEvidenceId: '', rationale: '' } },
    submitChallenge() { const item = this.currentCase; if (!item) return; const draft = JSON.parse(JSON.stringify(item)); const result = challengeObservation(draft, this.challengeForm.observationId, this.challengeForm); if (!result.ok) return this.notify(result.error === 'counter_evidence_required' ? 'Select counter-evidence already attached to this case.' : 'Add a clear challenge rationale.'); if (this.persistInvestigationCases(this.investigationCases.map(x => x.id === draft.id ? draft : x))) { this.challengeForm = { observationId: '', counterEvidenceId: '', rationale: '' }; this.notify('Challenge recorded. The finding remains unresolved pending human review.') } },
    addCaseEvidence() { const item = this.currentCase; if (!item) return; const draft = JSON.parse(JSON.stringify(item)); const added = addEvidence(draft, this.evidenceForm); if (!added.ok) return this.notify('Evidence needs a title and a valid public HTTP(S) source URL, if supplied.'); if (this.persistInvestigationCases(this.investigationCases.map(x => x.id === draft.id ? draft : x))) { this.evidenceForm = { title: '', sourceName: '', sourceUrl: '', description: '', limitations: '' }; this.notify('Evidence metadata added. Source content was not fetched.') } },
    addCaseObservation() { const item = this.currentCase; if (!item) return; const draft = JSON.parse(JSON.stringify(item)); const added = addObservation(draft, this.observationForm); if (!added.ok) return this.notify(added.error === 'fact_requires_linked_evidence' ? 'Observed facts must link to evidence.' : 'Add an observation claim first.'); if (this.persistInvestigationCases(this.investigationCases.map(x => x.id === draft.id ? draft : x))) { this.observationForm = { claim: '', kind: 'hypothesis', evidenceId: '', rationale: '', confidence: 'low', subjectKey: '', stance: 'neutral' }; this.notify('Observation recorded with its evidence/interpretation label.') } },
    addCaseAnalystNote() { const item = this.currentCase; if (!item) return; const draft = JSON.parse(JSON.stringify(item)); if (!addCaseNote(draft, { body: this.caseNote }).ok) return this.notify('Write a note first.'); if (this.persistInvestigationCases(this.investigationCases.map(x => x.id === draft.id ? draft : x))) { this.caseNote = ''; this.notify('Analyst note saved.') } },
    addCaseRelationship() { const item = this.currentCase; if (!item) return; const draft = JSON.parse(JSON.stringify(item)); const added = addRelationship(draft, this.relationshipForm); if (!added.ok) return this.notify('Add two distinct endpoints, a relationship label and the supporting basis.'); if (this.persistInvestigationCases(this.investigationCases.map(x => x.id === draft.id ? draft : x))) { this.relationshipForm = { from: '', to: '', relation: '', basis: '', confidence: 'low' }; this.notify('Analyst-asserted relationship recorded; it is not proof of identity.') } },
    updateCaseStatus(status) { const item = this.currentCase; if (!item) return; const draft = JSON.parse(JSON.stringify(item)); if (!setCaseStatus(draft, status).ok) return; this.persistInvestigationCases(this.investigationCases.map(x => x.id === draft.id ? draft : x)) },
    refreshData() {
      if (this.isDemoMode) return
      const dataState = getDataState()
      const recentState = getRecentState()
      this.reports = dataState.data.reports
      this.saved = dataState.data.saved
      const caseState = readInvestigationStore()
      if (caseState.ok) this.investigationCases = caseState.store.cases
      else this.notify('Investigation records could not be read safely; existing data was not overwritten.')
      this.recent = recentState.recent
      if (!dataState.ok || !recentState.ok) this.notify('Some local data could not be read. TrustRadar will not overwrite unreadable records.')
    },
    loadRecent() { return this.isDemoMode ? this.recent : getRecentState().recent },
    storeRecent(list) { return setRecent(list) },
    async runSearch(forceRefresh = false) {
      const value = String(this.searchInput || '').trim()
      if (!value) return this.notify('Enter an indicator to begin.')
      try {
        const analysis = this.isDemoMode
          ? analyzeIndicator(value)
          : await getCachedOrFetchAnalysis(value, target => analyzeIndicator(target), forceRefresh)
        this.result = analysis
        this.activeTab = 'search'
        const { cacheInfo, ...historyRecord } = analysis
        const list = this.loadRecent().filter(x => !(x.value === analysis.value && x.type === analysis.type))
        list.unshift(historyRecord)
        if (this.isDemoMode) { this.recent = list.slice(0, 30) }
        else { const recentWrite = this.storeRecent(list.slice(0, 30)); this.refreshData(); if (!recentWrite.persisted) this.notify('Analysis completed, but search history could not be saved.') }
        if (analysis.type === 'unknown') this.notify('Input not recognized. Check the format and try again.')
      } catch (error) {
        this.notify(`Analysis failed: ${String(error?.message || 'unexpected error')}`)
      }
    },
    openResult(entry) { this.searchInput = entry.value; this.runSearch(false) },
    async exportCurrentReport() {
      if (!this.result || this.exportBusy) return
      this.exportBusy = true
      try {
        const exported = await exportAuditReport(this.result, this.result.value)
        if (exported.ok) this.notify(`Audit report exported: ${exported.filename}`)
        else this.notify(exported.error === 'export_unsupported' ? 'Report export is not supported in this runtime.' : 'Could not export the audit report.')
      } catch (error) {
        this.notify(`Export failed: ${String(error?.message || 'unexpected error')}`)
      } finally {
        this.exportBusy = false
      }
    },
    saveCurrent() {
      if (this.isDemoMode) {
        if (!this.result || this.result.type === 'unknown') return this.notify('Only recognized demo indicators can be saved.')
        const item = { value: this.result.value, type: this.result.type, savedAt: new Date().toISOString(), demo: true }
        const index = this.saved.findIndex(x => x.value === item.value && x.type === item.type)
        if (index >= 0) this.saved.splice(index, 1); else this.saved.unshift(item)
        return this.notify(index >= 0 ? 'Removed from this demo session.' : 'Saved in this demo session only.')
      }
      if (!this.result || this.result.type === 'unknown') return this.notify('Only recognized indicators can be saved.')
      const item = { value: this.result.value, type: this.result.type, savedAt: new Date().toISOString() }
      const data = toggleSaved(item)
      if (!data.persisted) return this.notify(this.storageErrorMessage(data))
      this.saved = data.saved
      this.notify(this.saved.some(x => x.value === item.value && x.type === item.type) ? 'Case added to saved investigations.' : 'Case removed from saved investigations.')
    },
    removeCase(entry) { if (this.isDemoMode) { this.saved = this.saved.filter(x => !(x.value === entry.value && x.type === entry.type)); return this.notify('Removed from this demo session only.') } const data = removeSaved(entry); if (!data.persisted) return this.notify(this.storageErrorMessage(data)); this.saved = data.saved; this.notify('Saved case removed.') },
    submitReport() {
      if (this.isDemoMode) {
        const indicator = this.reportForm.indicator.trim(), description = this.reportForm.description.trim()
        if (!indicator || !description) return this.notify('Add an indicator and describe the simulated observation.')
        this.reports.unshift({ id: `demo-user-${Date.now()}`, indicator, category: this.reportForm.category, description: `[DEMO] ${description}`, createdAt: new Date().toISOString(), verification: 'simulated', demo: true })
        this.reportForm = { indicator: '', category: 'Suspicious message', description: '' }; this.activeTab = 'feed'; return this.notify('Added to the demo session only; nothing was saved to your device.')
      }
      const indicator = this.reportForm.indicator.trim(), description = this.reportForm.description.trim()
      if (!indicator || !description) return this.notify('Add an indicator and describe what happened.')
      if (indicator.length < 3) return this.notify('Please check the indicator value.')
      const report = { id: String(Date.now()), indicator, category: this.reportForm.category, description, createdAt: new Date().toISOString(), verification: 'unverified' }
      const data = addReport(report)
      if (!data.persisted) return this.notify(this.storageErrorMessage(data))
      this.reports = data.reports
      this.reportForm = { indicator: '', category: 'Suspicious message', description: '' }; this.activeTab = 'feed'; this.notify('Report saved to this device.')
    },
    resetReport() { this.reportForm = { indicator: '', category: 'Suspicious message', description: '' } },
    onCategoryChange(e) { this.reportForm.category = this.categories[Number(e.detail.value)] || this.categories[0] },
    copyResult() {
      if (!this.result) return
      const summary = `TrustRadar 3.0.0-alpha.7 — Preliminary Analysis\nIndicator: ${this.result.value}\nType: ${this.result.type}\nStatus: ${this.result.status}\n\n${this.result.findings.map(x => `• ${x.label}: ${x.detail}`).join('\n')}\n\nNo external reputation source is connected. This is not a verified verdict.`
      // #ifdef H5
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(summary).then(() => this.notify('Analysis summary copied.')).catch(() => this.notify('Copy is unavailable in this browser.'))
      else this.notify('Clipboard is unavailable in this browser.')
      // #endif
      // #ifndef H5
      uni.setClipboardData({ data: summary, success: () => this.notify('Analysis summary copied.'), fail: () => this.notify('Could not copy the summary.') })
      // #endif
    },
    copyBackup() {
      if (this.isDemoMode) return this.notify('Backup is disabled in demo mode to prevent mixing simulated and real records.')
      const dataState = getDataState(), recentState = getRecentState(), caseState = readInvestigationStore()
      if (!dataState.ok || !recentState.ok || !caseState.ok) return this.notify('Backup cancelled: one or more local data stores could not be read safely.')
      const backup = { app: 'TrustRadar', version: '3.0.0-alpha.7', schemaVersion: 2, exportedAt: new Date().toISOString(), data: dataState.data, recent: recentState.recent, investigations: caseState.store }
      const payload = JSON.stringify(backup, null, 2)
      // #ifdef H5
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(payload).then(() => this.notify('Backup JSON copied.')).catch(() => this.notify('Could not copy backup in this browser.'))
      else this.notify('Clipboard is unavailable in this browser.')
      // #endif
      // #ifndef H5
      uni.setClipboardData({ data: payload, success: () => this.notify('Backup JSON copied.'), fail: () => this.notify('Could not copy backup.') })
      // #endif
    },
    clearLocalData() {
      if (this.isDemoMode) { this.startDemo(this.demoScenario.id); return this.notify('Demo session reset. Your real workspace was not touched.') }
      const clear = () => {
        const caseState = readInvestigationStore()
        if (!caseState.ok) return this.notify('Could not verify investigation storage. No data was cleared.')
        const cleared = clearWorkspace()
        if (!cleared) return this.notify('Could not clear all local workspace data. Nothing was marked as cleared.')
        const casesCleared = writeInvestigationStore(emptyInvestigationStore())
        if (!casesCleared.ok) return this.notify('Legacy workspace data was cleared, but investigation cases could not be cleared. Check local storage before continuing.')
        this.selectedCaseId = ''
        this.result = null
        this.searchInput = ''
        this.refreshData()
        this.notify('Local workspace data cleared.')
      }
      // #ifdef H5
      if (typeof window !== 'undefined' && window.confirm) { if (window.confirm('Delete all TrustRadar reports, saved indicators and search history from this device?')) clear() }
      else clear()
      // #endif
      // #ifndef H5
      uni.showModal({ title: 'Clear workspace data?', content: 'This permanently removes reports, saved indicators and search history from this device.', confirmText: 'Clear data', confirmColor: '#d95c64', success: res => { if (res.confirm) clear() } })
      // #endif
    },
    startDemo(scenarioId = 'domain') {
      const scenario = buildDemoScenario(scenarioId)
      this.isDemoMode = true
      this.reportForm = { indicator: '', category: 'Suspicious message', description: '' }
      this.demoScenario = scenario
      this.recent = scenario.recent
      this.saved = scenario.saved
      this.reports = scenario.reports
      this.searchInput = scenario.indicator
      this.result = analyzeIndicator(scenario.indicator)
      this.activeTab = 'dashboard'
      this.notify('Demo loaded. All records are fictional and stay in this session.')
    },
    exitDemo() {
      this.isDemoMode = false
      this.demoScenario = null
      this.reportForm = { indicator: '', category: 'Suspicious message', description: '' }
      this.result = null
      this.searchInput = ''
      this.refreshData()
      this.activeTab = 'dashboard'
      this.notify('Returned to your local workspace. Real records are unchanged.')
    },
    storageErrorMessage(result) {
      if (result && ['unreadable', 'invalid'].includes(result.storage)) return 'Existing local data could not be read safely. No changes were made.'
      return 'Device storage is unavailable. No changes were saved.'
    },
    notify(message) { this.toast = message; setTimeout(() => { this.toast = '' }, 2500) },
    typeIcon(type) { return ({ phone: '☎', email: '✉', domain: '◎', url: '↗', username: '@' })[type] || '?' },
    formatDate(value) { if (!value) return 'Just now'; return formatLocaleDate(value, this.locale) || 'Recently' }
  }
}
</script>

<style>
page{background:#080d1a;color:#eef2ff;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px}view,text,input,textarea,button{box-sizing:border-box}button::after{border:0}.app-shell{min-height:100vh;background:linear-gradient(135deg,#0a1020 0%,#0b1020 48%,#0d1225 100%);color:#edf1ff;position:relative;overflow:hidden;padding-bottom:30px}.ambient{position:fixed;pointer-events:none;border-radius:50%;filter:blur(1px);z-index:0}.ambient-one{width:540px;height:540px;top:-360px;right:7%;background:radial-gradient(circle,rgba(69,91,220,.17),transparent 68%)}.ambient-two{width:430px;height:430px;bottom:-300px;left:18%;background:radial-gradient(circle,rgba(0,191,190,.10),transparent 70%)}.topbar{height:78px;padding:0 4.2%;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(155,171,220,.11);background:rgba(9,14,29,.82);backdrop-filter:blur(18px);position:relative;z-index:3}.brand-lockup{display:flex;align-items:center;gap:13px}.brand-symbol{width:42px;height:42px;border-radius:13px;background:linear-gradient(145deg,#5869e8,#2e3ba8);box-shadow:0 8px 24px rgba(69,83,219,.3),inset 0 1px rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;position:relative;color:#fff;font-size:13px;font-weight:900;letter-spacing:-.8px}.symbol-spark{position:absolute;width:7px;height:7px;border-radius:50%;background:#75f0d2;right:5px;top:5px;box-shadow:0 0 10px #75f0d2}.brand-name{display:block;font-size:19px;font-weight:800;letter-spacing:-.7px}.brand-name text{color:#8e9cff;font-weight:500}.brand-caption{display:block;color:#74809f;font-size:8px;letter-spacing:1.45px;margin-top:4px}.topbar-right{display:flex;align-items:center;gap:17px}.workspace-state{display:flex;align-items:center;gap:8px;color:#a0accb;font-size:9px;letter-spacing:1.15px}.state-pulse,.inline-dot{width:6px;height:6px;border-radius:50%;background:#59d8b0;box-shadow:0 0 10px rgba(89,216,176,.65);display:inline-block}.updated-label i,.report-live i,.privacy-status i{width:6px;height:6px;border-radius:50%;background:#59d8b0;box-shadow:0 0 10px rgba(89,216,176,.65);display:inline-block}.avatar{width:33px;height:33px;border:1px solid rgba(150,164,221,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#aeb8f7;font-size:9px;font-weight:800;background:rgba(104,119,209,.12)}.app-layout{max-width:1600px;margin:auto;display:flex;position:relative;z-index:1}.sidebar{width:238px;flex-shrink:0;min-height:calc(100vh - 78px);padding:34px 19px 22px;border-right:1px solid rgba(155,171,220,.1);display:flex;flex-direction:column}.side-label{display:block;color:#65718f;font-size:8px;letter-spacing:1.7px;font-weight:800;margin:0 12px 13px}.nav-link{height:47px;border:1px solid transparent;border-radius:11px;display:flex;align-items:center;gap:13px;padding:0 13px;margin-bottom:5px;color:#9aa5c3;font-size:11px;transition:all .2s}.nav-link.selected{background:linear-gradient(100deg,rgba(86,101,223,.22),rgba(86,101,223,.07));border-color:rgba(126,139,250,.23);color:#f0f2ff;box-shadow:inset 3px 0 #8791ff}.nav-glyph{font-size:19px;width:20px;text-align:center;color:#929eff}.nav-link.selected .nav-glyph{color:#b7beff}.nav-count{margin-left:auto;background:rgba(132,143,255,.18);padding:3px 7px;border-radius:20px;font-size:9px;color:#c6cbff}.side-divider{height:1px;background:rgba(155,171,220,.1);margin:23px 4px 24px}.privacy-card{margin:2px 2px 0;padding:16px 14px;border:1px solid rgba(81,199,174,.17);border-radius:13px;background:linear-gradient(145deg,rgba(21,73,75,.22),rgba(16,35,51,.38))}.privacy-icon{width:30px;height:30px;border-radius:9px;background:rgba(69,203,170,.12);color:#74e2c2;display:flex;align-items:center;justify-content:center;font-size:18px}.privacy-title{display:block;margin-top:12px;font-size:11px;font-weight:750;color:#d9f8ef}.privacy-copy{display:block;margin-top:6px;font-size:9px;line-height:1.65;color:#8ba9a8}.privacy-status{display:flex;align-items:center;gap:7px;margin-top:13px;color:#70cbb2;font-size:7px;letter-spacing:1px}.privacy-status i{width:5px;height:5px}.sidebar-bottom{margin-top:auto;padding:18px 8px 0;color:#576482;font-size:8px;letter-spacing:1px;display:flex;flex-direction:column;gap:6px}.sidebar-bottom text:last-child{color:#434e6a;font-size:7px}.main-content{flex:1;min-width:0;padding:34px clamp(20px,3.5vw,54px) 28px}.page-topline{display:flex;align-items:center;justify-content:space-between;margin-bottom:25px;gap:14px}.breadcrumb{display:block;color:#687593;font-size:8px;letter-spacing:1.5px;font-weight:700}.breadcrumb text{color:#a2aaff;margin:0 7px}.page-title{display:block;font-size:27px;font-weight:800;letter-spacing:-1px;margin-top:8px}.page-subtitle{display:block;color:#8792b1;font-size:11px;margin-top:5px}.date-chip{display:flex;align-items:center;gap:8px;border:1px solid rgba(144,158,208,.16);border-radius:30px;padding:9px 13px;color:#9ba6c4;font-size:8px;letter-spacing:1px;background:rgba(30,39,70,.32)}.date-dot{width:6px;height:6px;border-radius:50%;background:#8c98ff}.welcome-banner{min-height:260px;position:relative;overflow:hidden;border:1px solid rgba(134,145,255,.24);border-radius:19px;padding:31px 35px;background:radial-gradient(ellipse at 75% 40%,rgba(87,93,212,.28),transparent 34%),linear-gradient(112deg,#1a2450 0%,#171d3d 48%,#17264a 100%);box-shadow:0 20px 55px rgba(0,0,0,.17)}.welcome-banner:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,21,49,.05),transparent 65%,rgba(89,110,220,.08));pointer-events:none}.welcome-copy{max-width:600px;position:relative;z-index:2}.welcome-tag{display:flex;align-items:center;gap:7px;color:#b4baff;font-size:8px;letter-spacing:1.65px;font-weight:800}.tag-star{font-size:13px;color:#7de4d1}.welcome-title{display:block;font-size:33px;font-weight:850;letter-spacing:-1.6px;line-height:1.2;margin-top:14px}.gradient-text{background:linear-gradient(90deg,#9ca8ff,#73e4d2);-webkit-background-clip:text;background-clip:text;color:transparent}.welcome-description{display:block;color:#b0b8d3;font-size:11px;line-height:1.75;max-width:480px;margin-top:10px}.welcome-actions{display:flex;align-items:center;gap:11px;margin-top:21px}.button-primary{height:42px;padding:0 17px;border:0;border-radius:9px;background:linear-gradient(110deg,#8a94ff,#6673e8);color:#fff;font-size:10px;font-weight:800;box-shadow:0 8px 20px rgba(91,105,226,.22);white-space:nowrap}.button-primary text{margin-left:10px;font-size:14px}.button-quiet{height:40px;padding:0 14px;background:rgba(255,255,255,.035);border:1px solid rgba(187,195,255,.18);border-radius:9px;color:#c0c8e6;font-size:10px}.banner-art{position:absolute;width:270px;height:230px;right:7%;top:13px;z-index:1}.art-orbit{position:absolute;border:1px solid rgba(158,169,255,.22);border-radius:50%;transform:rotate(-28deg)}.orbit-a{width:215px;height:130px;top:47px;left:28px}.orbit-b{width:240px;height:170px;top:25px;left:15px;transform:rotate(58deg);border-color:rgba(108,222,209,.16)}.art-core{position:absolute;left:98px;top:75px;width:76px;height:76px;border-radius:23px;background:linear-gradient(145deg,#7582f5,#414fba);box-shadow:0 0 0 12px rgba(124,136,255,.08),0 15px 35px rgba(0,0,0,.3),inset 0 1px rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px}.core-dot{position:absolute;width:9px;height:9px;right:8px;top:8px;background:#7bf0d0;border:2px solid #6370d8;border-radius:50%}.art-satellite{position:absolute;width:30px;height:30px;border-radius:10px;background:#202c5b;border:1px solid rgba(164,174,255,.28);display:flex;align-items:center;justify-content:center;color:#aab4ff;font-size:15px;box-shadow:0 8px 22px rgba(0,0,0,.2)}.sat-a{top:27px;left:47px;color:#81e6c9}.sat-b{top:143px;right:23px}.sat-c{bottom:15px;left:80px;color:#f5c77d}.banner-index{position:absolute;right:24px;bottom:19px;color:#c1c8ff;font-size:10px;letter-spacing:1px}.banner-index span{color:#717da9}.section-heading{display:flex;justify-content:space-between;align-items:end;margin:25px 2px 12px}.section-title{display:block;font-size:14px;font-weight:800;letter-spacing:-.2px}.section-caption{display:block;color:#7885a4;font-size:9px;margin-top:4px}.updated-label{display:flex;align-items:center;gap:7px;color:#7893a7;font-size:7px;letter-spacing:1.1px}.updated-label i{width:5px;height:5px}.stats-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.stat-card{position:relative;overflow:hidden;min-height:120px;padding:16px 18px;border:1px solid rgba(143,158,209,.14);border-radius:13px;background:linear-gradient(145deg,rgba(25,34,65,.82),rgba(17,24,48,.92))}.stat-top{display:flex;align-items:center;justify-content:space-between}.stat-label{color:#8894b5;font-size:8px;letter-spacing:1.2px;font-weight:800}.stat-icon{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;background:rgba(121,137,255,.12);color:#a5adff}.stat-number{display:block;font-size:27px;font-weight:850;letter-spacing:-1px;margin-top:7px}.stat-foot{display:block;color:#74809f;font-size:8px;margin-top:2px}.stat-accent{position:absolute;width:90px;height:90px;border-radius:50%;right:-34px;bottom:-58px;background:rgba(119,135,255,.1);filter:blur(2px)}.stat-violet .stat-icon{color:#c6a4ff;background:rgba(176,133,255,.12)}.stat-violet .stat-accent{background:rgba(176,133,255,.11)}.stat-amber .stat-icon{color:#f5c77d;background:rgba(245,199,125,.1)}.stat-amber .stat-accent{background:rgba(245,199,125,.1)}.dashboard-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:13px;margin-top:13px}.surface{border:1px solid rgba(143,158,209,.14);border-radius:14px;background:linear-gradient(145deg,rgba(22,30,57,.9),rgba(15,22,43,.95));padding:19px;min-width:0;box-shadow:0 12px 35px rgba(0,0,0,.08)}.surface-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.surface-title{display:block;font-size:13px;font-weight:800;letter-spacing:-.2px}.surface-subtitle{display:block;color:#7d89a9;font-size:9px;margin-top:4px;line-height:1.5}.text-button{background:transparent;border:0;color:#a5adff;font-size:9px;padding:5px}.recent-list{margin-top:13px}.recent-item,.saved-item{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid rgba(148,161,207,.09)}.recent-item:last-child,.saved-item:last-child{border-bottom:0}.indicator-icon{width:34px;height:34px;flex-shrink:0;border-radius:10px;background:rgba(121,137,255,.12);color:#aeb6ff;display:flex;align-items:center;justify-content:center;font-size:16px}.kind-email{color:#82dbc7;background:rgba(89,216,176,.1)}.kind-domain{color:#e3b9ff;background:rgba(182,132,255,.1)}.kind-username{color:#f1c980;background:rgba(241,201,128,.1)}.recent-info,.saved-main{flex:1;min-width:0}.recent-value,.saved-value{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e5e9ff;font-size:10px;font-weight:700}.recent-meta,.saved-meta{display:block;color:#7885a4;font-size:8px;margin-top:5px}.recent-meta b,.saved-meta b,.register-meta b{color:#56617f;margin:0 4px}.recent-status{padding:5px 7px;border-radius:5px;background:rgba(90,210,176,.08);color:#7acdb5;font-size:6px;letter-spacing:.8px;white-space:nowrap}.row-arrow{color:#8591c4;font-size:14px;padding:4px}.principle-badge{border:1px solid rgba(134,146,255,.2);border-radius:5px;padding:5px 7px;color:#aab2ff;font-size:7px;letter-spacing:1px}.principle-row{display:flex;gap:12px;margin-top:19px;align-items:flex-start}.principle-number{font-size:9px;color:#8e9aff;font-weight:800;padding-top:2px}.principle-title{display:block;color:#e4e8fa;font-size:10px;font-weight:750}.principle-copy{display:block;color:#7e8aa8;font-size:8px;line-height:1.6;margin-top:4px}.empty-inline{display:flex;align-items:center;gap:13px;padding:24px 0 10px}.empty-illustration{width:44px;height:44px;border-radius:13px;background:rgba(127,141,255,.1);color:#a6afff;display:flex;align-items:center;justify-content:center;font-size:22px}.empty-title{display:block;color:#e4e9ff;font-size:11px;font-weight:800}.empty-copy{display:block;color:#7f8bab;font-size:9px;line-height:1.6;margin-top:5px}.button-outline{height:38px;padding:0 13px;border:1px solid rgba(145,158,220,.23);border-radius:8px;background:rgba(116,130,231,.06);color:#c1c8f5;font-size:9px;white-space:nowrap}.button-outline.small{height:32px;margin-left:auto;font-size:8px}.search-layout{display:grid;grid-template-columns:1fr 1.12fr;gap:14px;align-items:stretch}.search-workspace,.result-workspace{min-height:500px;padding:22px}.search-intro{display:flex;gap:12px;align-items:center}.search-emblem{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,rgba(117,132,255,.24),rgba(117,132,255,.08));border:1px solid rgba(142,154,255,.2);display:flex;align-items:center;justify-content:center;color:#b0b8ff;font-size:22px}.search-field-wrap{margin-top:30px}.field-overline{display:block;color:#8995b4;font-size:8px;letter-spacing:1.15px;font-weight:800}.field-overline span{color:#7e8cff;margin-left:5px}.search-field{display:flex;align-items:center;gap:9px;margin-top:10px;height:49px;border:1px solid rgba(135,150,220,.24);border-radius:9px;background:rgba(8,13,29,.55);padding:0 13px}.search-field:focus-within{border-color:rgba(135,150,255,.65);box-shadow:0 0 0 3px rgba(121,137,255,.08)}.search-field-icon{color:#a5adff;font-size:19px}.search-entry{flex:1;min-width:0;color:#f0f2ff;font-size:11px;background:transparent;height:100%}.search-entry::placeholder,.form-input::placeholder,.form-textarea::placeholder{color:#596582}.clear-entry{color:#8a96b5;font-size:18px;padding:4px}.input-helper{color:#6f7b9a;font-size:8px;margin-top:8px;line-height:1.5}.analyze-button{width:100%;margin-top:18px}.supported-types{margin-top:33px;padding-top:19px;border-top:1px solid rgba(148,161,207,.1)}.type-pills{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.type-pill{padding:8px 10px;border:1px solid rgba(145,158,220,.16);border-radius:7px;background:rgba(116,130,231,.045);color:#aab5d4;font-size:8px}.type-pill text{color:#aab1ff;margin-right:5px}.result-live,.report-live{display:flex;align-items:center;gap:6px;color:#80cbb6;font-size:7px;letter-spacing:1px}.report-live i{width:5px;height:5px}.analysis-empty{height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.empty-rings{width:75px;height:75px;border-radius:24px;border:1px solid rgba(139,151,255,.25);background:radial-gradient(circle,rgba(122,137,255,.2),rgba(122,137,255,.04));display:flex;align-items:center;justify-content:center;color:#b3bbff;font-size:20px;font-weight:900;box-shadow:0 0 0 12px rgba(122,137,255,.035),0 0 0 25px rgba(122,137,255,.02)}.analysis-empty .empty-title{margin-top:27px}.analysis-empty .empty-copy{max-width:250px}.empty-steps{display:flex;gap:13px;margin-top:24px;flex-wrap:wrap;justify-content:center}.empty-steps text{color:#73809e;font-size:7px}.empty-steps text{color:#a2abff;margin-right:4px}.analysis-result{margin-top:22px}.analysis-header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding-bottom:15px;border-bottom:1px solid rgba(148,161,207,.1)}.analysis-overline{display:block;color:#7986a8;font-size:7px;letter-spacing:1.3px;font-weight:800}.analysis-value{display:block;color:#f0f2ff;font-size:17px;font-weight:800;word-break:break-all;margin-top:7px}.analysis-type{border:1px solid rgba(139,151,255,.23);border-radius:6px;padding:6px 8px;color:#b2baff;font-size:7px;letter-spacing:.8px}.analysis-state{display:flex;gap:10px;align-items:center;padding:13px 0;border-bottom:1px solid rgba(148,161,207,.1)}.state-icon{width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(244,192,112,.12);color:#f0c17d;font-weight:900}.state-title{display:block;color:#e8e9f5;font-size:10px;font-weight:750}.state-desc{display:block;color:#7885a4;font-size:8px;margin-top:3px}.findings-heading{display:flex;justify-content:space-between;color:#8995b4;font-size:7px;letter-spacing:1.1px;font-weight:800;margin-top:16px}.findings-heading text{color:#65718f}.finding-item{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid rgba(148,161,207,.08)}.finding-bullet{width:7px;height:7px;border-radius:50%;background:#73cdb5;margin-top:4px;flex-shrink:0}.finding-bullet.warn{background:#edbd72}.finding-name{display:block;color:#e3e7f8;font-size:9px;font-weight:750}.finding-description{display:block;color:#8994b0;font-size:8px;line-height:1.55;margin-top:4px;word-break:break-word}.analysis-disclaimer,.form-notice{display:flex;flex-direction:column;gap:5px;padding:11px 12px;border:1px solid rgba(239,190,111,.16);border-radius:8px;background:rgba(133,94,38,.09);margin-top:14px;color:#b9a37c;font-size:8px;line-height:1.6}.analysis-disclaimer text:first-child,.form-notice text:first-child{color:#e5c184;font-size:7px;letter-spacing:1px}.analysis-actions{display:flex;gap:8px;margin-top:14px}.analysis-actions .button-primary,.analysis-actions .button-outline{flex:1}.full-surface{min-height:370px}.compact-button{height:35px;padding:0 12px;font-size:8px}.report-register{margin-top:15px}.register-item{display:flex;align-items:flex-start;gap:12px;padding:16px 0;border-bottom:1px solid rgba(148,161,207,.1)}.register-mark{width:30px;height:30px;border-radius:9px;background:rgba(241,190,112,.1);color:#efc27d;display:flex;align-items:center;justify-content:center;font-weight:900}.register-main{flex:1;min-width:0}.register-indicator{display:block;color:#e7eaff;font-size:10px;font-weight:800;word-break:break-all}.register-description{display:block;color:#9ba5c0;font-size:9px;line-height:1.6;margin-top:5px}.register-meta{display:block;color:#71809f;font-size:8px;margin-top:6px}.unverified-tag{padding:5px 7px;border-radius:5px;background:rgba(242,190,111,.08);color:#d9b779;font-size:6px;letter-spacing:.8px;white-space:nowrap}.unverified-tag.simulated{background:rgba(118,145,255,.1);color:#aeb8ff}.empty-state{min-height:290px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px}.empty-state .empty-title{margin-top:13px}.empty-state .empty-copy{max-width:290px;margin-bottom:15px}.report-layout{display:grid;grid-template-columns:1.35fr .8fr;gap:14px;align-items:start}.report-form-surface{padding:23px}.form-step{color:#8b97b8;font-size:7px;letter-spacing:1px}.form-step text{color:#aab2ff;margin-left:6px}.form-field{margin-top:22px;position:relative}.form-input,.form-textarea,.form-select{width:100%;border:1px solid rgba(135,150,220,.2);background:rgba(8,13,29,.5);border-radius:8px;color:#eef1ff;padding:0 13px;font-size:10px;margin-top:9px}.form-input{height:44px}.form-select{height:44px;display:flex;align-items:center;justify-content:space-between;color:#c1c8e2}.form-textarea{height:125px;padding:12px 13px;line-height:1.6}.character-count{display:block;text-align:right;color:#697694;font-size:7px;margin-top:5px}.form-notice{margin-top:18px}.form-actions{display:flex;align-items:center;gap:10px;margin-top:18px}.guidance-surface{padding:22px}.guidance-icon{width:37px;height:37px;border-radius:11px;background:rgba(89,216,176,.1);color:#79ddc0;display:flex;align-items:center;justify-content:center;font-size:20px}.guidance-title{display:block;color:#edf1ff;font-size:13px;font-weight:800;margin-top:15px}.guidance-copy{display:block;color:#8894b2;font-size:9px;line-height:1.7;margin-top:7px}.guidance-example{padding:12px;border:1px solid rgba(89,216,176,.13);border-radius:8px;background:rgba(89,216,176,.045);margin-top:18px}.guidance-example.avoid{border-color:rgba(239,190,111,.13);background:rgba(239,190,111,.04);margin-top:9px}.example-label{display:block;color:#7cd8bc;font-size:7px;letter-spacing:1px;font-weight:800;margin-bottom:6px}.avoid .example-label{color:#e3bd7b}.guidance-example text:last-child{display:block;color:#a6b2c5;font-size:8px;line-height:1.6}.saved-count{color:#dfe3ff;font-size:16px;font-weight:850}.saved-count text{color:#7885a4;font-size:7px;letter-spacing:1px;margin-left:3px}.saved-list{margin-top:15px}.saved-item{padding:15px 0}.saved-main{cursor:pointer}.remove-button{height:29px;padding:0 9px;border:1px solid rgba(235,128,139,.2);border-radius:6px;background:rgba(235,128,139,.06);color:#e49ba4;font-size:8px}.settings-grid{display:grid;grid-template-columns:1.4fr .8fr;gap:14px;align-items:start}.settings-main{padding:21px}.setting-entry{display:flex;align-items:center;gap:12px;padding:17px 0;border-bottom:1px solid rgba(148,161,207,.09)}.setting-entry:last-child{border-bottom:0}.setting-symbol{width:34px;height:34px;border-radius:10px;background:rgba(130,144,255,.1);color:#aab3ff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}.setting-info{flex:1;min-width:0}.setting-name{display:block;color:#e4e8fa;font-size:10px;font-weight:750}.setting-description{display:block;color:#808dab;font-size:8px;line-height:1.55;margin-top:4px}.setting-state{font-size:7px;letter-spacing:.8px;white-space:nowrap}.setting-state.good{color:#73d5b8}.setting-state.off{color:#c4a879}.backup-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0 2px}.danger-zone{padding:21px}.danger-icon{width:34px;height:34px;border-radius:10px;background:rgba(234,117,132,.1);color:#e9909a;display:flex;align-items:center;justify-content:center;font-size:18px}.danger-title{display:block;color:#f0e6eb;font-size:12px;font-weight:800;margin-top:14px}.danger-copy{display:block;color:#92879b;font-size:8px;line-height:1.7;margin-top:6px}.danger-button{height:36px;width:100%;border:1px solid rgba(234,117,132,.24);border-radius:7px;background:rgba(234,117,132,.08);color:#ed9ca6;font-size:8px;margin-top:16px}.footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:22px;padding:14px 2px;color:#596582;font-size:7px;letter-spacing:.25px}.footer-brand{display:flex;align-items:center;gap:7px;color:#8793b1}.footer-brand:first-letter{color:#a5adff}.footer-brand text{font-size:7px;letter-spacing:1px}.mobile-nav{display:none}.toast-message{position:fixed;left:50%;bottom:25px;transform:translateX(-50%);z-index:10;padding:12px 18px;border:1px solid rgba(151,164,255,.25);border-radius:9px;background:#242e5b;color:#f1f2ff;font-size:10px;box-shadow:0 12px 35px rgba(0,0,0,.35);max-width:90%;text-align:center}
@media(max-width:1100px){.sidebar{width:205px}.main-content{padding:28px 23px}.banner-art{right:1%;opacity:.75}.dashboard-grid{grid-template-columns:1.15fr 1fr}.search-layout{grid-template-columns:1fr}.search-workspace,.result-workspace{min-height:auto}.analysis-empty{height:300px}}
.demo-inventory-surface{margin:0 0 20px;padding:18px}.demo-inventory-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}.demo-inventory-item{min-width:0;padding:12px 10px;border:1px solid rgba(140,157,207,.13);border-radius:9px;background:rgba(10,17,34,.38);display:flex;flex-direction:column;gap:4px}.demo-inventory-count{font-size:21px;font-weight:850;color:#e9bd7d}.demo-inventory-label{font-size:9px;color:#aeb8d1;text-transform:capitalize;overflow-wrap:anywhere}.demo-inventory-note{margin-top:13px;padding:10px 12px;border-radius:8px;background:rgba(224,164,86,.07);color:#b9c1d6;font-size:10px;line-height:1.6}.demo-inventory-actions{display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}@media(max-width:900px){.demo-inventory-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:520px){.demo-inventory-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.demo-inventory-count{font-size:18px}.demo-inventory-item{padding:10px 8px}}

@media(max-width:760px){.topbar{height:67px;padding:0 17px}.brand-symbol{width:37px;height:37px}.brand-name{font-size:17px}.brand-caption{font-size:7px}.workspace-state{font-size:7px}.avatar{width:30px;height:30px}.sidebar{display:none}.main-content{padding:24px 15px 92px}.page-title{font-size:24px}.date-chip{font-size:6px;padding:8px}.welcome-banner{min-height:280px;padding:24px 20px}.welcome-title{font-size:27px;max-width:280px}.welcome-description{font-size:10px;max-width:300px}.banner-art{right:-85px;top:75px;opacity:.3;transform:scale(.8)}.banner-index{right:15px;bottom:12px}.stats-grid{grid-template-columns:1fr;gap:8px}.stat-card{min-height:95px;padding:13px 15px}.stat-number{font-size:23px}.dashboard-grid,.report-layout,.settings-grid{grid-template-columns:1fr}.surface{padding:16px}.section-heading{margin-top:22px}.section-caption{font-size:8px}.recent-status{display:none}.empty-inline{flex-wrap:wrap}.empty-inline .button-outline{margin-left:57px}.search-layout{grid-template-columns:1fr}.search-workspace,.result-workspace{padding:17px}.analysis-value{font-size:14px}.report-form-surface{padding:17px}.guidance-surface{padding:17px}.setting-entry{gap:9px}.setting-state{font-size:6px}.footer{flex-direction:column;align-items:flex-start;gap:7px;padding-bottom:8px}.mobile-nav{position:fixed;display:flex;left:0;right:0;bottom:0;z-index:8;height:65px;padding-bottom:env(safe-area-inset-bottom);background:rgba(12,17,36,.97);backdrop-filter:blur(18px);border-top:1px solid rgba(155,171,220,.15);justify-content:space-around}.mobile-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#7783a3;font-size:7px}.mobile-nav-item.active{color:#b0b7ff}.mobile-icon{font-size:17px}.analysis-actions{flex-direction:column}.analysis-actions button{width:100%}}
@media(min-width:761px) and (max-width:980px){.banner-art{right:-55px;opacity:.42}.welcome-copy{max-width:560px}.dashboard-grid{grid-template-columns:1fr}.report-layout,.settings-grid{grid-template-columns:1fr}}

.demo-launch-button,.demo-exit-button{height:34px;padding:0 13px;border-radius:8px;font-size:9px;font-weight:800;letter-spacing:.2px;margin:0 10px 0 0}.demo-launch-button{background:linear-gradient(135deg,#4f63d9,#3946a8);color:#fff;box-shadow:0 5px 16px rgba(75,91,213,.22)}.demo-exit-button{background:rgba(232,174,91,.12);border:1px solid rgba(232,174,91,.28);color:#f0c17d}.demo-banner{position:relative;z-index:2;margin:18px 4.2% 0;padding:17px 19px;border:1px solid rgba(232,174,91,.24);border-radius:13px;background:linear-gradient(110deg,rgba(115,77,33,.22),rgba(27,34,65,.88));display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}.demo-banner-main{display:flex;flex-direction:column;gap:5px;min-width:220px;flex:1}.demo-kicker{color:#e9bd7d;font-size:7px;font-weight:900;letter-spacing:1.2px}.demo-banner-title{color:#f2f3ff;font-size:15px;font-weight:850}.demo-banner-copy{color:#aab3ce;font-size:9px;line-height:1.5}.demo-scenarios{display:flex;gap:6px;flex-wrap:wrap}.demo-scenario-button{height:31px;padding:0 9px;border:1px solid rgba(166,177,225,.2);border-radius:7px;background:rgba(9,14,29,.4);color:#aeb8d7;font-size:7px}.demo-scenario-button.active{border-color:rgba(238,190,121,.55);background:rgba(224,164,86,.14);color:#f0c17d}
@media(max-width:760px){.topbar-right{gap:2px}.demo-launch-button,.demo-exit-button{height:30px;padding:0 8px;font-size:7px;margin-right:5px}.demo-banner{margin:12px 12px 0;padding:14px}.demo-scenarios{width:100%}.demo-scenario-button{flex:1;min-width:calc(50% - 6px);height:auto;min-height:32px}}


/* UX foundation carried forward from 2.6.1: visible focus, comfortable touch, and motion preferences. */
button, [role="button"], input, textarea, select { -webkit-tap-highlight-color: transparent; }
button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible,
.nav-link:focus-visible, .mobile-nav-item:focus-visible, .recent-item:focus-visible,
.saved-main:focus-visible, .type-pill:focus-visible {
  outline: 3px solid #9da8ff;
  outline-offset: 3px;
}
button { touch-action: manipulation; }
.mobile-nav-item { min-height: 44px; }
.recent-item, .nav-link, .type-pill { scroll-margin-block: 16px; }
.toast-message { padding: 14px 18px; line-height: 1.5; }
@media (max-width: 760px) {
  .mobile-nav { min-height: 68px; padding-bottom: max(env(safe-area-inset-bottom), 4px); }
  .mobile-nav-item { min-width: 0; min-height: 48px; }
  .mobile-icon { line-height: 1.2; }
  .button-primary, .button-quiet, .button-outline, .danger-button,
  .demo-launch-button, .demo-exit-button, .demo-scenario-button, .remove-button {
    min-height: 40px;
  }
  .search-entry, .form-input, .form-textarea, .form-select { font-size: 16px; }
  .toast-message { bottom: calc(78px + env(safe-area-inset-bottom)); max-width: calc(100% - 28px); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}


/* 3.0 alpha localization foundation */
.locale-panel{display:flex;flex-direction:column;gap:13px;padding:17px 0;border-bottom:1px solid rgba(148,161,207,.09)}
.locale-options{display:flex;gap:8px;flex-wrap:wrap}
.locale-option{min-height:40px;padding:0 15px;border:1px solid rgba(135,150,220,.2);border-radius:9px;background:rgba(8,13,29,.5);color:#b9c3e2;font-size:11px}
.locale-option.selected{border-color:rgba(126,139,250,.65);background:rgba(86,101,223,.2);color:#fff;box-shadow:inset 0 0 0 1px rgba(126,139,250,.18)}
[dir="rtl"] .app-shell{ text-align:right }
[dir="rtl"] .nav-link.selected{box-shadow:inset -3px 0 #8791ff}
[dir="rtl"] .nav-count{margin-left:0;margin-right:auto}
[dir="rtl"] .setting-entry,[dir="rtl"] .backup-row{direction:rtl}
@media(max-width:760px){.locale-option{flex:1;min-width:calc(50% - 8px)}}


.case-layout{display:grid;grid-template-columns:minmax(250px,.78fr) minmax(0,1.5fr);gap:18px;align-items:start}.case-list-panel,.case-detail-panel{padding:22px;min-width:0}.case-create-form,.case-form{display:flex;flex-direction:column;gap:9px;padding:14px 0;border-bottom:1px solid rgba(148,161,207,.12)}.compact-textarea{min-height:68px}.case-list{display:flex;flex-direction:column;gap:8px;margin-top:14px}.case-list-item{padding:13px;border:1px solid rgba(148,161,207,.14);border-radius:10px;cursor:pointer;background:rgba(12,19,38,.35)}.case-list-item.selected{border-color:rgba(128,143,255,.7);background:rgba(91,106,220,.12)}.case-list-title,.case-record-title{display:block;color:#e8edff;font-size:13px;font-weight:650;line-height:1.5}.case-list-meta,.case-record-meta{display:block;color:#8995b4;font-size:10px;margin-top:5px}.case-status{font-size:10px;color:#aab5ff;border:1px solid rgba(128,143,255,.3);padding:7px 9px;border-radius:7px}.case-status-actions{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.case-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:15px 0}.case-metrics view{display:flex;flex-direction:column;gap:5px;padding:12px;border-radius:9px;background:rgba(128,143,255,.07)}.case-metrics strong{font-size:20px;color:#cbd2ff}.case-metrics text{font-size:10px;color:#8995b4}.conflict-notice{border-color:rgba(220,164,73,.45);background:rgba(220,164,73,.06)}.challenge-form{border:1px solid rgba(92,167,255,.35);border-radius:12px;padding:14px}.case-form-actions{display:flex;gap:8px;flex-wrap:wrap}.case-section{padding:17px 0;border-top:1px solid rgba(148,161,207,.12)}.case-section-title{display:block;font-size:12px;font-weight:700;color:#bfc9ed;margin-bottom:11px}.case-record{padding:11px 12px;margin:8px 0;border:1px solid rgba(148,161,207,.11);border-radius:9px;background:rgba(10,16,32,.25)}.case-record-copy,.case-record-caution{display:block;font-size:11px;line-height:1.6;color:#b0bad4;margin-top:6px;overflow-wrap:anywhere}.case-record-caution{color:#d3b98a}.case-empty{padding:12px;color:#7f8baa;font-size:11px}.timeline-record{display:flex;gap:11px;padding:8px 0}.timeline-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#8794ff;margin-top:6px}.case-disclaimer{display:block;padding:12px;border-radius:8px;background:rgba(218,170,91,.08);color:#c7ad82;font-size:10px;line-height:1.6}.theme-light .case-list-title,.theme-light .case-record-title{color:#24314d}.theme-light .case-record-copy{color:#53617a}.theme-light .case-record-caution{color:#85632e}.theme-light .case-list-item,.theme-light .case-record{background:#f8faff;border-color:#dce3f0}.theme-light .case-metrics view{background:#edf0ff}.theme-light .case-metrics strong{color:#34469f}
@media(max-width:900px){.case-layout{grid-template-columns:1fr}.case-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* Readability pass: keep metadata legible without competing with page titles. */
@media (min-width: 761px) {
  .brand-caption, .side-label, .breadcrumb, .date-chip, .welcome-tag,
  .updated-label, .stat-label, .stat-foot, .recent-meta, .recent-status,
  .privacy-status, .footer, .sidebar-bottom, .demo-kicker,
  .demo-scenario-button, .form-step, .field-overline, .character-count,
  .example-label, .setting-state { font-size: 9px; }
  .demo-scenario-button { min-height: 34px; }
}
@media (max-width: 760px) {
  .brand-caption, .workspace-state, .date-chip, .section-caption,
  .stat-label, .stat-foot, .privacy-status, .demo-kicker,
  .demo-scenario-button, .setting-state, .mobile-nav-item,
  .field-overline, .input-helper, .character-count,
  .example-label, .footer { font-size: 8px; }
  .demo-scenario-button { min-height: 36px; padding: 5px 8px; }
  .mobile-nav-item { line-height: 1.35; }
}
.analysis-cache-meta{margin-top:10px;padding:8px 10px;border:1px solid rgba(119,150,220,.16);border-radius:7px;background:rgba(95,119,190,.07);color:#8795b8;font-size:8px;line-height:1.5}.analysis-actions button:disabled{opacity:.55;cursor:not-allowed}
</style>
<style>
/* Alpha 2 design tokens and theme layer. Existing dark palette remains the default. */
.app-shell{--tr-space-1:4px;--tr-space-2:8px;--tr-space-3:12px;--tr-space-4:16px;--tr-radius-sm:8px;--tr-radius-md:12px;--tr-focus:#9da8ff;--tr-shadow:0 10px 28px rgba(0,0,0,.12);--tr-bg:#0a1020;--tr-surface:rgba(18,25,48,.78);--tr-text:#edf1ff;--tr-muted:#8995b4;--tr-border:rgba(148,161,207,.14);--tr-accent:#8995ff;color:var(--tr-text)}
.app-shell.theme-light{--tr-bg:#f3f6fc;--tr-surface:rgba(255,255,255,.94);--tr-text:#17213a;--tr-muted:#5e6b84;--tr-border:rgba(55,75,115,.17);--tr-accent:#4659c8;background:linear-gradient(135deg,#f5f7fc,#eaf0fb 55%,#f7f9fd);color:var(--tr-text)}
.theme-light .topbar{background:rgba(255,255,255,.9);border-color:var(--tr-border)}
.theme-light .brand-name,.theme-light .page-title,.theme-light .surface-title,.theme-light .setting-name,.theme-light .section-title,.theme-light .recent-value,.theme-light .register-indicator{color:#17213a}
.theme-light .brand-caption,.theme-light .page-subtitle,.theme-light .surface-subtitle,.theme-light .setting-description,.theme-light .section-caption,.theme-light .recent-meta,.theme-light .register-description{color:#63718b}
.theme-light .sidebar{border-color:var(--tr-border)}
.theme-light .side-label{color:#73809a}
.theme-light .nav-link{color:#52617e}
.theme-light .nav-link.selected{background:rgba(82,101,216,.10);border-color:rgba(82,101,216,.25);color:#25356d}
.theme-light .surface,.theme-light .stat-card,.theme-light .settings-main,.theme-light .danger-zone{background:var(--tr-surface);border-color:var(--tr-border);box-shadow:0 10px 28px rgba(34,53,91,.06)}
.theme-light .welcome-banner{background:linear-gradient(115deg,#e5eaff,#edf8fb 60%,#e9f2ff);border-color:#d7e0f5}
.theme-light .welcome-title,.theme-light .welcome-description{color:#17213a}
.theme-light .welcome-description{opacity:.78}
.theme-light .stat-label,.theme-light .stat-foot{color:#63718b}
.theme-light .stat-number{color:#1d2b4a}
.theme-light .form-input,.theme-light .form-textarea,.theme-light .form-select,.theme-light .search-entry,.theme-light .locale-option,.theme-light .theme-option{background:#fff;color:#1c2944;border-color:#cbd5e8}
.theme-light .search-field{background:#fff;border-color:#cbd5e8}
.theme-light .search-entry::placeholder,.theme-light .form-input::placeholder,.theme-light .form-textarea::placeholder{color:#8793a9}
.theme-light .setting-entry,.theme-light .locale-panel,.theme-light .theme-panel{border-color:var(--tr-border)}
.theme-light .mobile-nav{background:rgba(255,255,255,.96);border-color:var(--tr-border)}
.theme-light .mobile-nav-item{color:#64718a}.theme-light .mobile-nav-item.active{color:#4054c4}
.theme-light .footer{color:#71809b}
.theme-light .privacy-card{background:#effaf7;border-color:#ccece2}.theme-light .privacy-title{color:#205e50}.theme-light .privacy-copy{color:#54776e}
.theme-light .danger-title{color:#772d3c}.theme-light .danger-copy{color:#765b63}
.theme-light .page-topline .breadcrumb{color:#77849d}
.theme-light .demo-banner{background:linear-gradient(110deg,#fff5e7,#f3f5fc);border-color:#ead8b9}.theme-light .demo-banner-title{color:#25314a}.theme-light .demo-banner-copy{color:#66738a}
.theme-light .theme-option.selected{background:#e8ecff;color:#283b9a;border-color:#8795e8}
.theme-panel{display:flex;flex-direction:column;gap:13px;padding:17px 0;border-bottom:1px solid rgba(148,161,207,.09)}
.theme-options{display:flex;gap:8px;flex-wrap:wrap}.theme-option{min-height:40px;min-width:90px;padding:0 15px;border:1px solid rgba(135,150,220,.2);border-radius:9px;background:rgba(8,13,29,.5);color:#b9c3e2;font-size:11px;text-transform:capitalize}.theme-option.selected{border-color:rgba(126,139,250,.65);background:rgba(86,101,223,.2);color:#fff;box-shadow:inset 0 0 0 1px rgba(126,139,250,.18)}
@media(prefers-color-scheme:light){.app-shell.theme-system{background:linear-gradient(135deg,#f5f7fc,#eaf0fb 55%,#f7f9fd);color:#17213a}.theme-system .topbar{background:rgba(255,255,255,.9)}.theme-system .surface,.theme-system .stat-card,.theme-system .settings-main,.theme-system .danger-zone{background:rgba(255,255,255,.94);border-color:rgba(55,75,115,.17);box-shadow:0 10px 28px rgba(34,53,91,.06)}.theme-system .brand-name,.theme-system .page-title,.theme-system .surface-title,.theme-system .setting-name,.theme-system .section-title,.theme-system .recent-value{color:#17213a}.theme-system .brand-caption,.theme-system .page-subtitle,.theme-system .surface-subtitle,.theme-system .setting-description,.theme-system .section-caption{color:#63718b}.theme-system .sidebar{border-color:rgba(55,75,115,.17)}.theme-system .mobile-nav{background:rgba(255,255,255,.96);border-color:rgba(55,75,115,.17)}.theme-system .form-input,.theme-system .form-textarea,.theme-system .form-select,.theme-system .search-entry{background:#fff;color:#1c2944;border-color:#cbd5e8}}
[dir="rtl"] .theme-options{direction:rtl}


/* TrustRadar 3.0 — vivid, balanced intelligence palette. */
.app-shell {
  --tr-bg:#080f1e; --tr-bg-deep:#0b1527; --tr-surface:#111e32; --tr-surface-raised:#192a43;
  --tr-text:#f4f7ff; --tr-muted:#b1bfd5; --tr-subtle:#8799b5; --tr-border:rgba(142,174,218,.20);
  --tr-accent:#25b8ff; --tr-accent-strong:#65d1ff; --tr-accent-soft:rgba(37,184,255,.15);
  --tr-brand:#ffb454; --tr-success:#25d6a0; --tr-warning:#ffb547; --tr-danger:#ff647c;
  --tr-violet:#b879ff; --tr-focus:#8bdcff; --tr-shadow:0 14px 34px rgba(0,0,0,.24);
  background:radial-gradient(ellipse at 78% 0%,rgba(24,105,190,.17),transparent 38%),var(--tr-bg); color:var(--tr-text);
}
.app-shell.theme-light {
  --tr-bg:#f3f7fc; --tr-bg-deep:#eaf1f9; --tr-surface:#fff; --tr-surface-raised:#f7faff;
  --tr-text:#17263d; --tr-muted:#52647d; --tr-subtle:#71839b; --tr-border:rgba(48,77,119,.17);
  --tr-accent:#087fca; --tr-accent-strong:#096fae; --tr-accent-soft:rgba(8,127,202,.10);
  --tr-brand:#b96a12; --tr-success:#087e5d; --tr-warning:#9a5a08; --tr-danger:#c43852;
  --tr-violet:#7540b8; --tr-focus:#087fca; --tr-shadow:0 10px 28px rgba(34,62,101,.08);
  background:radial-gradient(ellipse at 85% 0%,rgba(37,184,255,.09),transparent 42%),var(--tr-bg); color:var(--tr-text);
}
.app-shell .topbar{background:rgba(8,15,30,.92);border-color:var(--tr-border)}
.app-shell .sidebar{border-color:var(--tr-border)}
.app-shell .surface,.app-shell .stat-card,.app-shell .settings-main,.app-shell .danger-zone,.app-shell .case-list-panel,.app-shell .case-detail-panel{background:var(--tr-surface);border-color:var(--tr-border);box-shadow:var(--tr-shadow)}
.app-shell .surface-title,.app-shell .page-title,.app-shell .section-title,.app-shell .setting-name,.app-shell .recent-value,.app-shell .register-indicator,.app-shell .case-list-title,.app-shell .case-record-title{color:var(--tr-text)}
.app-shell .surface-subtitle,.app-shell .page-subtitle,.app-shell .section-caption,.app-shell .setting-description,.app-shell .recent-meta,.app-shell .register-description,.app-shell .case-list-meta,.app-shell .case-record-copy{color:var(--tr-muted)}
.app-shell .side-label,.app-shell .brand-caption,.app-shell .breadcrumb,.app-shell .stat-label,.app-shell .stat-foot{color:var(--tr-subtle)}
.app-shell .brand-symbol{background:linear-gradient(145deg,#ffbd63,#e87924);box-shadow:0 8px 24px rgba(255,160,62,.22)}
.app-shell .brand-symbol .symbol-spark{background:#25d6a0;box-shadow:0 0 10px rgba(37,214,160,.65)}
.app-shell .brand-name text{color:var(--tr-brand)}
.app-shell .nav-glyph{color:#69cfff}
.app-shell .nav-link.selected{background:linear-gradient(100deg,rgba(37,184,255,.22),rgba(184,121,255,.10));border-color:rgba(75,190,255,.38);color:var(--tr-text);box-shadow:inset 3px 0 var(--tr-accent)}
[dir="rtl"] .app-shell .nav-link.selected{box-shadow:inset -3px 0 var(--tr-accent)}
.app-shell .nav-link.selected .nav-glyph{color:#8bdcff}
.app-shell .button-primary,.app-shell .demo-launch-button{background:linear-gradient(105deg,#078bd8,#25b8ff);color:#fff;border-color:#25b8ff;box-shadow:0 7px 20px rgba(15,151,224,.22)}
.app-shell .button-primary:active,.app-shell .demo-launch-button:active{background:#087fca}
.app-shell .button-outline,.app-shell .button-quiet,.app-shell .text-button{border-color:var(--tr-border);color:var(--tr-accent-strong)}
.app-shell .button-quiet{background:var(--tr-accent-soft)}
.app-shell .welcome-banner{background:linear-gradient(112deg,#102c4a 0%,#173454 48%,#33254d 100%);border-color:rgba(62,181,255,.34)}
.app-shell .welcome-title{color:#fff}.app-shell .welcome-description{color:#d2e3f7}.app-shell .gradient-text{color:#ffb454;background:none;-webkit-text-fill-color:currentColor}.app-shell .welcome-tag{color:#a9dfff}.app-shell .tag-star{color:#ffb454}
.app-shell .art-core{border-color:rgba(74,199,255,.65);color:#65d1ff}.app-shell .art-orbit{border-color:rgba(74,199,255,.28)}
.app-shell .stat-blue{--stat-color:#25b8ff;--stat-soft:rgba(37,184,255,.15)}
.app-shell .stat-violet{--stat-color:#b879ff;--stat-soft:rgba(184,121,255,.15)}
.app-shell .stat-amber{--stat-color:#ffb454;--stat-soft:rgba(255,180,84,.15)}
.app-shell .stat-blue .stat-icon,.app-shell .stat-violet .stat-icon,.app-shell .stat-amber .stat-icon{color:var(--stat-color);background:var(--stat-soft)}
.app-shell .stat-blue .stat-accent{background:#25b8ff}.app-shell .stat-violet .stat-accent{background:#b879ff}.app-shell .stat-amber .stat-accent{background:#ffb454}
.app-shell .stat-number{color:var(--tr-text)}
.app-shell .inline-dot,.app-shell .state-pulse{background:var(--tr-success);box-shadow:0 0 9px rgba(37,214,160,.45)}
.app-shell .privacy-card{background:rgba(37,214,160,.09);border-color:rgba(37,214,160,.25)}.app-shell .privacy-icon{background:rgba(37,214,160,.15);color:#4be4b5}.app-shell .privacy-title{color:var(--tr-text)}.app-shell .privacy-copy,.app-shell .privacy-status{color:var(--tr-muted)}
.app-shell .demo-banner{background:rgba(255,180,84,.10);border-color:rgba(255,180,84,.34)}.app-shell .demo-kicker,.app-shell .demo-exit-button{color:var(--tr-warning)}.app-shell .demo-banner-title{color:var(--tr-text)}.app-shell .demo-banner-copy{color:var(--tr-muted)}
.app-shell .demo-scenario-button{background:var(--tr-bg-deep);color:var(--tr-muted);border-color:var(--tr-border)}.app-shell .demo-scenario-button.active{background:rgba(37,184,255,.14);color:var(--tr-accent-strong);border-color:var(--tr-accent)}
.app-shell .form-input,.app-shell .form-textarea,.app-shell .form-select,.app-shell .search-field,.app-shell .search-entry,.app-shell .locale-option,.app-shell .theme-option{background:var(--tr-bg-deep);color:var(--tr-text);border-color:var(--tr-border)}
.app-shell .search-entry::placeholder,.app-shell .form-input::placeholder,.app-shell .form-textarea::placeholder{color:var(--tr-subtle)}
.app-shell .locale-option.selected,.app-shell .theme-option.selected{background:var(--tr-accent-soft);border-color:var(--tr-accent);color:var(--tr-accent-strong);box-shadow:none}
.app-shell .case-list-item,.app-shell .case-record{background:var(--tr-bg-deep);border-color:var(--tr-border)}.app-shell .case-list-item.selected{background:var(--tr-accent-soft);border-color:var(--tr-accent)}.app-shell .case-metrics view{background:var(--tr-accent-soft)}.app-shell .case-metrics strong{color:var(--tr-accent-strong)}.app-shell .case-disclaimer{background:rgba(255,181,71,.11);color:var(--tr-warning)}
.app-shell button:focus-visible,.app-shell input:focus-visible,.app-shell textarea:focus-visible,.app-shell select:focus-visible,.app-shell .nav-link:focus-visible,.app-shell .mobile-nav-item:focus-visible{outline:2px solid var(--tr-focus);outline-offset:2px}
.app-shell.theme-light .topbar{background:rgba(255,255,255,.94)}.app-shell.theme-light .welcome-banner{background:linear-gradient(112deg,#e2f2ff 0%,#e9f5ff 48%,#f2eaff 100%);border-color:#c8e2f7}.app-shell.theme-light .welcome-title{color:#17263d}.app-shell.theme-light .welcome-description{color:#52647d}.app-shell.theme-light .privacy-card{background:#e8f8f2;border-color:#bde9d8}.app-shell.theme-light .privacy-title{color:#155c49}.app-shell.theme-light .privacy-copy,.app-shell.theme-light .privacy-status{color:#426d61}.app-shell.theme-light .mobile-nav{background:rgba(255,255,255,.97)}.app-shell.theme-light .mobile-nav-item.active{color:var(--tr-accent)}
@media(prefers-color-scheme:light){.app-shell.theme-system{--tr-bg:#f3f7fc;--tr-bg-deep:#eaf1f9;--tr-surface:#fff;--tr-surface-raised:#f7faff;--tr-text:#17263d;--tr-muted:#52647d;--tr-subtle:#71839b;--tr-border:rgba(48,77,119,.17);--tr-accent:#087fca;--tr-accent-strong:#096fae;--tr-accent-soft:rgba(8,127,202,.10);--tr-brand:#b96a12;--tr-success:#087e5d;--tr-warning:#9a5a08;--tr-danger:#c43852;--tr-violet:#7540b8;background:var(--tr-bg);color:var(--tr-text)}.app-shell.theme-system .topbar{background:rgba(255,255,255,.94);border-color:var(--tr-border)}.app-shell.theme-system .surface,.app-shell.theme-system .stat-card,.app-shell.theme-system .settings-main,.app-shell.theme-system .danger-zone{background:#fff;border-color:var(--tr-border);box-shadow:0 10px 28px rgba(34,62,101,.08)}.app-shell.theme-system .welcome-banner{background:linear-gradient(112deg,#e2f2ff,#e9f5ff 48%,#f2eaff)}.app-shell.theme-system .welcome-title{color:#17263d}.app-shell.theme-system .welcome-description{color:#52647d}.app-shell.theme-system .mobile-nav{background:rgba(255,255,255,.97);border-color:var(--tr-border)}}
.analysis-cache-meta{margin-top:10px;padding:8px 10px;border:1px solid rgba(119,150,220,.16);border-radius:7px;background:rgba(95,119,190,.07);color:#8795b8;font-size:8px;line-height:1.5}.analysis-actions button:disabled{opacity:.55;cursor:not-allowed}
</style>
