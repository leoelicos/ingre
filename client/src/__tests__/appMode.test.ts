import { APP_MODE, GRAPHQL_URL_OVERRIDE } from '../appMode'

it('reads the mode injected by the bundler/test runner', () => {
  expect(APP_MODE).toBe('test')
})

it('has no API URL override unless VITE_GRAPHQL_URL is set', () => {
  expect(GRAPHQL_URL_OVERRIDE).toBe('')
})
