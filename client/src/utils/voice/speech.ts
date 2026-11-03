/*
 * The browser's own speech recognition (#207: "free open-source plugin or native"): nothing to
 * install and no service of ours. Chrome and Safari have it under a prefix; Firefox has none,
 * and then the War room simply has no microphone button.
 */
import { useEffect, useRef, useState } from 'react'

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
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
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

/** Listen while on; every settled phrase goes to `onHeard`. `toggle` is null without a recogniser. */
export const useVoice = (onHeard: (text: string) => void) => {
  const [Recogniser] = useState(() => recogniserConstructor())
  const [listening, setListening] = useState(false)
  const active = useRef<Recogniser | null>(null)
  const latest = useRef(onHeard)
  useEffect(() => {
    latest.current = onHeard
  })
  useEffect(() => () => active.current?.stop(), [])
  const start = (Class: RecogniserConstructor): void => {
    const next = new Class()
    next.lang = 'en-AU'
    next.continuous = true
    next.interimResults = false
    next.onresult = (event) =>
      finalTranscripts(event).forEach((text) => latest.current(text))
    next.onend = () => {
      active.current = null
      setListening(false)
    }
    next.onerror = next.onend
    active.current = next
    next.start()
    setListening(true)
  }
  return {
    listening,
    toggle:
      Recogniser === null
        ? null
        : (): void =>
            active.current === null ? start(Recogniser) : active.current.stop()
  }
}
