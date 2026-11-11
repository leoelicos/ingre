/*
 * One shape for every way the War room can listen (#207): the phone's own recogniser in the
 * apps, the browser's where it has one, and a free on-device model everywhere else.
 */

/** Which recogniser is doing the listening. */
export type EngineKind = 'native' | 'webSpeech' | 'onDevice'

/** Why listening stopped early, in the words the button shows. */
export type VoiceError = 'denied' | 'unavailable' | 'noSpeech' | 'failed'

/** Bytes of the on-device model fetched so far, out of the total known. */
export interface Download {
  readonly loaded: number
  readonly total: number
}

/** What an engine tells the button while it runs. */
export interface Listener {
  /** words so far that may still change */
  readonly interim: (text: string) => void
  /** a settled phrase, ready for the list */
  readonly final: (text: string) => void
  /** microphone loudness, 0 to 1, only from engines that can measure it */
  readonly level: (value: number) => void
  /** the on-device model is downloading (first use only) */
  readonly download: (progress: Download) => void
  /** the microphone is open */
  readonly listening: () => void
  /** recording is over and the words are being worked out */
  readonly transcribing: () => void
  /** finished, whether or not anything was heard */
  readonly end: () => void
  readonly error: (kind: VoiceError) => void
}

/** A running listen: `stop` keeps what was said, `cancel` throws it away. */
export interface Session {
  readonly stop: () => void
  readonly cancel: () => void
}

/** Starts listening in `lang` (a BCP 47 tag such as en-AU). */
export type Engine = (lang: string, listener: Listener) => Session
