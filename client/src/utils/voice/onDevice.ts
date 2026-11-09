/*
 * Listening without a recogniser (#207: Firefox, phones without a speech service): record the
 * microphone, then transcribe on the device with the free model in a Web Worker. The model
 * starts downloading the moment the button is pressed, alongside the recording, so the first
 * phrase waits as little as possible.
 */
import type { Reply, Request } from './model'
import { modelFor } from './model'
import type { Download, Engine, VoiceError } from './types'

/** Longest single recording; the button stops by itself after this. */
export const MAX_RECORDING_MS = 30_000

/** A recording in progress; `stop` hands back the audio. */
export interface Recording {
  readonly stop: () => Promise<Blob>
}

export interface Transcriber {
  readonly load: (
    lang: string,
    progress: (download: Download) => void
  ) => Promise<void>
  readonly transcribe: (audio: Float32Array, lang: string) => Promise<string>
}

export interface OnDeviceParts {
  readonly microphone: () => Promise<MediaStream>
  readonly record: (stream: MediaStream) => Recording
  /** calls back with loudness 0..1 until the returned function is called */
  readonly meter: (
    stream: MediaStream,
    level: (value: number) => void
  ) => () => void
  readonly decode: (audio: Blob) => Promise<Float32Array>
  readonly transcriber: Transcriber
}

/** getUserMedia's refusals in the button's words. */
export const microphoneError = (reason: unknown): VoiceError => {
  const name = String(Reflect.get(Object(reason), 'name'))
  return name === 'NotAllowedError' || name === 'SecurityError'
    ? 'denied'
    : 'failed'
}

export const openMicrophone = (): Promise<MediaStream> =>
  navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
  })

export const recordWith = (stream: MediaStream): Recording => {
  const recorder = new MediaRecorder(stream)
  const chunks: Blob[] = []
  recorder.addEventListener('dataavailable', ({ data }) => chunks.push(data))
  recorder.start()
  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.addEventListener('stop', () =>
          resolve(new Blob(chunks, { type: recorder.mimeType }))
        )
        recorder.stop()
      })
  }
}

/** Root-mean-square loudness, scaled so normal speech fills most of the meter. */
export const loudness = (samples: Float32Array): number =>
  Math.min(
    1,
    4 *
      Math.sqrt(
        samples.reduce((sum, sample) => sum + sample * sample, 0) /
          Math.max(1, samples.length)
      )
  )

export const meterWith = (
  stream: MediaStream,
  level: (value: number) => void
): (() => void) => {
  const context = new AudioContext()
  const analyser = context.createAnalyser()
  analyser.fftSize = 512
  context.createMediaStreamSource(stream).connect(analyser)
  const samples = new Float32Array(analyser.fftSize)
  const timer = setInterval(() => {
    analyser.getFloatTimeDomainData(samples)
    level(loudness(samples))
  }, 100)
  return () => {
    clearInterval(timer)
    void context.close()
  }
}

/** Any recorded format, as the 16 kHz mono samples the model reads. */
export const decodeTo16k = async (audio: Blob): Promise<Float32Array> => {
  const context = new OfflineAudioContext(1, 1, 16_000)
  const buffer = await context.decodeAudioData(await audio.arrayBuffer())
  return buffer.getChannelData(0)
}

/** The parts of a Worker the transcriber uses. */
export interface WorkerLike {
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<Reply>) => void
  ): void
  addEventListener(type: 'error', listener: () => void): void
  postMessage(message: Request): void
}

/** Talks to the model's worker, which is only created on first use. */
export const workerTranscriber = (make: () => WorkerLike): Transcriber => {
  let worker: WorkerLike | null = null
  let next = 0
  const waiting = new Map<
    number,
    {
      readonly resolve: (text: string) => void
      readonly reject: (reason: Error) => void
      readonly progress: (download: Download) => void
    }
  >()
  const failAll = (): void => {
    waiting.forEach(({ reject }) => reject(new Error('worker failed')))
    waiting.clear()
    worker = null
  }
  const ready = (): WorkerLike => {
    if (worker !== null) return worker
    const created = make()
    created.addEventListener('message', ({ data }: MessageEvent<Reply>) => {
      const asked = waiting.get(data.id)
      if (asked === undefined) return
      if (data.type === 'progress') return asked.progress(data.download)
      waiting.delete(data.id)
      if (data.type === 'done') asked.resolve(data.text)
      else asked.reject(new Error(data.message))
    })
    created.addEventListener('error', failAll)
    worker = created
    return created
  }
  const ask = (
    request: Request,
    progress: (download: Download) => void = () => undefined
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      waiting.set(request.id, { resolve, reject, progress })
      ready().postMessage(request)
    })
  return {
    load: async (lang, progress) => {
      await ask({ id: (next += 1), type: 'load', lang }, progress)
      markDownloaded(lang)
    },
    transcribe: (audio, lang) =>
      ask({ id: (next += 1), type: 'transcribe', lang, audio })
  }
}

const DOWNLOADED_KEY = 'ingre.voiceModel'

/** Remembers that this model is in the browser's cache, so its size need not be mentioned. */
export const markDownloaded = (lang: string): void =>
  localStorage.setItem(`${DOWNLOADED_KEY}.${modelFor(lang).id}`, '1')

/** Megabytes the first use of the model for `lang` will download; 0 once it is cached. */
export const firstUseMegabytes = (lang: string): number =>
  localStorage.getItem(`${DOWNLOADED_KEY}.${modelFor(lang).id}`) === '1'
    ? 0
    : modelFor(lang).megabytes

export const onDeviceEngine =
  (parts: OnDeviceParts): Engine =>
  (lang, listener) => {
    let over = false
    let cancelled = false
    let stream: MediaStream | null = null
    let recording: Recording | null = null
    let stopMeter: () => void = () => undefined
    let limit: ReturnType<typeof setTimeout> | null = null
    const close = (): void => {
      over = true
      if (limit !== null) clearTimeout(limit)
      stopMeter()
      stream?.getTracks().forEach((track) => track.stop())
    }
    const fail = (kind: VoiceError): void => {
      if (over) return
      close()
      listener.error(kind)
    }
    const model = parts.transcriber.load(lang, listener.download)
    model.catch(() => undefined)

    const finish = async (taken: Recording): Promise<void> => {
      listener.transcribing()
      const audio = await taken.stop()
      close()
      try {
        await model
        const text = (
          await parts.transcriber.transcribe(await parts.decode(audio), lang)
        ).trim()
        if (cancelled) return
        if (text === '') return listener.error('noSpeech')
        listener.final(text)
        listener.end()
      } catch {
        if (!cancelled) listener.error('failed')
      }
    }
    const stop = (): void => {
      if (over) return
      if (recording === null) {
        close()
        return listener.end()
      }
      const taken = recording
      recording = null
      void finish(taken)
    }

    parts
      .microphone()
      .then((opened) => {
        if (over) return opened.getTracks().forEach((track) => track.stop())
        stream = opened
        stopMeter = parts.meter(opened, listener.level)
        recording = parts.record(opened)
        limit = setTimeout(stop, MAX_RECORDING_MS)
        listener.listening()
      })
      .catch((reason: unknown) => fail(microphoneError(reason)))

    return {
      stop,
      cancel: () => {
        cancelled = true
        recording = null
        if (!over) close()
      }
    }
  }
