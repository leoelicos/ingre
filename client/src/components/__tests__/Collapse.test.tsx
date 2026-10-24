import { render, screen } from '@testing-library/react'
import { Chevron, Collapse, collapseClass, MOTION } from '../Collapse'

describe('Collapse', () => {
  it('animates in 0.2 s, and not at all with reduced motion', () => {
    expect(MOTION).toContain('duration-200')
    expect(MOTION).toContain('motion-reduce:duration-0')
    expect(collapseClass(true)).toContain('grid-rows-[1fr]')
    expect(collapseClass(false)).not.toContain('grid-rows-[1fr]')
  })

  it('is hidden from everyone when closed and shown when open', () => {
    const { rerender, container } = render(
      <Collapse
        id="c"
        open={false}
      >
        <button type="button">Inside</button>
      </Collapse>
    )
    expect(screen.queryByRole('button')).toBeNull()
    rerender(
      <Collapse
        id="c"
        open
        className="extra"
      >
        <button type="button">Inside</button>
      </Collapse>
    )
    expect(screen.getByRole('button', { name: 'Inside' })).toBeTruthy()
    expect(container.querySelector('#c')?.className).toContain('extra')
  })

  it('turns the chevron when open', () => {
    const { container, rerender } = render(<Chevron open={false} />)
    expect(container.querySelector('svg')?.getAttribute('class')).not.toContain(
      'rotate-180'
    )
    rerender(<Chevron open />)
    expect(container.querySelector('svg')?.getAttribute('class')).toContain(
      'rotate-180'
    )
  })
})
