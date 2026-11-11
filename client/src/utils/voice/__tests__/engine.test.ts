import type { Abilities } from '../engine'
import { chooseEngine, fallbackFor, speechLang } from '../engine'

/* #207: one record button, the best recogniser per device. */

const can = (overrides: Partial<Abilities> = {}): Abilities => ({
  webSpeech: false,
  record: false,
  ...overrides
})

describe('chooseEngine', () => {
  it('uses the browser’s Web Speech where it has it (Chrome, Edge, Safari)', () => {
    expect(chooseEngine(can({ webSpeech: true, record: true }))).toBe(
      'webSpeech'
    )
  })

  it('uses the on-device model where there is no recogniser (Firefox)', () => {
    expect(chooseEngine(can({ record: true }))).toBe('onDevice')
  })

  it('has nothing when the device cannot record either', () => {
    expect(chooseEngine(can())).toBeNull()
  })
})

describe('fallbackFor', () => {
  it('moves to the on-device model when a recogniser cannot work here', () => {
    expect(fallbackFor('webSpeech', 'unavailable', can({ record: true }))).toBe(
      'onDevice'
    )
  })

  it('does not move for a blocked microphone, silence or other failures', () => {
    expect(fallbackFor('webSpeech', 'denied', can({ record: true }))).toBeNull()
    expect(
      fallbackFor('webSpeech', 'noSpeech', can({ record: true }))
    ).toBeNull()
    expect(fallbackFor('webSpeech', 'failed', can({ record: true }))).toBeNull()
  })

  it('has nowhere to go from the model itself, or without recording', () => {
    expect(
      fallbackFor('onDevice', 'unavailable', can({ record: true }))
    ).toBeNull()
    expect(fallbackFor('webSpeech', 'unavailable', can())).toBeNull()
  })
})

describe('speechLang', () => {
  it('follows the app’s locale: Japanese, otherwise Australian English', () => {
    expect(speechLang('ja')).toBe('ja-JP')
    expect(speechLang('ja-JP')).toBe('ja-JP')
    expect(speechLang('en')).toBe('en-AU')
    expect(speechLang('fr')).toBe('en-AU')
  })
})
