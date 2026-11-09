/*
 * The free on-device speech model (#207), run inside a Web Worker so the page never waits on it.
 * transformers.js (Apache-2.0) with Moonshine tiny (MIT, English, ~28 MB) or, for Japanese,
 * Whisper base (MIT, ~77 MB, weaker on short phrases). Downloaded from Hugging Face on first use
 * and kept in the browser's Cache Storage, so later visits work offline.
 * Comparison and measurements: docs/VOICE.md.
 */
import type { Download } from './types'

export interface SpeechModel {
  readonly id: string
  /** what the first use downloads, model plus runtime, rounded up */
  readonly megabytes: number
  readonly dtype: Readonly<Record<string, 'q8'>>
  readonly options: Readonly<Record<string, string>>
}

export const MODELS: Readonly<Record<'en' | 'ja', SpeechModel>> = {
  en: {
    id: 'onnx-community/moonshine-tiny-ONNX',
    megabytes: 34,
    dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' },
    options: {}
  },
  ja: {
    id: 'onnx-community/whisper-base',
    megabytes: 82,
    dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' },
    options: { language: 'japanese', task: 'transcribe' }
  }
}

/** The model for a recogniser language such as en-AU or ja-JP. */
export const modelFor = (lang: string): SpeechModel =>
  lang.toLowerCase().startsWith('ja') ? MODELS.ja : MODELS.en

/** Turns 16 kHz mono samples into text. */
export type Recognise = (audio: Float32Array) => Promise<string>

export type LoadModel = (
  model: SpeechModel,
  progress: (download: Download) => void
) => Promise<Recognise>

interface ProgressInfo {
  readonly status: string
  readonly file?: string
  readonly loaded?: number
  readonly total?: number
}

/** Adds one file's progress to the running total across all of a model's files. */
export const progressTracker = (report: (download: Download) => void) => {
  const files = new Map<string, Download>()
  return (info: ProgressInfo): void => {
    const { status, file, loaded, total } = info
    if (status !== 'progress' || file === undefined) return
    files.set(file, { loaded: loaded ?? 0, total: total ?? 0 })
    report(
      [...files.values()].reduce(
        (sum, one) => ({
          loaded: sum.loaded + one.loaded,
          total: sum.total + one.total
        }),
        { loaded: 0, total: 0 }
      )
    )
  }
}

const textOf = (output: unknown): string =>
  (Array.isArray(output) ? output : [output])
    .map((one: unknown) => String(Reflect.get(Object(one), 'text') ?? ''))
    .join(' ')
    .trim()

/** Loads transformers.js and the model; only ever runs inside the worker. */
export const loadModel: LoadModel = async (model, progress) => {
  const { pipeline, env } = await import('@huggingface/transformers')
  /* the app's own server answers every path with index.html, so never look there for models */
  env.allowLocalModels = false
  const recognise = await pipeline('automatic-speech-recognition', model.id, {
    dtype: { ...model.dtype },
    progress_callback: progressTracker(progress)
  })
  return async (audio) => textOf(await recognise(audio, { ...model.options }))
}

export type Request =
  | { readonly id: number; readonly type: 'load'; readonly lang: string }
  | {
      readonly id: number
      readonly type: 'transcribe'
      readonly lang: string
      readonly audio: Float32Array
    }

export type Reply =
  | {
      readonly id: number
      readonly type: 'progress'
      readonly download: Download
    }
  | { readonly id: number; readonly type: 'done'; readonly text: string }
  | { readonly id: number; readonly type: 'error'; readonly message: string }

/** The worker's message handler: one load per model, shared by every request. */
export const serve = (
  post: (reply: Reply) => void,
  load: LoadModel = loadModel
) => {
  const loaded = new Map<string, Promise<Recognise>>()
  return async (request: Request): Promise<void> => {
    const { id, lang } = request
    const model = modelFor(lang)
    try {
      const ready =
        loaded.get(model.id) ??
        load(model, (download) => post({ id, type: 'progress', download }))
      loaded.set(model.id, ready)
      ready.catch(() => loaded.delete(model.id))
      const recognise = await ready
      const text =
        request.type === 'transcribe' ? await recognise(request.audio) : ''
      post({ id, type: 'done', text })
    } catch (reason) {
      post({ id, type: 'error', message: String(reason) })
    }
  }
}
