import { changeTitle } from '../changeTitle'

describe('changeTitle', () => {
  it('sets document.title', () => {
    changeTitle('Test Title')
    expect(document.title).toBe('Test Title')
  })
})
