import {
  addRecipes,
  library,
  removeImported
} from '../../library/recipeLibrary'
import {
  IMPORTED_KEY,
  loadImported,
  parseImported,
  saveImported
} from '../storage'
import { download } from '../download'
import { chosenFiles } from '../files'

const recipe = {
  id: 'imported-x',
  name: 'X',
  portions: 2,
  ingredients: [{ ingredientId: 'salt', quantity: 1, measure: 'g' }],
  method: ['Mix.']
}

beforeEach(() => localStorage.clear())

describe('imported recipes on this device (#230)', () => {
  it('round trips through localStorage', () => {
    saveImported([recipe])
    expect(loadImported()).toEqual([recipe])
  })

  it('ignores a stored list that does not parse', () => {
    localStorage.setItem(IMPORTED_KEY, '{"a":1}')
    expect(loadImported()).toEqual([])
    localStorage.setItem(IMPORTED_KEY, '[{"id":1}]')
    expect(loadImported()).toEqual([])
    expect(parseImported('nope')).toBeNull()
  })

  it('addRecipes adds only new recipes and counts them', () => {
    const before = library.length
    expect(addRecipes([recipe])).toBe(1)
    expect(addRecipes([recipe])).toBe(0)
    expect(library).toHaveLength(before + 1)
    expect(loadImported()).toEqual([recipe])
  })

  it('removeImported never removes a built-in recipe or an unknown id', () => {
    const before = library.length
    removeImported('dahl')
    removeImported('imported-nothing')
    expect(library).toHaveLength(before)
    removeImported('imported-x')
    expect(library).toHaveLength(before - 1)
    expect(loadImported()).toEqual([])
  })
})

describe('download (#230)', () => {
  it('offers the text as a named file and frees the URL', () => {
    const calls: string[] = []
    URL.createObjectURL = () => 'blob:one'
    URL.revokeObjectURL = (url: string) => {
      calls.push(url)
    }
    const names: string[] = []
    HTMLAnchorElement.prototype.click = function click() {
      names.push(`${this.download} ${this.href}`)
    }
    download('a.txt', 'text/plain', 'hi')
    expect(names).toEqual(['a.txt blob:one'])
    expect(calls).toEqual(['blob:one'])
  })
})

describe('files (#230)', () => {
  it('chosenFiles is empty when nothing was chosen', () =>
    expect(chosenFiles(null)).toEqual([]))
})
