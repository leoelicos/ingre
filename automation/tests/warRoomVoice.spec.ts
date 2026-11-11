import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { urls } from './env'

/*
 * #207: the War room's giant record button. Browsers here have no real speech service, so the
 * Web Speech tests drive a stand-in recogniser, and the on-device tests use Chromium's fake
 * microphone with the model download answered locally (no request leaves localhost).
 */

/* Chromium's fake microphone (a tone), already allowed, for every test in this file */
test.use({
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream'
    ]
  },
  permissions: ['microphone']
})

/*
 * The giant record button is gone in the utility-belt designs (the mic now sits in the search
 * field, same engines). These specs drive the old button and are parked on the preview branch
 * until the chosen design is finalised in #308.
 */
test.skip(
  true,
  'War room record button replaced by the in-field mic (preview designs)'
)

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const talk = (page: Page) =>
  page.getByRole('button', { name: 'Talk', exact: true })
const voiceStatus = (page: Page) =>
  page
    .getByRole('region', { name: 'Talk', exact: true })
    .locator('[aria-live="polite"]')
const ack = (page: Page) => page.getByRole('status')

/** A stand-in for the browser's recogniser; the test speaks through window.say(). */
const fakeWebSpeech = () => {
  type Handler = ((event: unknown) => void) | null
  class Recogniser {
    lang = ''
    continuous = false
    interimResults = false
    onresult: Handler = null
    onstart: (() => void) | null = null
    onend: (() => void) | null = null
    onerror: Handler = null
    start() {
      Reflect.set(window, 'recogniser', this)
      setTimeout(() => this.onstart?.(), 0)
    }
    stop() {
      setTimeout(() => this.onend?.(), 0)
    }
    abort() {
      this.stop()
    }
  }
  /* Chromium has both names now; the app takes the standard one first */
  Reflect.set(window, 'SpeechRecognition', Recogniser)
  Reflect.set(window, 'webkitSpeechRecognition', Recogniser)
  Reflect.set(window, 'say', (transcript: string, isFinal: boolean) => {
    const recogniser: Recogniser = Reflect.get(window, 'recogniser')
    recogniser.onresult?.({
      resultIndex: 0,
      results: [{ isFinal, 0: { transcript } }]
    })
  })
}

const say = (page: Page, text: string, isFinal = true) =>
  page.evaluate(
    ([words, final]) =>
      Reflect.apply(Reflect.get(window, 'say'), window, [words, final]),
    [text, isFinal] as const
  )

test.describe('war room voice, browser recogniser (#207)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(fakeWebSpeech)
    await page.goto('/war-room')
  })

  test('a giant toggle: tap, talk, see the words, they land on the list', async ({
    page
  }) => {
    const button = talk(page)
    const box = await button.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(160)
    expect(box?.height).toBeGreaterThanOrEqual(160)
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect(voiceStatus(page)).toHaveText('Listening')
    await say(page, 'two carr', false)
    await expect(page.getByText('Hearing: two carr')).toBeVisible()
    await say(page, 'Two carrots and garlic.')
    await expect(ack(page)).toHaveText('Carrot, Garlic added')
    await expect(
      page.getByRole('button', { name: 'Add carrot ×2 again', exact: true })
    ).toBeVisible()
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect(
      page.getByRole('combobox', { name: 'Add an item', exact: true })
    ).toBeVisible()
  })

  test('keyboard only: Alt+R from the text field starts, Escape stops', async ({
    page
  }) => {
    await page.keyboard.press('Alt+KeyR')
    await expect(talk(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(voiceStatus(page)).toHaveText('Listening')
    await page.keyboard.press('Escape')
    await expect(talk(page)).toHaveAttribute('aria-pressed', 'false')
    await talk(page).focus()
    await page.keyboard.press('Space')
    await expect(talk(page)).toHaveAttribute('aria-pressed', 'true')
  })

  for (const scheme of ['light', 'dark'] as const)
    test(`no accessibility violations, idle and listening (${scheme})`, async ({
      page
    }) => {
      await page.emulateMedia({ colorScheme: scheme })
      const scan = async () =>
        (await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations
      expect(await scan()).toEqual([])
      await talk(page).click()
      await say(page, 'egg', false)
      await expect(page.getByText('Hearing: egg')).toBeVisible()
      expect(await scan()).toEqual([])
    })
})

test.describe('war room voice, on-device model (#207)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Reflect.deleteProperty(window, 'webkitSpeechRecognition')
      Reflect.deleteProperty(window, 'SpeechRecognition')
    })
    /* the model host is answered here, so the test stays on localhost */
    await page.route(/huggingface\.co|hf\.co/, (route) =>
      route.fulfill({ status: 503, body: 'offline' })
    )
    await page.goto(`${urls.preview}/war-room`)
  })

  test('records with a level meter, says the download size, and explains a failed model', async ({
    page
  }) => {
    test.setTimeout(30_000)
    await expect(talk(page)).toHaveAccessibleDescription(
      /Recognised on this device\. No audio leaves it\. The first time, this downloads a 34 MB speech model\./
    )
    await talk(page).click()
    await expect(voiceStatus(page)).toHaveText('Listening')
    await expect(page.getByTestId('voice-meter')).toBeVisible()
    await talk(page).click()
    await expect(voiceStatus(page)).toHaveText(
      'Voice stopped working. Try again, or type instead.',
      { timeout: 20_000 }
    )
    await expect(talk(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('a blocked microphone says so', async ({ page }) => {
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(new DOMException('blocked', 'NotAllowedError'))
    })
    await talk(page).click()
    await expect(voiceStatus(page)).toHaveText(
      'The microphone is blocked. Allow it in your browser or phone settings, or type instead.'
    )
  })
})
