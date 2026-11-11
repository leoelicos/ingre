/*
 * The browser's own speech recognition (#207: "free open-source plugin or native"): nothing to
 * install and no service of ours. Chrome, Edge and Safari have it (Chrome sends the audio to
 * Google, Safari to Apple); Firefox has none, so the War room uses the on-device model there.
 */
import type { Engine, VoiceError } from './types'

interface HeardResult {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}

export interface HeardEvent {
  readonly resultIndex: number
  readonly results: ArrayLike<HeardResult>
}

export interface Recogniser {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: HeardEvent) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { readonly error: string }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

export type RecogniserConstructor = new () => Recogniser

const isConstructor = (value: unknown): value is RecogniserConstructor =>
  typeof value === 'function'

/** The browser's recogniser class, standard or prefixed; null when it has none. */
export const recogniserConstructor = (
  host: object = window
): RecogniserConstructor | null =>
  [
    Reflect.get(host, 'SpeechRecognition'),
    Reflect.get(host, 'webkitSpeechRecognition')
  ].find(isConstructor) ?? null

/** What was said since the last event and is settled, one string per phrase. */
export const finalTranscripts = (event: HeardEvent): string[] =>
  Array.from(event.results)
    .slice(event.resultIndex)
    .filter((result) => result.isFinal)
    .map((result) => result[0].transcript)

/** What is still being said: the unsettled results, joined. */
export const interimTranscript = (event: HeardEvent): string =>
  Array.from(event.results)
    .slice(event.resultIndex)
    .filter((result) => !result.isFinal)
    .map((result) => result[0].transcript)
    .join('')
    .trim()

/**
 * The browser's error codes in the button's words. "This browser cannot do it"
 * (network, service-not-allowed, language-not-supported) is `unavailable`, which
 * hands over to the on-device model; `aborted` is our own cancel, so null.
 */
export const speechError = (code: string): VoiceError | null => {
  switch (code) {
    case 'aborted':
      return null
    case 'not-allowed':
      return 'denied'
    case 'no-speech':
      return 'noSpeech'
    case 'network':
    case 'service-not-allowed':
    case 'language-not-supported':
      return 'unavailable'
    default:
      return 'failed'
  }
}

/** Web Speech as an engine: continuous, with interim words; ends when stopped. */
export const webSpeechEngine =
  (Class: RecogniserConstructor): Engine =>
  (lang, listener) => {
    const recogniser = new Class()
    let failed = false
    recogniser.lang = lang
    recogniser.continuous = true
    recogniser.interimResults = true
    recogniser.onstart = () => listener.listening()
    recogniser.onresult = (event) => {
      finalTranscripts(event).forEach((text) => listener.final(text))
      listener.interim(interimTranscript(event))
    }
    recogniser.onerror = ({ error }) => {
      const kind = speechError(error)
      if (kind === null) return
      failed = true
      listener.error(kind)
    }
    recogniser.onend = () => {
      if (!failed) listener.end()
    }
    recogniser.start()
    return { stop: () => recogniser.stop(), cancel: () => recogniser.abort() }
  }
