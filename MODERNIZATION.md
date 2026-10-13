# Ingre Modernization Checklist

## Phase 1: Package Updates (Foundation)
- [x] Update server packages to latest compatible versions (TypeScript 6)
- [x] Update client packages to latest compatible versions (TypeScript 6)
- [x] Resolve TypeScript version conflicts with @types/node
- [x] Convert server path aliases to relative imports
- [x] Convert client path aliases to relative imports
- [x] Ensure project builds and starts after updates. Client `react-scripts build` succeeds with `fork-ts-checker-webpack-plugin` 6.5.3 (6.5.2 threw on TypeScript 6 `performance.mark`). Server `tsc --noEmit` is clean and the API listens on `/graphql` once MongoDB is up.

## Phase 2: TypeScript Strictness
- [x] Server `tsc --noEmit` is clean
- [x] Client `tsc --noEmit` is clean (noImplicitAny satisfied)
- [x] ESLint `@typescript-eslint/no-explicit-any` rule added
- [x] Server `noExplicitAny` violations fixed (0 remaining)
- [x] Client `noExplicitAny` violations fixed (0 from ESLint; tsc clean)
- [x] Server `tsc` clean
- [x] `strictNullChecks` verified clean (both packages pass tsc with `strict: true`)

## Phase 3: Server Tests + MongoDB
- [x] Re-enable DB-dependent tests
- [x] Get MongoDB working (mongodb-memory-server with Jest 29)
- [x] All server unit tests pass (97/97)
- [x] Achieve 100% statement coverage (currently 100%)
- [x] Achieve 100% branch coverage (currently 100%)
- [x] Achieve 100% function coverage (currently 100%)
- [x] Achieve 100% line coverage (currently 100%)

## Phase 4: Frontend Tests + Coverage
- [x] Add initial frontend unit tests
- [x] Increase frontend coverage toward completion (100%)
- [x] Achieve complete coverage on client (statements, branches, functions, lines — no type assertions). Verified from `client/coverage/coverage-final.json`: statements 893/893, branches 414/414, functions 232/232, lines 818/818. 67 suites, 150 tests.

## Notes
- TypeScript is pinned at 6 on client and server (client install is 6.0.3). A TS 7 pin was reverted because the ESLint toolchain could not typecheck it.
- Client `no-explicit-any` is enforced by the `@typescript-eslint` plugin bundled with `eslint-config-react-app`. Listing a second copy in `.eslintrc.js` made ESLint abort before the rule ran. After the dedupe, the rule reports 0 violations.
- Client ESLint is clean: extensionless imports stay allowed (including `.js`), the Login mount-only redirect is an intentional exhaustive-deps exception, and `useSaved` lists `dispatch` and `getSavedRecipes` as effect dependencies.
- Client `package-lock.json` matches `package.json` (`npm ci` works). `caniuse-lite` is 1.0.30001815, so the production build no longer warns that Browserslist data is outdated.
- Jest: server 29 with mongodb-memory-server; client still uses Jest 27 via react-scripts 5.
- React Scripts 5 is unmaintained — consider a Vite migration later.
- tsconfig `"strict": true` is set in both packages.
