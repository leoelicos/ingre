import { listenerMock } from '../../../test/listenerMock'
import type { NativeSpeech } from '../native'
import {
  loadNativeSpeech,
  nativeEngine,
  nativeError,
  POLL_MS,
  SETTLE_MS
} from '../native'

/* #207: the phone's own recogniser in the Capacitor apps, through the community plugin. */

type Handler = (
  data: { matches: string[] } & { status: 'started' | 'stopped' }
) => void

const fakePlugin = (
  overrides: Partial<Record<keyof NativeSpeech, jest.Mock>> = {}
) => {
  const handlers: Record<string, Handler> = {}
  const remove = jest.fn(() => Promise.resolve())
  const plugin = {
    available: jest.fn(() => Promise.resolve({ available: true })),
    checkPermissions: jest.fn(() =>
      Promise.resolve({ speechRecognition: 'granted' })
    ),
    requestPermissions: jest.fn(() =>
      Promise.resolve({ speechRecognition: 'granted' })
    ),
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    isListening: jest.fn(() => Promise.resolve({ listening: true })),
    addListener: jest.fn((event: string, handler: Handler) => {
      handlers[event] = handler
      return Promise.resolve({ remove })
    }),
    ...overrides
  }
  const partial = (text: string) =>
    handlers['partialResults']?.({ matches: [text], status: 'started' })
  const state = (status: 'started' | 'stopped') =>
    handlers['listeningState']?.({ matches: [], status })
  return { plugin, partial, state, remove }
}

const flush = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve()
}

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('nativeEngine', () => {
  it('listens with live words in the app’s language and hands on each phrase', async () => {
    const { plugin, partial, state, remove } = fakePlugin()
    const listener = listenerMock()
    const session = nativeEngine(() => Promise.resolve({ speech: plugin }))(
      'ja-JP',
      listener
    )
    await flush()
    expect(plugin.start).toHaveBeenCalledWith({
      language: 'ja-JP',
      partialResults: true,
      popup: false,
      maxResults: 1
    })
    expect(listener.listening).toHaveBeenCalled()
    partial('2 carrots')
    expect(listener.interim).toHaveBeenCalledWith('2 carrots')
    /* Android: the utterance ends by itself, then listening starts again */
    state('stopped')
    partial('2 carrots and onion')
    jest.advanceTimersByTime(SETTLE_MS)
    await flush()
    expect(listener.final).toHaveBeenCalledWith('2 carrots and onion')
    expect(plugin.start).toHaveBeenCalledTimes(2)
    /* the button: what is still being said is kept */
    partial('garlic')
    session.stop()
    expect(plugin.stop).toHaveBeenCalled()
    expect(listener.transcribing).toHaveBeenCalled()
    jest.advanceTimersByTime(SETTLE_MS)
    expect(listener.final).toHaveBeenLastCalledWith('garlic')
    expect(listener.end).toHaveBeenCalled()
    expect(remove).toHaveBeenCalledTimes(2)
    /* nothing after the end */
    partial('late')
    state('stopped')
    session.stop()
    session.cancel()
    expect(listener.interim).not.toHaveBeenCalledWith('late')
  })

  it('ignores empty partial results and a "started" state', async () => {
    const { plugin, partial, state } = fakePlugin()
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    partial('  ')
    state('started')
    expect(listener.interim).not.toHaveBeenCalled()
    expect(listener.transcribing).not.toHaveBeenCalled()
  })

  it('says nothing was heard when an utterance ends silent', async () => {
    const { plugin, state } = fakePlugin()
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    state('stopped')
    jest.advanceTimersByTime(SETTLE_MS)
    expect(listener.error).toHaveBeenCalledWith('noSpeech')
  })

  it('ends quietly when the recogniser stops after a phrase, found by polling', async () => {
    let listening = true
    const { plugin, partial } = fakePlugin({
      isListening: jest.fn(() => Promise.resolve({ listening }))
    })
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    jest.advanceTimersByTime(POLL_MS)
    await flush()
    expect(listener.end).not.toHaveBeenCalled()
    partial('carrot')
    listening = false
    plugin.start.mockImplementationOnce(() => new Promise(() => undefined))
    jest.advanceTimersByTime(POLL_MS)
    await flush()
    jest.advanceTimersByTime(SETTLE_MS)
    await flush()
    expect(listener.final).toHaveBeenCalledWith('carrot')
    /* while it starts again, a "not listening" poll is not the end */
    jest.advanceTimersByTime(POLL_MS)
    await flush()
    jest.advanceTimersByTime(SETTLE_MS)
    expect(listener.end).not.toHaveBeenCalled()
  })

  it('waits for late words before settling', async () => {
    const { plugin, partial, state } = fakePlugin()
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    state('stopped')
    jest.advanceTimersByTime(SETTLE_MS - 1)
    partial('onion')
    jest.advanceTimersByTime(SETTLE_MS - 1)
    expect(listener.final).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1)
    expect(listener.final).toHaveBeenCalledWith('onion')
  })

  it('is unavailable without a recognition service', async () => {
    const { plugin } = fakePlugin({
      available: jest.fn(() => Promise.resolve({ available: false }))
    })
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    expect(listener.error).toHaveBeenCalledWith('unavailable')
    expect(plugin.start).not.toHaveBeenCalled()
  })

  it('asks for the microphone, and says when it is refused', async () => {
    const { plugin } = fakePlugin({
      checkPermissions: jest.fn(() =>
        Promise.resolve({ speechRecognition: 'prompt' })
      ),
      requestPermissions: jest.fn(() =>
        Promise.resolve({ speechRecognition: 'denied' })
      )
    })
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    expect(plugin.requestPermissions).toHaveBeenCalled()
    expect(listener.error).toHaveBeenCalledWith('denied')
  })

  it('listens once the microphone is allowed', async () => {
    const { plugin } = fakePlugin({
      checkPermissions: jest.fn(() =>
        Promise.resolve({ speechRecognition: 'prompt' })
      )
    })
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    expect(listener.listening).toHaveBeenCalled()
  })

  it('reports a refused start', async () => {
    const { plugin } = fakePlugin({
      start: jest.fn(() => Promise.reject(new Error('Missing permission')))
    })
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    expect(listener.error).toHaveBeenCalledWith('denied')
  })

  it('is unavailable when the plugin cannot load', async () => {
    const listener = listenerMock()
    nativeEngine(() => Promise.reject(new Error('not implemented')))(
      'en-AU',
      listener
    )
    await flush()
    expect(listener.error).toHaveBeenCalledWith('unavailable')
  })

  it('stopping before the plugin has loaded just ends', async () => {
    const { plugin } = fakePlugin()
    const listener = listenerMock()
    const session = nativeEngine(() => Promise.resolve({ speech: plugin }))(
      'en-AU',
      listener
    )
    session.stop()
    expect(listener.end).toHaveBeenCalled()
    await flush()
    expect(plugin.available).not.toHaveBeenCalled()
  })

  it('cancelling while permission is asked never starts', async () => {
    const { plugin } = fakePlugin()
    const listener = listenerMock()
    const session = nativeEngine(() => Promise.resolve({ speech: plugin }))(
      'en-AU',
      listener
    )
    await Promise.resolve()
    await Promise.resolve()
    session.cancel()
    await flush()
    expect(plugin.start).not.toHaveBeenCalled()
    expect(plugin.stop).toHaveBeenCalled()
  })

  it('cancelling throws away what was being said', async () => {
    const { plugin, partial } = fakePlugin()
    const listener = listenerMock()
    const session = nativeEngine(() => Promise.resolve({ speech: plugin }))(
      'en-AU',
      listener
    )
    await flush()
    partial('carrot')
    session.cancel()
    jest.advanceTimersByTime(SETTLE_MS)
    expect(listener.final).not.toHaveBeenCalled()
    expect(plugin.stop).toHaveBeenCalled()
  })
})

describe('nativeEngine, late news', () => {
  it('ignores a partial result with no words', async () => {
    const { plugin } = fakePlugin()
    const listener = listenerMock()
    nativeEngine(() => Promise.resolve({ speech: plugin }))('en-AU', listener)
    await flush()
    const handler = plugin.addListener.mock.calls[0]?.[1]
    handler?.({ matches: [] })
    expect(listener.interim).not.toHaveBeenCalled()
  })

  it('cancelling while settling drops the wait', async () => {
    const { plugin, partial } = fakePlugin()
    const listener = listenerMock()
    const session = nativeEngine(() => Promise.resolve({ speech: plugin }))(
      'en-AU',
      listener
    )
    await flush()
    partial('carrot')
    session.stop()
    session.cancel()
    jest.advanceTimersByTime(SETTLE_MS)
    expect(listener.final).not.toHaveBeenCalled()
  })

  it('a start refused after cancelling says nothing', async () => {
    let refuse: (reason: Error) => void = () => undefined
    const { plugin } = fakePlugin({
      start: jest.fn(
        () =>
          new Promise((_resolve, reject) => {
            refuse = reject
          })
      )
    })
    const listener = listenerMock()
    const session = nativeEngine(() => Promise.resolve({ speech: plugin }))(
      'en-AU',
      listener
    )
    await flush()
    session.cancel()
    refuse(new Error('Missing permission'))
    await flush()
    expect(listener.error).not.toHaveBeenCalled()
  })
})

describe('nativeError', () => {
  it('reads a permission problem as denied, anything else as failed', () => {
    expect(nativeError(new Error('Missing permission'))).toBe('denied')
    expect(nativeError('User denied access to microphone')).toBe('denied')
    expect(nativeError('Speech recognition not authorized')).toBe('denied')
    expect(nativeError(new Error('Unknown error occured'))).toBe('failed')
  })
})

describe('loadNativeSpeech', () => {
  it('loads the real plugin only when asked', async () => {
    const { speech } = await loadNativeSpeech()
    expect(typeof speech.start).toBe('function')
  })
})
