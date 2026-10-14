# Conventions

Client and server `tsconfig` use `"strict": true`. The client also sets `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, and `noUnusedParameters`.

Do not silence errors with `as`, `as any`, `as unknown`, or a non-null `!`. Narrow with a guard or change the type.

Client Prettier (`.prettierrc.json`): no semicolons, single quotes, print width 80, no trailing commas, one attribute per line.

Client ESLint extends `eslint-config-react-app` plus Prettier. `@typescript-eslint/no-explicit-any` is an error on `.ts` and `.tsx`. Do not add a second TypeScript-ESLint plugin in `.eslintrc.js`.

Server ESLint is the flat config `server/eslint.config.mjs` (ESLint 9).

No new yarn lockfile. Change a package with npm in that package directory and commit its `package-lock.json`.
