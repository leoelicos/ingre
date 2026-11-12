/*
 * Firebase Auth: firebase-admin loads ESM-only modules (jose) that Jest's CommonJS
 * runtime can't require, so tests get these stand-ins (jest.config.js moduleNameMapper).
 * Tests inject their own token checker (firebaseVerifier's seam); nothing talks to Google.
 */
export const cert = (account: object) => ({ account })
export const getApps = (): object[] => []
export const initializeApp = (options: object) => ({ options })
