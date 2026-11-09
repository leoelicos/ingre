import { readFileSync } from 'fs'
import { join } from 'path'

const read = (path: string) => readFileSync(join(__dirname, path), 'utf8')

/* The inline viewport script in index.html (#296), run against a given platform */
const html = read('../../index.html')
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''

const viewportAfter = (platform?: string): string => {
  document.head.innerHTML =
    '<meta name="viewport" content="width=device-width, initial-scale=1">'
  const win = window as unknown as { Capacitor?: unknown }
  win.Capacitor =
    platform === undefined ? undefined : { getPlatform: () => platform }
  new Function(script)()
  delete win.Capacitor
  return document
    .querySelector('meta[name=viewport]')
    ?.getAttribute('content') as string
}

describe('Android status bar (#296)', () => {
  it('index.html ships the viewport without viewport-fit, for web and iOS', () => {
    expect(script).not.toBe('')
    expect(html).toMatch(/content="width=device-width, initial-scale=1"/)
  })

  it('opts only the Android app into viewport-fit=cover, once', () => {
    expect(viewportAfter('android')).toBe(
      'width=device-width, initial-scale=1, viewport-fit=cover'
    )
    const meta = document.querySelector(
      'meta[name=viewport]'
    ) as HTMLMetaElement
    new Function('window', script.replace('window.Capacitor', 'window.C'))({
      C: { getPlatform: () => 'android' }
    })
    expect(meta.content.match(/viewport-fit/g)).toHaveLength(1)
  })

  it.each([undefined, 'web', 'ios'])('leaves the viewport alone on %s', (p) => {
    expect(viewportAfter(p)).toBe('width=device-width, initial-scale=1')
  })

  it('ignores a Capacitor object without getPlatform, and a page without a viewport', () => {
    const win = window as unknown as { Capacitor?: unknown }
    win.Capacitor = {}
    expect(() => new Function(script)()).not.toThrow()
    document.head.innerHTML = ''
    win.Capacitor = { getPlatform: () => 'android' }
    expect(() => new Function(script)()).not.toThrow()
    delete win.Capacitor
  })

  it('pads the page by the top safe-area inset only', () => {
    const css = read('../index.css')
    expect(css).toContain(
      '--safe-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));'
    )
    expect(css).toContain('padding-top: var(--safe-top);')
    expect(css).not.toMatch(/padding-(left|right|bottom): var\(--safe/)
  })
})
