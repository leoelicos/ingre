import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import library from '../data/recipes.json'

/* Every catalogue recipe needs a 120×120 picture in the style of #291 (#103) */
const DIR = join(__dirname, '../../public/recipes')
const ids = library.recipes.map((recipe) => recipe.id)

const rootTag = (svg: string) => svg.match(/<svg\b[^>]*>/)?.[0] ?? ''
const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1]

describe('recipe pictures (#103)', () => {
  it('reads a non-empty recipe list with unique ids', () => {
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has an SVG in client/public/recipes/ for every recipe', () => {
    const missing = ids.filter((id) => !existsSync(join(DIR, `${id}.svg`)))
    expect(missing).toEqual([])
  })

  it.each(ids.filter((id) => existsSync(join(DIR, `${id}.svg`))))(
    '%s.svg is 120×120',
    (id) => {
      const tag = rootTag(readFileSync(join(DIR, `${id}.svg`), 'utf8'))
      expect(tag).not.toBe('')
      expect(
        attr(tag, 'viewBox')
          ?.trim()
          .split(/[\s,]+/)
      ).toEqual(['0', '0', '120', '120'])
      expect(attr(tag, 'width') ?? '120').toBe('120')
      expect(attr(tag, 'height') ?? '120').toBe('120')
    }
  )
})
