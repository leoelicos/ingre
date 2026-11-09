import type { Reply, SpeechModel } from '../model'
import type { Toolkit } from '../model'
import { MODELS, modelFor, modelLoader, progressTracker, serve } from '../model'

/* #207: the free on-device model, run in a worker; a stand-in toolkit replaces transformers.js. */

const env = { allowLocalModels: true }
const pipeline = jest.fn<
  ReturnType<Toolkit['pipeline']>,
  Parameters<Toolkit['pipeline']>
>()
const loadModel = modelLoader(() => Promise.resolve({ env, pipeline }))

describe('modelFor', () => {
  it('is Moonshine tiny for English and Whisper base for Japanese', () => {
    expect(modelFor('en-AU')).toBe(MODELS.en)
    expect(modelFor('ja-JP')).toBe(MODELS.ja)
    expect(MODELS.en.id).toBe('onnx-community/moonshine-tiny-ONNX')
    expect(MODELS.ja.options).toEqual({
      language: 'japanese',
      task: 'transcribe'
    })
  })
})

describe('progressTracker', () => {
  it('adds up every file’s bytes and ignores other news', () => {
    const report = jest.fn()
    const track = progressTracker(report)
    track({ status: 'initiate', file: 'a' })
    track({ status: 'progress' })
    expect(report).not.toHaveBeenCalled()
    track({ status: 'progress', file: 'a', loaded: 5, total: 10 })
    track({ status: 'progress', file: 'b', loaded: 1, total: 20 })
    track({ status: 'progress', file: 'a', loaded: 10, total: 10 })
    expect(report).toHaveBeenLastCalledWith({ loaded: 11, total: 30 })
    track({ status: 'progress', file: 'c' })
    expect(report).toHaveBeenLastCalledWith({ loaded: 11, total: 30 })
  })
})

describe('loadModel', () => {
  it('loads the model from the hub only, and reads its text', async () => {
    const recognise = jest.fn(() => Promise.resolve({ text: ' Two carrots. ' }))
    pipeline.mockImplementation((_task, _id, options) => {
      options.progress_callback({
        status: 'progress',
        file: 'f',
        loaded: 1,
        total: 2
      })
      return Promise.resolve(recognise)
    })
    const progress = jest.fn()
    const run = await loadModel(MODELS.ja, progress)
    expect(env.allowLocalModels).toBe(false)
    expect(pipeline).toHaveBeenCalledWith(
      'automatic-speech-recognition',
      MODELS.ja.id,
      expect.objectContaining({ dtype: MODELS.ja.dtype })
    )
    expect(progress).toHaveBeenCalledWith({ loaded: 1, total: 2 })
    const audio = new Float32Array(4)
    expect(await run(audio)).toBe('Two carrots.')
    expect(recognise).toHaveBeenCalledWith(audio, MODELS.ja.options)
  })

  it('joins chunked output and tolerates a missing text', async () => {
    pipeline.mockResolvedValue(
      jest.fn(() =>
        Promise.resolve([{ text: 'carrot' }, { text: 'onion' }, {}])
      )
    )
    const run = await loadModel(MODELS.en, jest.fn())
    expect(await run(new Float32Array(1))).toBe('carrot onion')
  })
})

describe('serve', () => {
  const model: SpeechModel = MODELS.en

  it('loads each model once, reports progress to the asker, and transcribes', async () => {
    const replies: Reply[] = []
    const recognise = jest.fn(() => Promise.resolve('carrot'))
    const load = jest.fn(
      (
        _model: SpeechModel,
        progress: (d: { loaded: number; total: number }) => void
      ) => {
        progress({ loaded: 1, total: 2 })
        return Promise.resolve(recognise)
      }
    )
    const handle = serve((reply) => replies.push(reply), load)
    await handle({ id: 1, type: 'load', lang: 'en-AU' })
    await handle({
      id: 2,
      type: 'transcribe',
      lang: 'en-AU',
      audio: new Float32Array(1)
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledWith(model, expect.any(Function))
    expect(replies).toEqual([
      { id: 1, type: 'progress', download: { loaded: 1, total: 2 } },
      { id: 1, type: 'done', text: '' },
      { id: 2, type: 'done', text: 'carrot' }
    ])
  })

  it('reports a failed load, and tries again next time', async () => {
    const replies: Reply[] = []
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(() => Promise.resolve('onion'))
    const handle = serve((reply) => replies.push(reply), load)
    await handle({ id: 1, type: 'load', lang: 'en-AU' })
    await handle({
      id: 2,
      type: 'transcribe',
      lang: 'en-AU',
      audio: new Float32Array(1)
    })
    expect(replies).toEqual([
      { id: 1, type: 'error', message: 'Error: offline' },
      { id: 2, type: 'done', text: 'onion' }
    ])
  })

  it('works with the stand-in toolkit end to end', async () => {
    pipeline.mockResolvedValue(jest.fn(() => Promise.resolve({ text: 'egg' })))
    const replies: Reply[] = []
    await serve(
      (reply) => replies.push(reply),
      loadModel
    )({
      id: 3,
      type: 'transcribe',
      lang: 'en-AU',
      audio: new Float32Array(1)
    })
    expect(replies).toEqual([{ id: 3, type: 'done', text: 'egg' }])
  })
})
