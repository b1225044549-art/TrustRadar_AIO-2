import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const page = readFileSync(new URL('../pages/index/index.vue', import.meta.url), 'utf8')
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'))

test('visible workspace metadata does not contain stale alpha.5 branding', () => {
  assert.match(page, /VERSION 3\.0\.0-ALPHA\.7/)
  assert.doesNotMatch(page, /ALPHA\.5|3\.0 A5/)
})

test('release metadata and locale documentation agree on alpha.7 and five locale foundations', () => {
  assert.equal(manifest.versionName, '3.0.0-alpha.7')
  assert.match(readme, /Arabic, English, French, German and Simplified Chinese/)
})

test('DCloud build toolchain uses exact compatible version pins', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const dcloudVersion = '3.0.0-5030420261029002'
  for (const name of ['@dcloudio/uni-app', '@dcloudio/uni-app-plus', '@dcloudio/uni-components', '@dcloudio/uni-h5']) {
    assert.equal(pkg.dependencies[name], dcloudVersion, `${name} must be pinned`)
  }
  assert.equal(pkg.devDependencies['@dcloudio/vite-plugin-uni'], dcloudVersion)
  assert.equal(pkg.devDependencies.vite, '5.2.8')
  assert.equal(pkg.dependencies.vue, '3.4.21')
  assert.equal(pkg.scripts['verify:release'], 'npm run verify && node scripts/release-preflight.mjs')
})
