// jsdom does not provide fetch; CRA's react-app-polyfill/jsdom used to supply it.
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = () =>
    Promise.reject(new Error('fetch is not available in tests'))
}
