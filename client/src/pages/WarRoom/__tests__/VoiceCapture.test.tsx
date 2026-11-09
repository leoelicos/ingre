import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import type { Abilities } from '../../../utils/voice/engine'
import type { Engine, EngineKind, Listener } from '../../../utils/voice/types'
import type { VoiceSetup } from '../../../utils/voice/useVoiceCapture'
import { HOLD_MS, VoiceCapture } from '../VoiceCapture'

expect.extend(toHaveNoViolations)

/* #207: the giant record button. Engines are fakes; each test drives what they report. */

interface Running {
  readonly lang: string
  readonly listener: Listener
  readonly stop: jest.Mock
  readonly cancel: jest.Mock
}

const fakeEngines = () => {
  const runs: Record<EngineKind, Running[]> = {
    native: [],
    webSpeech: [],
    onDevice: []
  }
  const engine =
    (kind: EngineKind): Engine =>
    (lang, listener) => {
      const run = { lang, listener, stop: jest.fn(), cancel: jest.fn() }
      runs[kind].push(run)
      return run
    }
  return {
    runs,
    engines: {
      native: engine('native'),
      webSpeech: engine('webSpeech'),
      onDevice: engine('onDevice')
    }
  }
}

const open = (abilities: Partial<Abilities> = { webSpeech: true }) => {
  const fake = fakeEngines()
  const onHeard = jest.fn()
  const setup = (): VoiceSetup => ({
    abilities: { native: false, webSpeech: false, record: true, ...abilities },
    engines: fake.engines,
    lang: () => 'en-AU'
  })
  const view = render(
    <VoiceCapture
      onHeard={onHeard}
      setup={setup}
    />
  )
  return { ...fake, onHeard, ...view }
}

const talk = () => screen.getByRole('button', { name: 'Talk' })
const status = () =>
  screen.getByText(
    (_, element) => element?.getAttribute('aria-live') === 'polite'
  )
const report = (fn: () => void) => act(fn)

beforeEach(() => localStorage.clear())

it('is not there when the device cannot listen', () => {
  const { container } = open({ webSpeech: false, record: false })
  expect(container).toBeEmptyDOMElement()
})

it('is a big toggle button that starts and stops with a tap, with live status and words', async () => {
  const user = userEvent.setup()
  const { runs, onHeard } = open()
  expect(talk()).toHaveAttribute('aria-pressed', 'false')
  expect(talk()).toHaveAttribute('aria-keyshortcuts', 'Alt+R')
  expect(talk()).toHaveAccessibleDescription(
    'Tap to start and tap again to stop, or hold while you talk. Shortcut: Alt+R. Uses your browser’s speech recognition, which may send audio to Google or Apple.'
  )
  expect(talk().className).toContain('h-44')
  await user.click(talk())
  const run = runs.webSpeech[0]
  expect(run?.lang).toBe('en-AU')
  expect(talk()).toHaveAttribute('aria-pressed', 'true')
  expect(status()).toHaveTextContent('Starting the microphone')
  report(() => run?.listener.listening())
  expect(status()).toHaveTextContent('Listening')
  expect(screen.getByTestId('voice-ring').className).toContain(
    'motion-safe:animate-ping'
  )
  report(() => run?.listener.interim('two carr'))
  expect(screen.getByText('Hearing: two carr')).toBeInTheDocument()
  report(() => run?.listener.final('two carrots'))
  expect(onHeard).toHaveBeenCalledWith('two carrots')
  expect(screen.queryByText(/Hearing:/)).toBeNull()
  await user.click(talk())
  expect(run?.stop).toHaveBeenCalled()
  expect(runs.webSpeech).toHaveLength(1)
  report(() => run?.listener.transcribing())
  expect(status()).toHaveTextContent('Working out what you said')
  report(() => run?.listener.end())
  expect(talk()).toHaveAttribute('aria-pressed', 'false')
  expect(status()).toHaveTextContent('')
})

it('holding talks until let go', async () => {
  const user = userEvent.setup()
  const now = jest.spyOn(Date, 'now').mockReturnValue(1_000)
  const { runs } = open()
  await user.pointer({ keys: '[MouseLeft>]', target: talk() })
  expect(runs.webSpeech).toHaveLength(1)
  now.mockReturnValue(1_000 + HOLD_MS)
  await user.pointer({ keys: '[/MouseLeft]', target: talk() })
  expect(runs.webSpeech[0]?.stop).toHaveBeenCalledTimes(1)
  now.mockRestore()
})

it('a press that slid off the button does not need two taps to stop', async () => {
  const user = userEvent.setup()
  const { runs } = open()
  await user.pointer([
    { keys: '[MouseLeft>]', target: talk() },
    { target: document.body },
    { keys: '[/MouseLeft]', target: document.body }
  ])
  expect(talk()).toHaveAttribute('aria-pressed', 'true')
  await user.click(talk())
  expect(runs.webSpeech[0]?.stop).toHaveBeenCalled()
})

it('Alt+R starts and stops from anywhere; Escape stops', async () => {
  const user = userEvent.setup()
  const { runs } = open()
  await user.keyboard('{Escape}')
  await user.keyboard('{Alt>}r{/Alt}')
  expect(runs.webSpeech).toHaveLength(1)
  report(() => runs.webSpeech[0]?.listener.listening())
  await user.keyboard('{Alt>}r{/Alt}')
  expect(runs.webSpeech[0]?.stop).toHaveBeenCalledTimes(1)
  await user.keyboard('{Escape}')
  expect(runs.webSpeech[0]?.stop).toHaveBeenCalledTimes(2)
  await user.keyboard('r')
  expect(runs.webSpeech).toHaveLength(1)
})

it('works from the keyboard: Tab to it, Space to start and stop', async () => {
  const user = userEvent.setup()
  const { runs } = open()
  await user.tab()
  expect(talk()).toHaveFocus()
  await user.keyboard(' ')
  expect(runs.webSpeech).toHaveLength(1)
  await user.keyboard(' ')
  expect(runs.webSpeech[0]?.stop).toHaveBeenCalled()
})

it('moves to the on-device model by itself when the browser’s recogniser cannot work here', async () => {
  const user = userEvent.setup()
  const { runs } = open({ webSpeech: true, record: true })
  await user.click(talk())
  report(() => runs.webSpeech[0]?.listener.error('unavailable'))
  expect(runs.onDevice).toHaveLength(1)
  expect(talk()).toHaveAttribute('aria-pressed', 'true')
  expect(talk()).toHaveAccessibleDescription(
    /Recognised on this device. No audio leaves it. The first time, this downloads a 34 MB speech model./
  )
})

it.each([
  [
    'denied',
    'The microphone is blocked. Allow it in your browser or phone settings, or type instead.'
  ],
  ['noSpeech', 'Nothing was heard. Tap Talk and try again.'],
  ['failed', 'Voice stopped working. Try again, or type instead.']
] as const)('says why it stopped: %s', async (error, said) => {
  const user = userEvent.setup()
  const { runs } = open()
  await user.click(talk())
  report(() => runs.webSpeech[0]?.listener.error(error))
  expect(status()).toHaveTextContent(said)
  expect(talk()).toHaveAttribute('aria-pressed', 'false')
  await user.click(talk())
  expect(runs.webSpeech).toHaveLength(2)
})

it('says when there is nowhere else to go', async () => {
  const user = userEvent.setup()
  const { runs } = open({ native: true, record: false })
  expect(talk()).toHaveAccessibleDescription(
    /Uses your phone’s speech recognition./
  )
  await user.click(talk())
  report(() => runs.native[0]?.listener.error('unavailable'))
  expect(status()).toHaveTextContent(
    'Voice isn’t available on this device. Type instead.'
  )
})

it('on-device: a level meter, download progress, and the size only until it is cached', async () => {
  const user = userEvent.setup()
  const { runs } = open({ webSpeech: false, record: true })
  expect(talk()).toHaveAccessibleDescription(
    /The first time, this downloads a 34 MB speech model. After that it works offline./
  )
  await user.click(talk())
  const run = runs.onDevice[0]
  report(() => run?.listener.listening())
  report(() => run?.listener.level(0.5))
  expect(screen.getByTestId('voice-meter').firstElementChild).toHaveStyle({
    width: '50%'
  })
  expect(screen.getByTestId('voice-ring')).toHaveStyle({
    transform: 'scale(1.15)'
  })
  expect(screen.getByTestId('voice-ring').className).toContain(
    'motion-reduce:transition-none'
  )
  report(() =>
    run?.listener.download({ loaded: 12_000_000, total: 33_400_000 })
  )
  expect(status()).toHaveTextContent(
    'Downloading the speech model: 12 of 33 MB'
  )
  localStorage.setItem(
    'ingre.voiceModel.onnx-community/moonshine-tiny-ONNX',
    '1'
  )
  report(() => run?.listener.download({ loaded: 1, total: 1 }))
  expect(status()).toHaveTextContent('Listening')
  report(() => run?.listener.end())
  expect(talk()).not.toHaveAccessibleDescription(/downloads/)
})

it('an engine that fails as it starts leaves the button ready', async () => {
  const user = userEvent.setup()
  const fake = fakeEngines()
  const failing: Engine = (_lang, listener) => {
    listener.error('failed')
    return { stop: jest.fn(), cancel: jest.fn() }
  }
  render(
    <VoiceCapture
      onHeard={jest.fn()}
      setup={() => ({
        abilities: { native: false, webSpeech: true, record: false },
        engines: { ...fake.engines, webSpeech: failing },
        lang: () => 'en-AU'
      })}
    />
  )
  await user.click(talk())
  expect(talk()).toHaveAttribute('aria-pressed', 'false')
  await user.keyboard('{Escape}')
})

it('stops listening when the page goes', async () => {
  const user = userEvent.setup()
  const { runs, unmount } = open()
  await user.click(talk())
  unmount()
  expect(runs.webSpeech[0]?.cancel).toHaveBeenCalled()
})

it('has no accessibility violations, idle or listening', async () => {
  const user = userEvent.setup()
  const { container, runs } = open({ webSpeech: false, record: true })
  expect(await axe(container)).toHaveNoViolations()
  await user.click(talk())
  report(() => runs.onDevice[0]?.listener.listening())
  report(() => runs.onDevice[0]?.listener.level(0.3))
  report(() => runs.onDevice[0]?.listener.interim('egg'))
  expect(await axe(container)).toHaveNoViolations()
})
