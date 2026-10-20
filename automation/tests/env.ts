/** Ports for one e2e run; override with E2E_*_PORT when the defaults are busy. */
const port = (name: string, fallback: number): number =>
  Number(process.env[name] ?? fallback)

export const ports = {
  client: port('E2E_CLIENT_PORT', 4310),
  server: port('E2E_SERVER_PORT', 4311),
  wiremock: port('E2E_WIREMOCK_PORT', 4312)
}

export const urls = {
  client: `http://localhost:${ports.client}`,
  graphql: `http://localhost:${ports.server}/graphql`,
  wiremock: `http://localhost:${ports.wiremock}`
}
