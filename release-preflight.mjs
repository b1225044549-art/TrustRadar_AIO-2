import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const required = [
  'node_modules/@dcloudio/uni-app/package.json',
  'node_modules/@dcloudio/uni-app-plus/package.json',
  'node_modules/@dcloudio/uni-h5/package.json',
  'node_modules/@dcloudio/vite-plugin-uni/package.json',
  'node_modules/vite/package.json',
]
const missing = required.filter(file => !fs.existsSync(file))
const lockExists = fs.existsSync('package-lock.json')
console.log(`Node: ${process.version}`)
console.log(`Package: ${pkg.name}@${pkg.version}`)
console.log(`Lockfile: ${lockExists ? 'present' : 'MISSING'}`)
if (missing.length) {
  console.error('Build dependencies missing:')
  for (const file of missing) console.error(` - ${file}`)
  console.error('Install dependencies with npm ci after a verified package-lock.json is available.')
  process.exitCode = 1
} else {
  console.log('Required H5/App build packages are installed.')
}
if (!lockExists) process.exitCode = 1
