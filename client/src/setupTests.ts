import { TextDecoder, TextEncoder } from 'util'

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder
}
/* jsdom has no CSS namespace; React Aria's Modal reads CSS.supports when it opens (#192) */
if (typeof globalThis.CSS === 'undefined') {
  const css: Pick<typeof CSS, 'supports' | 'escape'> = {
    supports: () => false,
    escape: (value: string) => value
  }
  Object.defineProperty(globalThis, 'CSS', { value: css })
}
