# Ingre Modernization Checklist

## Phase 1: Package Updates (Foundation)
- [x] Update server packages to latest compatible versions (TypeScript 7.0.2)
- [x] Update client packages to latest compatible versions (TypeScript 7.0.2)
- [x] Resolve TypeScript version conflicts with @types/node
- [x] Convert server path aliases to relative imports
- [x] Convert client path aliases to relative imports
- [ ] Ensure project builds and starts after updates

## Phase 2: TypeScript Strictness
- [x] Server `tsc --noEmit` is clean
- [x] Client `tsc --noEmit` is clean (noImplicitAny satisfied)
- [x] ESLint `@typescript-eslint/no-explicit-any` rule added
- [x] Server `noExplicitAny` violations fixed (0 remaining)
- [x] Client `noExplicitAny` violations fixed (tsc clean)
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
- [ ] Increase frontend coverage toward completion (~60%)
- [ ] Achieve high/complete coverage on client

## Notes
- Current TypeScript: ~4.9 (server), ~4.7 (client) — needs upgrade
- Jest: 26 (server), 27 (client) — needs upgrade
- React Scripts 5 is unmaintained — consider migration path
- tsconfig already has `"strict": true` in both packages
