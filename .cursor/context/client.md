# Client shell

Vite 8, React 18, React Router 7, Apollo Client 3, TypeScript 6. Config: `client/vite.config.mts`.

`define` sets `__APP_MODE__`. `src/appMode.ts` exports `APP_MODE` without `import.meta`, so Jest and ts-jest can load it.

`graphqlEndpoint` in `src/App.tsx`: production uses `https://ingre-backend.onrender.com/graphql`; anything else uses `http://localhost:3001/graphql`.

`Ingre` wraps `ApolloProvider`, `BrowserRouter`, `AuthProvider`, `StoreProvider`, then `Header` and `Routes`.

Entry: `client/index.html` loads `src/index.tsx`. Build output is `client/build` (`outDir`), not `dist`.

Theme tokens: `src/styles/theme.css`. Layout: `src/styles/layout.css`. Bootstrap CSS is imported from `App.tsx`.
