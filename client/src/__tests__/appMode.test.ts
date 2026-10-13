import { APP_MODE } from '../appMode'

it('reads the mode injected by the bundler/test runner', () => {
  expect(APP_MODE).toBe('test')
})
