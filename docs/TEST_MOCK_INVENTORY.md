# Test mock inventory

Updated 2026-10-21 (#169). There are no `jest.mock` (or other module mocks) left in client or server tests, and `client/src/__tests__/noModuleMocks.test.ts` fails if one comes back.

What replaced them:

| Was mocked | Now |
| --- | --- |
| `@apollo/client` hooks | `MockedProvider` with typed mocks for the exact documents |
| `AuthContext` | the real `AuthProvider`, with a test JWT in `localStorage` (`logIn` in `client/src/test/providers.tsx`); it reads the token when it mounts |
| `react-router-dom` | `MemoryRouter` with `initialEntries`; `LocationProbe` shows where the app navigated |
| `GlobalState` | the real `StoreProvider` |
| `changeTitle` | the real function; assert `document.title` |
| child components and icons | the real components (Font Awesome loaded with `addFontAwesome`) |
| `@stripe/stripe-js` | the real `loadStripe`, finding a stand-in `window.Stripe`; `useUpgrade` takes the loader as an optional argument |
| `useSearch`'s library search, `Search` loading state | an optional search argument; `SearchView` takes the search state as props |
| server `stripe` | the real stripe-node client pointed at a local HTTP stand-in (`host`/`port`/`protocol`); `StripeApi` takes the client as an optional argument |
| server `signToken` | the real function with a test `JWT_SECRET`; tests verify the token |

`jest.spyOn` on `console` or on a Mongoose model method is still used to observe or force an error path.
