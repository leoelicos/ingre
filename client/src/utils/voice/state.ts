/*
 * The record button's states (#207), as a pure reducer so every transition is tested:
 * idle → starting → listening → (transcribing) → idle, with error and blocked-microphone
 * stops along the way.
 */
import type { Download, EngineKind, VoiceError } from './types'

export type Phase = 'idle' | 'starting' | 'listening' | 'transcribing' | 'error'

export interface VoiceState {
  readonly phase: Phase
  readonly engine: EngineKind | null
  /** words heard so far that may still change */
  readonly interim: string
  /** microphone loudness 0..1; null when the engine cannot measure it */
  readonly level: number | null
  /** the on-device model download, while it runs */
  readonly download: Download | null
  readonly error: VoiceError | null
}

export type VoiceEvent =
  | { readonly type: 'start'; readonly engine: EngineKind }
  | { readonly type: 'listening' }
  | { readonly type: 'interim'; readonly text: string }
  | { readonly type: 'final' }
  | { readonly type: 'level'; readonly value: number }
  | { readonly type: 'download'; readonly progress: Download }
  | { readonly type: 'transcribing' }
  | { readonly type: 'end' }
  | { readonly type: 'error'; readonly error: VoiceError }

export const initialVoice = (engine: EngineKind | null): VoiceState => ({
  phase: 'idle',
  engine,
  interim: '',
  level: null,
  download: null,
  error: null
})

/** Whether the microphone is (about to be) on, so a press means stop. */
export const isActive = ({ phase }: VoiceState): boolean =>
  phase === 'starting' || phase === 'listening' || phase === 'transcribing'

const clamp = (value: number): number => Math.min(1, Math.max(0, value))

export const voiceReducer = (
  state: VoiceState,
  event: VoiceEvent
): VoiceState => {
  switch (event.type) {
    case 'start':
      return { ...initialVoice(event.engine), phase: 'starting' }
    case 'listening':
      return state.phase === 'starting'
        ? { ...state, phase: 'listening' }
        : state
    case 'interim':
      return isActive(state) ? { ...state, interim: event.text } : state
    case 'final':
      return { ...state, interim: '' }
    case 'level':
      return isActive(state) ? { ...state, level: clamp(event.value) } : state
    case 'download': {
      const { loaded, total } = event.progress
      const done = total > 0 && loaded >= total
      return { ...state, download: done ? null : event.progress }
    }
    case 'transcribing':
      return isActive(state)
        ? { ...state, phase: 'transcribing', level: null }
        : state
    case 'end':
      return state.phase === 'error' ? state : { ...initialVoice(state.engine) }
    case 'error':
      return {
        ...initialVoice(state.engine),
        phase: 'error',
        error: event.error
      }
  }
}
