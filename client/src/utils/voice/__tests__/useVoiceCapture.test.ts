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

describe('useVoiceCapture, the engine’s reports', () => {
  const setupWith = (
    webSpeech: import('../types').Engine,
    onDevice: import('../types').Engine
  ) => ({
    abilities: { native: false, webSpeech: true, record: true },
    engines: { native: webSpeech, webSpeech, onDevice },
    lang: () => 'en-AU'
  })

  it('shows the level, and moves to the on-device model when the recogniser is not there', () => {
    const listeners: import('../types').Listener[] = []
    const session = { stop: jest.fn(), cancel: jest.fn() }
    const webSpeech = jest.fn((_lang, listener) => {
      listeners.push(listener)
      return session
    })
    const onDevice = jest.fn((_lang, listener) => {
      listeners.push(listener)
      return session
    })
    const { result } = renderHook(() =>
      useVoiceCapture(jest.fn(), () => setupWith(webSpeech, onDevice))
    )
    act(() => result.current.toggle())
    act(() => listeners[0]?.level(0.5))
    expect(result.current.state).toMatchObject({ level: 0.5 })
    act(() => listeners[0]?.error('unavailable'))
    expect(onDevice).toHaveBeenCalled()
    expect(result.current.state.engine).toBe('onDevice')
  })

  it('an engine that ends at once leaves nothing running', () => {
    const engine = jest.fn((_lang, listener: import('../types').Listener) => {
      listener.end()
      return { stop: jest.fn(), cancel: jest.fn() }
    })
    const { result } = renderHook(() =>
      useVoiceCapture(jest.fn(), () => setupWith(engine, engine))
    )
    act(() => result.current.toggle())
    act(() => result.current.toggle())
    expect(engine).toHaveBeenCalledTimes(2)
    expect(result.current.active).toBe(false)
  })
})
