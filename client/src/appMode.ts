/**
 * The build mode ('development' | 'production' | 'test').
 * Vite replaces `__APP_MODE__` at build time via `define`; Jest provides it via `globals`.
 * Kept free of `import.meta` so ts-jest (CommonJS) can compile it.
 */
declare const __APP_MODE__: string

export const APP_MODE: string = __APP_MODE__
