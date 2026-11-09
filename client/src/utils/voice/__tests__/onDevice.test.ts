import { listenerMock } from '../../../test/listenerMock'
import type { Reply, Request } from '../model'
import { MODELS } from '../model'
import type { OnDeviceParts, Recording, Transcriber } from '../onDevice'
import {
  decodeTo16k,
  firstUseMegabytes,
  loudness,
  markDownloaded,
  MAX_RECORDING_MS,
  meterWith,
  microphoneError,
  onDeviceEngine,
  openMicrophone,
  recordWith,
  workerTranscriber
} from '../onDevice'

/* #207: recording plus the free model, for browsers without a recogniser (Firefox). */

const flush = async () => {
  for (let i = 0; i < 10; i += 1) await Promise.resolve()
}

const track = () => ({ stop: jest.fn() })
const streamWith = (tracks = [track()]) => {
  const stream = { getTracks: () => tracks }
  return { stream: Object.assign(Object.create(null), stream), tracks }
}

describe('microphoneError', () => {
  it('reads a refusal as denied and anything else as failed', () => {
    expect(microphoneError({ name: 'NotAllowedError' })).toBe('denied')
    expect(microphoneError({ name: 'SecurityError' })).toBe('denied')
    expect(microphoneError({ name: 'NotFoundError' })).toBe('failed')
    expect(microphoneError(null)).toBe('failed')
  })
})

describe('openMicrophone', () => {
  it('asks for mono audio with echo cancelling', async () => {
    const getUserMedia = jest.fn(() => Promise.resolve('stream'))
    Reflect.set(navigator, 'mediaDevices', { getUserMedia })
    expect(await openMicrophone()).toBe('stream')
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
    })
    Reflect.deleteProperty(navigator, 'mediaDevices')
  })
})

describe('recordWith', () => {
  it('records until stopped and hands back one blob', async () => {
    class FakeRecorder extends EventTarget {
      static last: FakeRecorder | null = null
      mimeType = 'audio/webm'
      start = jest.fn()
      stop = jest.fn(() => {
        const event = Object.assign(new Event('dataavailable'), {
          data: new Blob(['abc'])
        })
        this.dispatchEvent(event)
        this.dispatchEvent(new Event('stop'))
      })
      constructor() {
        super()
        FakeRecorder.last = this
      }
    }
    Reflect.set(window, 'MediaRecorder', FakeRecorder)
    const recording = recordWith(streamWith().stream)
    expect(FakeRecorder.last?.start).toHaveBeenCalled()
    const blob = await recording.stop()
    expect(blob.size).toBe(3)
    expect(blob.type).toBe('audio/webm')
    Reflect.deleteProperty(window, 'MediaRecorder')
  })
})

describe('loudness', () => {
  it('is 0 for silence and capped at 1', () => {
    expect(loudness(new Float32Array(4))).toBe(0)
    expect(loudness(new Float32Array([1, -1]))).toBe(1)
    expect(loudness(new Float32Array([0.1, -0.1]))).toBeCloseTo(0.4)
    expect(loudness(new Float32Array(0))).toBe(0)
  })
})

describe('meterWith', () => {
  it('reports loudness ten times a second until stopped', () => {
    jest.useFakeTimers()
    const connect = jest.fn()
    const close = jest.fn(() => Promise.resolve())
    const analyser = {
      fftSize: 0,
      getFloatTimeDomainData: (samples: Float32Array) => samples.fill(0.1)
    }
    class FakeContext {
      createAnalyser = () => analyser
      createMediaStreamSource = () => ({ connect })
      close = close
    }
    Reflect.set(window, 'AudioContext', FakeContext)
    const level = jest.fn()
    const stop = meterWith(streamWith().stream, level)
    expect(connect).toHaveBeenCalledWith(analyser)
    jest.advanceTimersByTime(100)
    expect(level).toHaveBeenCalledWith(expect.closeTo(0.4))
    stop()
    jest.advanceTimersByTime(500)
    expect(level).toHaveBeenCalledTimes(1)
    expect(close).toHaveBeenCalled()
    Reflect.deleteProperty(window, 'AudioContext')
    jest.useRealTimers()
  })
})

describe('decodeTo16k', () => {
  it('decodes at 16 kHz mono', async () => {
    const samples = new Float32Array(3)
    const made: unknown[][] = []
    class FakeOffline {
      constructor(...args: unknown[]) {
        made.push(args)
      }
      decodeAudioData = jest.fn(() =>
        Promise.resolve({ getChannelData: () => samples })
      )
    }
    Reflect.set(window, 'OfflineAudioContext', FakeOffline)
    const blob = { arrayBuffer: () => Promise.resolve(new ArrayBuffer(2)) }
    expect(await decodeTo16k(Object.assign(new Blob(), blob))).toBe(samples)
    expect(made).toEqual([[1, 1, 16_000]])
    Reflect.deleteProperty(window, 'OfflineAudioContext')
  })
})

describe('workerTranscriber', () => {
  class FakeWorker {
    posted: Request[] = []
    listeners: Record<string, Array<(event: MessageEvent<Reply>) => void>> = {}
    addEventListener(
      type: 'message' | 'error',
      listener: (event: MessageEvent<Reply>) => void
    ) {
      this.listeners[type] = [...(this.listeners[type] ?? []), listener]
    }
    postMessage(message: Request) {
      this.posted.push(message)
    }
    emit(type: string, data: Reply = { id: 0, type: 'done', text: '' }) {
      this.listeners[type]?.forEach((listener) =>
        listener(new MessageEvent(type, { data }))
      )
    }
    reply(data: Reply) {
      this.emit('message', data)
    }
  }

  beforeEach(() => localStorage.clear())

  it('starts the worker on first use, passes progress, and remembers the download', async () => {
    const worker = new FakeWorker()
    const make = jest.fn(() => worker)
    const transcriber = workerTranscriber(make)
    expect(make).not.toHaveBeenCalled()
    const progress = jest.fn()
    const loading = transcriber.load('en-AU', progress)
    expect(make).toHaveBeenCalledTimes(1)
    worker.reply({ id: 1, type: 'progress', download: { loaded: 1, total: 2 } })
    worker.reply({ id: 99, type: 'done', text: 'stray' })
    worker.reply({ id: 1, type: 'done', text: '' })
    await loading
    expect(progress).toHaveBeenCalledWith({ loaded: 1, total: 2 })
    expect(firstUseMegabytes('en-AU')).toBe(0)
    const heard = transcriber.transcribe(new Float32Array(1), 'en-AU')
    expect(make).toHaveBeenCalledTimes(1)
    worker.reply({ id: 2, type: 'progress', download: { loaded: 1, total: 1 } })
    worker.reply({ id: 2, type: 'done', text: 'carrot' })
    expect(await heard).toBe('carrot')
  })

  it('fails what was asked when the model or the worker fails', async () => {
    const workers: FakeWorker[] = []
    const transcriber = workerTranscriber(() => {
      const worker = new FakeWorker()
      workers.push(worker)
      return worker
    })
    const loading = transcriber.load('ja-JP', jest.fn())
    workers[0]?.reply({ id: 1, type: 'error', message: 'offline' })
    await expect(loading).rejects.toThrow('offline')
    expect(firstUseMegabytes('ja-JP')).toBe(MODELS.ja.megabytes)
    const heard = transcriber.transcribe(new Float32Array(1), 'ja-JP')
    workers[0]?.emit('error')
    await expect(heard).rejects.toThrow('worker failed')
    void transcriber.transcribe(new Float32Array(1), 'ja-JP')
    expect(workers).toHaveLength(2)
  })
})

describe('first use', () => {
  it('names the download size until the model is cached', () => {
    localStorage.clear()
    expect(firstUseMegabytes('en-AU')).toBe(MODELS.en.megabytes)
    markDownloaded('en-AU')
    expect(firstUseMegabytes('en-AU')).toBe(0)
    expect(firstUseMegabytes('ja-JP')).toBe(MODELS.ja.megabytes)
  })
})

describe('onDeviceEngine', () => {
  const setup = (overrides: Partial<OnDeviceParts> = {}) => {
    const { stream, tracks } = streamWith()
    const recording: Recording = {
      stop: jest.fn(() => Promise.resolve(new Blob(['x'])))
    }
    const stopMeter = jest.fn()
    const transcriber: jest.Mocked<Transcriber> = {
      load: jest.fn((_lang, progress) => {
        progress({ loaded: 1, total: 2 })
        return Promise.resolve()
      }),
      transcribe: jest.fn((_audio: Float32Array, _lang: string) =>
        Promise.resolve(' Two carrots. ')
      )
    }
    const parts: OnDeviceParts = {
      microphone: jest.fn(() => Promise.resolve(stream)),
      record: jest.fn(() => recording),
      meter: jest.fn((_stream, level) => {
        level(0.5)
        return stopMeter
      }),
      decode: jest.fn(() => Promise.resolve(new Float32Array(2))),
      transcriber,
      ...overrides
    }
    return { parts, tracks, recording, stopMeter, transcriber }
  }

  it('records with a level meter while the model downloads, then transcribes on stop', async () => {
    const { parts, tracks, stopMeter, transcriber } = setup()
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('ja-JP', listener)
    expect(transcriber.load).toHaveBeenCalledWith('ja-JP', listener.download)
    expect(listener.download).toHaveBeenCalledWith({ loaded: 1, total: 2 })
    await flush()
    expect(listener.listening).toHaveBeenCalled()
    expect(listener.level).toHaveBeenCalledWith(0.5)
    session.stop()
    expect(listener.transcribing).toHaveBeenCalled()
    await flush()
    expect(transcriber.transcribe).toHaveBeenCalledWith(
      expect.any(Float32Array),
      'ja-JP'
    )
    expect(listener.final).toHaveBeenCalledWith('Two carrots.')
    expect(listener.end).toHaveBeenCalled()
    expect(stopMeter).toHaveBeenCalled()
    expect(tracks[0]?.stop).toHaveBeenCalled()
    session.stop()
    expect(listener.end).toHaveBeenCalledTimes(1)
  })

  it('stops by itself after the longest recording', async () => {
    jest.useFakeTimers()
    const { parts } = setup()
    const listener = listenerMock()
    onDeviceEngine(parts)('en-AU', listener)
    await flush()
    jest.advanceTimersByTime(MAX_RECORDING_MS)
    await flush()
    expect(listener.final).toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('says nothing was heard when the model hears nothing', async () => {
    const { parts, transcriber } = setup()
    transcriber.transcribe.mockResolvedValue('  ')
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('en-AU', listener)
    await flush()
    session.stop()
    await flush()
    expect(listener.error).toHaveBeenCalledWith('noSpeech')
  })

  it('fails when the model cannot load', async () => {
    const { parts, transcriber } = setup()
    transcriber.load.mockRejectedValue(new Error('offline'))
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('en-AU', listener)
    await flush()
    session.stop()
    await flush()
    expect(listener.error).toHaveBeenCalledWith('failed')
  })

  it('says when the microphone is blocked', async () => {
    const { parts } = setup({
      microphone: jest.fn(() => Promise.reject({ name: 'NotAllowedError' }))
    })
    const listener = listenerMock()
    onDeviceEngine(parts)('en-AU', listener)
    await flush()
    expect(listener.error).toHaveBeenCalledWith('denied')
    expect(parts.record).not.toHaveBeenCalled()
  })

  it('stopping before the microphone opens just ends, and closes it once it does', async () => {
    const { parts, tracks } = setup()
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('en-AU', listener)
    session.stop()
    expect(listener.end).toHaveBeenCalled()
    await flush()
    expect(tracks[0]?.stop).toHaveBeenCalled()
    expect(parts.record).not.toHaveBeenCalled()
    expect(listener.listening).not.toHaveBeenCalled()
  })

  it('a refusal after cancelling says nothing', async () => {
    const { parts } = setup({
      microphone: jest.fn(() => Promise.reject({ name: 'NotAllowedError' }))
    })
    const listener = listenerMock()
    onDeviceEngine(parts)('en-AU', listener).cancel()
    await flush()
    expect(listener.error).not.toHaveBeenCalled()
  })

  it('cancelling while transcribing throws the words away', async () => {
    const { parts, transcriber } = setup()
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('en-AU', listener)
    await flush()
    session.stop()
    session.cancel()
    await flush()
    expect(transcriber.transcribe).toHaveBeenCalled()
    expect(listener.final).not.toHaveBeenCalled()
    transcriber.transcribe.mockRejectedValue(new Error('x'))
    const again = onDeviceEngine(parts)('en-AU', listener)
    await flush()
    again.stop()
    again.cancel()
    await flush()
    expect(listener.error).not.toHaveBeenCalled()
  })

  it('cancelling after the end changes nothing', async () => {
    const { parts } = setup()
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('en-AU', listener)
    await flush()
    session.stop()
    await flush()
    session.cancel()
    expect(listener.end).toHaveBeenCalledTimes(1)
  })

  it('cancelling while recording closes the microphone', async () => {
    const { parts, tracks } = setup()
    const listener = listenerMock()
    const session = onDeviceEngine(parts)('en-AU', listener)
    await flush()
    session.cancel()
    expect(tracks[0]?.stop).toHaveBeenCalled()
    session.stop()
    expect(listener.transcribing).not.toHaveBeenCalled()
  })
})
