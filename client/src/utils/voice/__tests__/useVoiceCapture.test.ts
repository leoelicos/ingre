import { listenerMock } from '../../../test/listenerMock'
import { act, renderHook } from '@testing-library/react'
import {
  browserSetup,
  detectAbilities,
  useVoiceCapture
} from '../useVoiceCapture'

/* #207: what this browser can do, and the real recognisers behind the button. */

afterEach(() => {
  Reflect.deleteProperty(window, 'MediaRecorder')
  Reflect.deleteProperty(window, 'webkitSpeechRecognition')
  Reflect.deleteProperty(navigator, 'mediaDevices')
})

describe('detectAbilities', () => {
  it('in jsdom: not an app, no recogniser, no recording', () => {
    expect(detectAbilities()).toEqual({
      native: false,
      webSpeech: false,
      record: false
    })
  })

  it('records where there is a microphone, MediaRecorder, workers and WebAssembly', () => {
    Reflect.set(navigator, 'mediaDevices', { getUserMedia: jest.fn() })
    Reflect.set(window, 'MediaRecorder', jest.fn())
    Reflect.set(window, 'Worker', jest.fn())
    Reflect.set(window, 'WebAssembly', {})
    expect(detectAbilities().record).toBe(true)
    Reflect.deleteProperty(window, 'Worker')
    expect(detectAbilities().record).toBe(false)
  })
})

describe('browserSetup', () => {
  it('listens in the app’s language, Australian English by default', () => {
    expect(browserSetup().lang()).toBe('en-AU')
  })

  it('has no Web Speech engine where the browser has none', () => {
    const listener = listenerMock()
    const session = browserSetup().engines.webSpeech('en-AU', listener)
    expect(listener.error).toHaveBeenCalledWith('unavailable')
    session.stop()
    session.cancel()
  })

  it('starts the model’s worker only when the on-device engine runs', async () => {
    Reflect.set(navigator, 'mediaDevices', {
      getUserMedia: jest.fn(() => Promise.reject({ name: 'NotAllowedError' }))
    })
    const listener = listenerMock()
    browserSetup().engines.onDevice('en-AU', listener)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(listener.error).toHaveBeenCalledWith('denied')
  })

  it('uses the browser’s recogniser where there is one', () => {
    const start = jest.fn()
    Reflect.set(
      window,
      'webkitSpeechRecognition',
      jest.fn(() => ({ start }))
    )
    browserSetup().engines.webSpeech('en-AU', listenerMock())
    expect(start).toHaveBeenCalled()
  })
})

describe('useVoiceCapture', () => {
  it('does nothing when pressed on a device that cannot listen', () => {
    const engine = jest.fn()
    const { result } = renderHook(() =>
      useVoiceCapture(jest.fn(), () => ({
        abilities: { native: false, webSpeech: false, record: false },
        engines: { native: engine, webSpeech: engine, onDevice: engine },
        lang: () => 'en-AU'
      }))
    )
    act(() => result.current.toggle())
    expect(engine).not.toHaveBeenCalled()
    expect(result.current.state.phase).toBe('idle')
    expect(result.current.firstUseMegabytes).toBe(0)
  })
})
