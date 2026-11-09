/*
 * The phone's own recogniser in the Capacitor apps (#207), through
 * @capacitor-community/speech-recognition (MIT): Android SpeechRecognizer, iOS
 * SFSpeechRecognizer. Nothing to download. Android ends each utterance by itself, so after
 * every phrase the engine starts again until the button is pressed; the last words of an
 * utterance can arrive just after the "stopped" event, so it waits a moment for them.
 */
import type { Engine, VoiceError } from './types'

interface Handle {
  remove: () => Promise<void>
}

/** The parts of the plugin the War room uses. */
export interface NativeSpeech {
  available: () => Promise<{ available: boolean }>
  checkPermissions: () => Promise<{ speechRecognition: string }>
  requestPermissions: () => Promise<{ speechRecognition: string }>
  start: (options: {
    language: string
    partialResults: boolean
    popup: boolean
    maxResults: number
  }) => Promise<unknown>
  stop: () => Promise<void>
  isListening: () => Promise<{ listening: boolean }>
  addListener(
    eventName: 'partialResults',
    listener: (data: { matches: string[] }) => void
  ): Promise<Handle>
  addListener(
    eventName: 'listeningState',
    listener: (data: { status: 'started' | 'stopped' }) => void
  ): Promise<Handle>
}

/** How long to wait for late words after the recogniser says it stopped. */
export const SETTLE_MS = 800
/** How often to check the recogniser is still on (Android errors send no event). */
export const POLL_MS = 1000

/** A plugin rejection in the button's words. */
export const nativeError = (reason: unknown): VoiceError =>
  /permission|denied|not authori[sz]ed/i.test(String(reason))
    ? 'denied'
    : 'failed'

/** The plugin, loaded only when the button is first pressed in the app. */
export const loadNativeSpeech = async (): Promise<NativeSpeech> =>
  (await import('@capacitor-community/speech-recognition')).SpeechRecognition

export const nativeEngine =
  (load: () => Promise<NativeSpeech> = loadNativeSpeech): Engine =>
  (lang, listener) => {
    let plugin: NativeSpeech | null = null
    let userStopped = false
    let over = false
    let heard = ''
    let anyHeard = false
    let settling: ReturnType<typeof setTimeout> | null = null
    let poll: ReturnType<typeof setInterval> | null = null
    let starting = false
    const handles: Handle[] = []

    const close = (): void => {
      over = true
      if (settling !== null) clearTimeout(settling)
      if (poll !== null) clearInterval(poll)
      handles.forEach((handle) => void handle.remove())
    }
    const fail = (kind: VoiceError): void => {
      if (over) return
      close()
      listener.error(kind)
    }
    const listen = async (speech: NativeSpeech): Promise<void> => {
      starting = true
      try {
        await speech.start({
          language: lang,
          partialResults: true,
          popup: false,
          maxResults: 1
        })
        listener.listening()
      } catch (reason) {
        fail(nativeError(reason))
      }
      starting = false
    }
    /* one utterance is over: hand it on, then listen again unless the button said stop */
    const settled = (speech: NativeSpeech): void => {
      settling = null
      if (over) return
      const phrase = heard
      heard = ''
      if (phrase !== '') listener.final(phrase)
      if (phrase !== '' && !userStopped) {
        void listen(speech)
        return
      }
      if (!anyHeard) return fail('noSpeech')
      close()
      listener.end()
    }
    const settle = (speech: NativeSpeech): void => {
      if (over) return
      if (settling !== null) clearTimeout(settling)
      if (userStopped) listener.transcribing()
      settling = setTimeout(() => settled(speech), SETTLE_MS)
    }

    const begin = async (): Promise<void> => {
      const speech = await load()
      plugin = speech
      if (over) return
      if (!(await speech.available()).available) return fail('unavailable')
      const asked = await speech.checkPermissions()
      const granted =
        asked.speechRecognition === 'granted' ||
        (await speech.requestPermissions()).speechRecognition === 'granted'
      if (!granted) return fail('denied')
      if (over) return
      handles.push(
        await speech.addListener('partialResults', ({ matches }) => {
          const text = matches[0]?.trim() ?? ''
          if (text === '' || over) return
          heard = text
          anyHeard = true
          listener.interim(text)
          if (settling !== null) settle(speech)
        }),
        await speech.addListener('listeningState', ({ status }) => {
          if (status === 'stopped') settle(speech)
        })
      )
      poll = setInterval(() => {
        void speech.isListening().then(({ listening }) => {
          if (!listening && !starting && settling === null) settle(speech)
        })
      }, POLL_MS)
      await listen(speech)
    }
    begin().catch(() => fail('unavailable'))

    return {
      stop: () => {
        userStopped = true
        if (over) return
        if (plugin === null) {
          close()
          listener.end()
          return
        }
        void plugin.stop()
        settle(plugin)
      },
      cancel: () => {
        if (over) return
        close()
        void plugin?.stop()
      }
    }
  }
