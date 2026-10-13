const mockRender = jest.fn()
const mockCreateRoot = jest.fn()

jest.mock('react-dom/client', () => ({
  createRoot: (...args: unknown[]) => mockCreateRoot(...args)
}))

jest.mock('../App', () => ({
  Ingre: () => null
}))

describe('index', () => {
  beforeEach(() => {
    mockRender.mockReset()
    mockCreateRoot.mockReset()
    mockCreateRoot.mockImplementation(() => ({ render: mockRender }))
    document.body.innerHTML = '<div id="root"></div>'
  })

  it('mounts the app into #root', () => {
    jest.isolateModules(() => {
      require('../index')
    })
    expect(mockCreateRoot).toHaveBeenCalled()
    expect(mockRender).toHaveBeenCalled()
  })
})
