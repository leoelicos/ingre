import type { Listener } from '../utils/voice/types'

/** A voice engine listener whose every callback is a jest mock (#207). */
export const listenerMock = (): jest.Mocked<Listener> => ({
  interim: jest.fn(),
  final: jest.fn(),
  level: jest.fn(),
  download: jest.fn(),
  listening: jest.fn(),
  transcribing: jest.fn(),
  end: jest.fn(),
  error: jest.fn()
})
