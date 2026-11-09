import type { HeardEvent } from '../speech'
import {
  finalTranscripts,
  interimTranscript,
  recogniserConstructor,
  speechError,
  webSpeechEngine
} from '../speech'
import { listenerMock } from '../../../test/listenerMock'

/* The browser's own speech recognition, used when it is there (#207): no plugin, no network call of ours. */

class Fake {
  static last: Fake | null = null
  lang = ''
  continuous = false
  interimResults = false
  onresult: ((event: HeardEvent) => void) | null = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: { readonly error: string }) => void) | null = null
  start = jest.fn()
  stop = jest.fn()
  abort = jest.fn()
  constructor() {
    Fake.last = this
  }
}

describe('recogniserConstructor', () => {
  it('is the standard one when the browser has it', () => {
    expect(recogniserConstructor({ SpeechRecognition: Fake })).toBe(Fake)
  })

  it('is the prefixed one on Chrome and Safari', () => {
    expect(recogniserConstructor({ webkitSpeechRecognition: Fake })).toBe(Fake)
  })

  it('is null when the browser has neither', () => {
    expect(recogniserConstructor({})).toBeNull()
    expect(recogniserConstructor({ SpeechRecognition: 'no' })).toBeNull()
  })

  it('looks at the window by default, where jsdom has none', () => {
    expect(recogniserConstructor()).toBeNull()
  })
})

describe('transcripts', () => {
  const event: HeardEvent = {
    resultIndex: 1,
    results: [
      { isFinal: true, 0: { transcript: 'old' } },
      { isFinal: false, 0: { transcript: ' still talking' } },
      { isFinal: true, 0: { transcript: 'carrot and onion' } }
    ]
  }

  it('final is only what is new and settled', () => {
    expect(finalTranscripts(event)).toEqual(['carrot and onion'])
  })

  it('interim is what is new and still changing', () => {
    expect(interimTranscript(event)).toBe('still talking')
  })
})

describe('speechError', () => {
  it('puts the browser’s codes in the button’s words', () => {
    expect(speechError('aborted')).toBeNull()
    expect(speechError('not-allowed')).toBe('denied')
    expect(speechError('no-speech')).toBe('noSpeech')
    expect(speechError('network')).toBe('unavailable')
    expect(speechError('service-not-allowed')).toBe('unavailable')
    expect(speechError('language-not-supported')).toBe('unavailable')
    expect(speechError('audio-capture')).toBe('failed')
  })
})

describe('webSpeechEngine', () => {
  it('listens continuously with interim words in the given language', () => {
    const listener = listenerMock()
    const session = webSpeechEngine(Fake)('ja-JP', listener)
    const recogniser = Fake.last
    expect(recogniser).toMatchObject({
      lang: 'ja-JP',
      continuous: true,
      interimResults: true
    })
    expect(recogniser?.start).toHaveBeenCalled()
    recogniser?.onstart?.()
    expect(listener.listening).toHaveBeenCalled()
    recogniser?.onresult?.({
      resultIndex: 0,
      results: [
        { isFinal: true, 0: { transcript: 'carrot' } },
        { isFinal: false, 0: { transcript: 'oni' } }
      ]
    })
    expect(listener.final).toHaveBeenCalledWith('carrot')
    expect(listener.interim).toHaveBeenLastCalledWith('oni')
    session.stop()
    expect(recogniser?.stop).toHaveBeenCalled()
    recogniser?.onend?.()
    expect(listener.end).toHaveBeenCalled()
    session.cancel()
    expect(recogniser?.abort).toHaveBeenCalled()
  })

  it('reports an error once, without a second "end"', () => {
    const listener = listenerMock()
    webSpeechEngine(Fake)('en-AU', listener)
    Fake.last?.onerror?.({ error: 'network' })
    Fake.last?.onend?.()
    expect(listener.error).toHaveBeenCalledWith('unavailable')
    expect(listener.end).not.toHaveBeenCalled()
  })

  it('treats its own abort as an ordinary end', () => {
    const listener = listenerMock()
    webSpeechEngine(Fake)('en-AU', listener)
    Fake.last?.onerror?.({ error: 'aborted' })
    Fake.last?.onend?.()
    expect(listener.error).not.toHaveBeenCalled()
    expect(listener.end).toHaveBeenCalled()
  })
})
