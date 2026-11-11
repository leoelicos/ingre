import type { VoiceEvent, VoiceState } from '../state'
import { initialVoice, isActive, voiceReducer } from '../state'

/* #207: the record button's states, one transition at a time. */

const run = (events: readonly VoiceEvent[], from = initialVoice('onDevice')) =>
  events.reduce<VoiceState>(voiceReducer, from)

describe('voiceReducer', () => {
  it('starts idle with the chosen engine, or none', () => {
    expect(initialVoice('webSpeech')).toEqual({
      phase: 'idle',
      engine: 'webSpeech',
      interim: '',
      level: null,
      download: null,
      error: null
    })
    expect(initialVoice(null).engine).toBeNull()
  })

  it('goes idle → starting → listening → transcribing → idle', () => {
    const starting = run([{ type: 'start', engine: 'onDevice' }])
    expect(starting.phase).toBe('starting')
    expect(isActive(starting)).toBe(true)
    const listening = run([{ type: 'listening' }], starting)
    expect(listening.phase).toBe('listening')
    const transcribing = run(
      [{ type: 'level', value: 0.5 }, { type: 'transcribing' }],
      listening
    )
    expect(transcribing).toMatchObject({ phase: 'transcribing', level: null })
    expect(isActive(transcribing)).toBe(true)
    const ended = run([{ type: 'end' }], transcribing)
    expect(ended).toEqual(initialVoice('onDevice'))
    expect(isActive(ended)).toBe(false)
  })

  it('a new start clears the last error and switches engine', () => {
    const failed = run([
      { type: 'start', engine: 'webSpeech' },
      { type: 'error', error: 'denied' }
    ])
    expect(failed).toMatchObject({
      phase: 'error',
      error: 'denied',
      engine: 'webSpeech'
    })
    expect(isActive(failed)).toBe(false)
    expect(run([{ type: 'start', engine: 'onDevice' }], failed)).toMatchObject({
      phase: 'starting',
      engine: 'onDevice',
      error: null
    })
  })

  it('keeps the error showing when the engine ends afterwards', () => {
    const failed = run([
      { type: 'start', engine: 'webSpeech' },
      { type: 'error', error: 'noSpeech' },
      { type: 'end' }
    ])
    expect(failed.phase).toBe('error')
  })

  it('shows interim words while active and clears them on a final phrase', () => {
    const heard = run([
      { type: 'start', engine: 'webSpeech' },
      { type: 'listening' },
      { type: 'interim', text: 'two carr' }
    ])
    expect(heard.interim).toBe('two carr')
    expect(run([{ type: 'final' }], heard).interim).toBe('')
  })

  it('ignores late interim words, levels and listening when idle', () => {
    const idle = initialVoice('webSpeech')
    expect(run([{ type: 'interim', text: 'late' }], idle)).toBe(idle)
    expect(run([{ type: 'level', value: 1 }], idle)).toBe(idle)
    expect(run([{ type: 'listening' }], idle)).toBe(idle)
    expect(run([{ type: 'transcribing' }], idle)).toBe(idle)
  })

  it('keeps the level between 0 and 1', () => {
    const on = run([{ type: 'start', engine: 'onDevice' }])
    expect(run([{ type: 'level', value: 3 }], on).level).toBe(1)
    expect(run([{ type: 'level', value: -1 }], on).level).toBe(0)
  })

  it('tracks the model download until it is complete', () => {
    const on = run([{ type: 'start', engine: 'onDevice' }])
    const half = run(
      [{ type: 'download', progress: { loaded: 5, total: 10 } }],
      on
    )
    expect(half.download).toEqual({ loaded: 5, total: 10 })
    expect(
      run([{ type: 'download', progress: { loaded: 10, total: 10 } }], half)
        .download
    ).toBeNull()
    expect(
      run([{ type: 'download', progress: { loaded: 0, total: 0 } }], on)
        .download
    ).toEqual({ loaded: 0, total: 0 })
  })
})
