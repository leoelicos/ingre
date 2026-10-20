/**
 * The build mode ('development' | 'production' | 'test').
 * Vite replaces `__APP_MODE__` at build time via `define`; Jest provides it via `globals`.
 * Kept free of `import.meta` so ts-jest (CommonJS) can compile it.
 */
declare const __APP_MODE__: string

export const APP_MODE: string = __APP_MODE__

/**
 * VITE_GRAPHQL_URL at build/dev-server start, or '' when unset (#175: the e2e
 * suite points the client at its own server). Injected like `__APP_MODE__`.
 */
declare const __GRAPHQL_URL__: string

export const GRAPHQL_URL_OVERRIDE: string = __GRAPHQL_URL__
