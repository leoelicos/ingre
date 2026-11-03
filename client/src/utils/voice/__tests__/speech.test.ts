import {
  finalTranscripts,
  recogniserConstructor,
  type HeardEvent
} from '../speech'

/* The browser's own speech recognition, used when it is there (#207): no plugin, no network call of ours. */

class Fake {
  lang = ''
  continuous = false
  interimResults = false
  onresult: ((event: HeardEvent) => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  start = jest.fn()
  stop = jest.fn()
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

describe('finalTranscripts', () => {
  const event: HeardEvent = {
    resultIndex: 1,
    results: [
      { isFinal: true, 0: { transcript: 'old' } },
      { isFinal: false, 0: { transcript: 'still talking' } },
      { isFinal: true, 0: { transcript: 'carrot and onion' } }
    ]
  }

  it('is only what is new and final', () => {
    expect(finalTranscripts(event)).toEqual(['carrot and onion'])
  })
})
