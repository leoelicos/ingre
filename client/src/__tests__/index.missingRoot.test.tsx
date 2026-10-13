/* No module mocks: the entry point must refuse to start without #root. */
describe('index without #root', () => {
  it('throws a clear error', () => {
    document.body.innerHTML = ''
    expect(() => {
      jest.isolateModules(() => {
        require('../index')
      })
    }).toThrow('Root element #root was not found')
  })
})
