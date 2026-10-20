# Testing

Jest 30 and ts-jest in both packages. TypeScript 6.

Client: `npm test` in `client/`. Config `client/jest.config.js`. Environment jsdom. CSS maps to `src/test/styleMock.js`. Fetch polyfill: `src/test/fetchPolyfill.js`. `__APP_MODE__` is a Jest global. Setup: `src/setupTests.ts`.

Server: `npm test` in `server/`. Config `server/jest.config.js`. Mongo is `mongodb-memory-server`, started from the Jest setup.

No `jest.mock` anywhere (#169; `noModuleMocks.test.ts` enforces it). Use real providers: `renderWithProviders`, `logIn` and `LocationProbe` in `client/src/test/providers.tsx`, `MockedProvider` for GraphQL, optional-argument seams for Stripe.js and search. See `docs/TEST_MOCK_INVENTORY.md`.

Colocate tests in `__tests__/` or `*.test.ts` next to the code. Shopping and library tests are the model: call the function, do not mount the page unless the behaviour is rendered.

Do not assert with removed matchers such as `toThrowError`. Use `toThrow`.
