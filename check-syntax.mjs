import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['utils', 'tests', 'scripts'];
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && (path.endsWith('.js') || path.endsWith('.mjs'))) files.push(path);
  }
}
for (const dir of roots) await walk(dir);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`FAIL ${relative(process.cwd(), file)}\n${result.stderr}`);
  } else process.stdout.write(`PASS ${relative(process.cwd(), file)}\n`);
}
if (failed) process.exitCode = 1;
else process.stdout.write(`\nSyntax check passed for ${files.length} JavaScript files.\n`);
