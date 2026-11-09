import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { Button } from 'react-aria-components'
import { useT } from '../../i18n'
import type { VoiceState } from '../../utils/voice/state'
import type { VoiceSetup } from '../../utils/voice/useVoiceCapture'
import {
  browserSetup,
  useVoiceCapture
} from '../../utils/voice/useVoiceCapture'

/** Holding the button at least this long means "talk while held" rather than a tap. */
export const HOLD_MS = 600

const megabytes = (bytes: number): string => (bytes / 1_000_000).toFixed(0)

/** The one line that says what the microphone is doing, for eyes and screen readers. */
const useStatus = (state: VoiceState): string => {
  const t = useT()
  if (state.phase === 'error' && state.error !== null)
    return t(`warRoom.voice.${state.error}`)
  if (state.download !== null)
    return t('warRoom.voice.downloading', {
      loaded: megabytes(state.download.loaded),
      total: megabytes(state.download.total)
    })
  return state.phase === 'idle' || state.phase === 'error'
    ? ''
    : t(`warRoom.voice.${state.phase}`)
}

/** Alt+R starts or stops from anywhere on the page; Escape stops. */
const useShortcut = (toggle: () => void, stop: () => void, active: boolean) => {
  const latest = useRef({ toggle, stop, active })
  useEffect(() => {
    latest.current = { toggle, stop, active }
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.altKey && event.code === 'KeyR') {
        event.preventDefault()
        latest.current.toggle()
      } else if (event.key === 'Escape' && latest.current.active) {
        latest.current.stop()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}

const RING =
  'pointer-events-none absolute inset-0 rounded-full border-4 border-accent transition-transform duration-100 ease-out motion-reduce:transition-none'

/**
 * The War room's giant record button (#207): tap to start and tap to stop, or hold to talk and
 * let go. A real toggle button (aria-pressed) with a constant name; what it is doing is said in
 * a polite live line below, and the words heard so far show under that.
 */
export const VoiceCapture: FC<{
  onHeard: (text: string) => void
  setup?: () => VoiceSetup
}> = ({ onHeard, setup = browserSetup }) => {
  const t = useT()
  const voice = useVoiceCapture(onHeard, setup)
  const status = useStatus(voice.state)
  useShortcut(voice.toggle, voice.stop, voice.active)
  /* a press that started listening: if it is held, letting go stops; if tapped, it stays on */
  const press = useRef<{ startedAt: number } | null>(null)
  const heldStop = useRef(false)
  if (!voice.available) return null
  const { state } = voice
  const level = state.level
  return (
    <section
      aria-label={t('warRoom.talk')}
      className="flex flex-col items-center gap-2 py-2"
    >
      <Button
        aria-pressed={voice.active}
        aria-labelledby="war-room-talk"
        aria-describedby="war-room-talk-help"
        aria-keyshortcuts="Alt+R"
        onPressStart={() => {
          heldStop.current = false
          if (voice.active) {
            press.current = null
            return
          }
          press.current = { startedAt: Date.now() }
          voice.start()
        }}
        onPressEnd={() => {
          const started = press.current
          if (started === null || Date.now() - started.startedAt < HOLD_MS)
            return
          press.current = null
          heldStop.current = true
          voice.stop()
        }}
        onPress={() => {
          if (press.current !== null) {
            press.current = null
            return
          }
          if (heldStop.current) return
          voice.stop()
        }}
        className={`relative flex h-44 w-44 touch-none select-none flex-col items-center justify-center gap-1 rounded-full text-on-primary shadow-raised data-[focus-visible]:focus-ring data-[pressed]:shadow-pressed ${
          voice.active ? 'bg-accent' : 'bg-primary'
        }`}
      >
        {voice.active && (
          <span
            aria-hidden="true"
            data-testid="voice-ring"
            className={
              level === null ? `${RING} motion-safe:animate-ping` : RING
            }
            style={
              level === null
                ? undefined
                : { transform: `scale(${1 + level * 0.3})` }
            }
          />
        )}
        <FontAwesomeIcon
          icon={voice.active ? faStop : faMicrophone}
          aria-hidden="true"
          className="text-5xl"
        />
        <span
          id="war-room-talk"
          className="text-2xl font-bold"
        >
          {t('warRoom.talk')}
        </span>
        <span
          aria-hidden="true"
          className="text-sm font-semibold"
        >
          {t(voice.active ? 'warRoom.talkActive' : 'warRoom.talkIdle')}
        </span>
      </Button>
      {level !== null && (
        <div
          aria-hidden="true"
          data-testid="voice-meter"
          className="h-2 w-44 overflow-hidden rounded-pill bg-highlight shadow-recessed"
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.round(level * 100)}%` }}
          />
        </div>
      )}
      <p
        aria-live="polite"
        className="m-0 min-h-[1.25rem] text-center text-sm font-semibold text-text"
      >
        {status}
      </p>
      {state.interim !== '' && (
        <p className="m-0 text-center text-base italic text-text-secondary">
          {t('warRoom.voice.heard', { text: state.interim })}
        </p>
      )}
      <p
        id="war-room-talk-help"
        className="m-0 max-w-xs text-center text-xs text-text-secondary"
      >
        {[
          t('warRoom.talkHelp'),
          state.engine === null ? '' : t(`warRoom.voice.${state.engine}`),
          voice.firstUseMegabytes > 0
            ? t('warRoom.firstUse', { size: voice.firstUseMegabytes })
            : ''
        ]
          .filter((part) => part !== '')
          .join(' ')}
      </p>
    </section>
  )
}
