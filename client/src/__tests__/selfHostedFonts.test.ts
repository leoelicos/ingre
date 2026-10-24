import { readFileSync } from 'fs'
import { join } from 'path'

const read = (path: string) => readFileSync(join(__dirname, path), 'utf8')

const GOOGLE_FONTS = /fonts\.(googleapis|gstatic)\.com/

describe('self-hosted fonts (#176)', () => {
  it.each(['../index.css', '../index.tsx', '../../index.html'])(
    '%s makes no Google Fonts request',
    (path) => {
      expect(read(path)).not.toMatch(GOOGLE_FONTS)
    }
  )

  it('loads Poppins 400 and Open Sans (width axis) from @fontsource', () => {
    const entry = read('../index.tsx')
    expect(entry).toContain("import '@fontsource/poppins/400.css'")
    expect(entry).toContain("import '@fontsource-variable/open-sans/wdth.css'")
  })
})
