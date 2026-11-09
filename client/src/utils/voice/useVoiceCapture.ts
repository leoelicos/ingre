/*
 * The War room's record button (#207): picks the best recogniser for this device, runs it,
 * and hands every settled phrase to `onHeard`. When a recogniser turns out not to work here
 * (Brave, a phone without a speech service) it moves to the on-device model by itself.
 */
import { Capacitor } from '@capacitor/core'
import { useEffect, useReducer, useRef, useState } from 'react'
import { locale } from '../../i18n'
import type { Abilities } from './engine'
import { chooseEngine, fallbackFor, speechLang } from './engine'
import { nativeEngine } from './native'
import {
  decodeTo16k,
  firstUseMegabytes,
  meterWith,
  onDeviceEngine,
  openMicrophone,
  recordWith,
  workerTranscriber
} from './onDevice'
import { recogniserConstructor, webSpeechEngine } from './speech'
import { initialVoice, isActive, voiceReducer } from './state'
import TranscribeWorker from './transcribe.worker?worker'
import type { Engine, EngineKind, Listener, Session } from './types'

export interface VoiceSetup {
  readonly abilities: Abilities
  readonly engines: Readonly<Record<EngineKind, Engine>>
  /** the recogniser language for the app's current locale */
  readonly lang: () => string
}

/** What this browser or app can do. */
export const detectAbilities = (host: Window = window): Abilities => ({
  native: Capacitor.isNativePlatform(),
  webSpeech: recogniserConstructor(host) !== null,
  record:
    typeof host.navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof Reflect.get(host, 'MediaRecorder') === 'function' &&
    typeof Reflect.get(host, 'Worker') === 'function' &&
    typeof Reflect.get(host, 'WebAssembly') === 'object'
})

const unavailable: Engine = (_lang, listener) => {
  listener.error('unavailable')
  return { stop: () => undefined, cancel: () => undefined }
}

/** The real recognisers for this browser or app. */
export const browserSetup = (): VoiceSetup => {
  const Recogniser = recogniserConstructor()
  return {
    abilities: detectAbilities(),
    engines: {
      native: nativeEngine(),
      webSpeech:
        Recogniser === null ? unavailable : webSpeechEngine(Recogniser),
      onDevice: onDeviceEngine({
        microphone: openMicrophone,
        record: recordWith,
        meter: meterWith,
        decode: decodeTo16k,
        transcriber: workerTranscriber(() => new TranscribeWorker())
      })
    },
    lang: () => speechLang(locale())
  }
}

export const useVoiceCapture = (
  onHeard: (text: string) => void,
  setup: () => VoiceSetup
) => {
  const [voice] = useState(setup)
  const [state, dispatch] = useReducer(
    voiceReducer,
    voice.abilities,
    (abilities) => initialVoice(chooseEngine(abilities))
  )
  const session = useRef<Session | null>(null)
  const latest = useRef(onHeard)
  useEffect(() => {
    latest.current = onHeard
  })
  useEffect(() => () => session.current?.cancel(), [])

  const run = (kind: EngineKind): void => {
    let done = false
    const over = (): void => {
      done = true
      session.current = null
    }
    const listener: Listener = {
      interim: (text) => dispatch({ type: 'interim', text }),
      final: (text) => {
        dispatch({ type: 'final' })
        latest.current(text)
      },
      level: (value) => dispatch({ type: 'level', value }),
      download: (progress) => dispatch({ type: 'download', progress }),
      listening: () => dispatch({ type: 'listening' }),
      transcribing: () => dispatch({ type: 'transcribing' }),
      end: () => {
        over()
        dispatch({ type: 'end' })
      },
      error: (error) => {
        over()
        const next = fallbackFor(kind, error, voice.abilities)
        if (next === null) dispatch({ type: 'error', error })
        else run(next)
      }
    }
    dispatch({ type: 'start', engine: kind })
    const started = voice.engines[kind](voice.lang(), listener)
    if (!done) session.current = started
  }

  const engine = state.engine
  const start = (): void => {
    if (engine !== null && session.current === null) run(engine)
  }
  const stop = (): void => session.current?.stop()
  return {
    state,
    active: isActive(state),
    /** megabytes the first press will download (on-device model only) */
    firstUseMegabytes:
      engine === 'onDevice' ? firstUseMegabytes(voice.lang()) : 0,
    start,
    stop,
    toggle: (): void => (session.current === null ? start() : stop())
  }
}
