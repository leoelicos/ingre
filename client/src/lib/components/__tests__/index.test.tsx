import * as components from '../index'
import { Button } from '../Button/Button'
import { Link } from '../Link/Link'
import { Header } from '../Header/Header'

describe('lib/components barrel', () => {
  it('re-exports the real components', () => {
    expect(components.Button).toBe(Button)
    expect(components.Link).toBe(Link)
    expect(components.Header).toBe(Header)
  })
})
