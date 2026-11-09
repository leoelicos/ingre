/*
 * Which recogniser to use (#207): the apps use the phone's own (Android SpeechRecognizer,
 * iOS SFSpeechRecognizer); browsers use their built-in Web Speech when they have it; anything
 * else (Firefox) records and transcribes on the device with a free model.
 */
import type { EngineKind, VoiceError } from './types'

/** What this device can do, gathered once. */
export interface Abilities {
  /** running inside the Capacitor Android or iOS app */
  readonly native: boolean
  /** the browser has SpeechRecognition (standard or webkit) */
  readonly webSpeech: boolean
  /** microphone recording plus WebAssembly, enough for the on-device model */
  readonly record: boolean
}

/** The best recogniser for this device, or null when it cannot listen at all. */
export const chooseEngine = (can: Abilities): EngineKind | null => {
  if (can.native) return 'native'
  if (can.webSpeech) return 'webSpeech'
  return can.record ? 'onDevice' : null
}

/**
 * What to try after `kind` failed with `error`: only "this recogniser cannot work here"
 * (Brave and other browsers without Google's speech service, phones without a recognition
 * service) moves on to the on-device model. A blocked microphone or silence does not.
 */
export const fallbackFor = (
  kind: EngineKind,
  error: VoiceError,
  can: Abilities
): EngineKind | null =>
  kind !== 'onDevice' && error === 'unavailable' && can.record
    ? 'onDevice'
    : null

/** The recogniser's language for an app locale: Japanese, or Australian English. */
export const speechLang = (locale: string): string =>
  locale.toLowerCase().startsWith('ja') ? 'ja-JP' : 'en-AU'
