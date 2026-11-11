import { captureSpoken, typedFromSpoken } from '../spoken'

/* #207: what recognisers write, as measured with Moonshine tiny and Whisper (docs/VOICE.md). */

const found = (text: string) =>
  captureSpoken(text).map(({ quantity, item }) => [quantity, item?.id ?? null])

describe('typedFromSpoken', () => {
  it('turns full stops into separators and spoken amounts into digits', () => {
    expect(typedFromSpoken('Two carrots, onion and garlic.')).toBe(
      '2 carrots, onion and garlic'
    )
    expect(typedFromSpoken('Half a dozen eggs. A dozen eggs')).toBe(
      '6 eggs, 12 eggs'
    )
    expect(typedFromSpoken('a couple of lemons')).toBe('2 lemons')
    expect(typedFromSpoken('Plain flower,')).toBe('Plain flour')
    expect(typedFromSpoken('卵、牛乳。')).toBe('卵, 牛乳')
    expect(typedFromSpoken('one')).toBe('one')
  })
})

describe('captureSpoken', () => {
  it('finds what was said, with the spoken amount', () => {
    expect(found('Two carrots, onion and garlic.')).toEqual([
      [2, 'carrot'],
      [1, 'onion'],
      [1, 'garlic']
    ])
    expect(found('Half a dozen eggs.')).toEqual([[6, 'egg']])
    expect(found('Plain flower.')).toEqual([[1, 'plain-flour']])
  })

  it('lets the last words name the ingredient when the whole phrase does not', () => {
    expect(found('Three tins of chickpeas.')).toEqual([[3, 'chickpeas']])
    expect(found('Zzzz qqqq chickpeas.')).toEqual([[1, 'chickpeas']])
  })

  it('still says when nothing fits', () => {
    expect(captureSpoken('zzzz qqqq')).toEqual([
      { quantity: 1, term: 'zzzz qqqq', item: null }
    ])
  })
})
