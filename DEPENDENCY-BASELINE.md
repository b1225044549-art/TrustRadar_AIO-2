# Dependency baseline — TrustRadar 3.0.0-alpha.7

The DCloud Vue 3/Vite preset published on 2026-10-30 lists the matching UniApp packages at `3.0.0-5030420261029002`, Vue `^3.4.21`, and Vite `5.2.8`. This project pins the DCloud packages to that same release family and pins Vue/Vite to the documented baseline.

Reference: DCloud `uni-preset-vue` package manifest (Gitee), retrieved 2026-11-06: https://gitee.com/dcloudio/uni-preset-vue/blob/vite/package.json

## Important release status

- Floating `latest` dependency tags have been removed.
- `scripts/release-preflight.mjs` checks for the required H5/App packages and a lockfile before a release build.
- A lockfile has **not** been generated in this environment because the npm registry request timed out. Do not use `npm ci` until `package-lock.json` has been generated successfully in a network-enabled environment.
- No H5 or Android build is claimed until the actual build commands complete successfully.
