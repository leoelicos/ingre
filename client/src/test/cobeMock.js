// Jest mock for the cobe globe library (ESM-only package).
// Tests never need a real WebGL globe.
module.exports = function createGlobe() {
  return { destroy() {} }
}
