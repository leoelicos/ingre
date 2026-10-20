import '@testing-library/jest-dom'
import { act, screen } from '@testing-library/react'

/* No module mocks: the real entry point mounts the real app into #root. */
describe('index', () => {
  it('mounts the app into #root', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    window.history.pushState({}, '', '/login')
    await act(async () => {
      jest.isolateModules(() => {
        require('../index')
      })
    })
    expect(
      await screen.findByRole('heading', { name: /log in/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeVisible()
  })
})
