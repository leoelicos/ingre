/* Messages with tags: each locale orders the words around a link or token itself. */
import { act, render, screen } from '@testing-library/react'
import { RichText, richParts, setLocale } from '..'

const link = (text: string) => <a href="/signup">{text}</a>

describe('richParts', () => {
  it('splits text and tags in the message’s own order', () => {
    expect(richParts('No account? <link>Sign up</link>', { link })).toEqual([
      'No account? ',
      link('Sign up')
    ])
    expect(richParts('<link>新規登録</link>はこちら', { link })).toEqual([
      link('新規登録'),
      'はこちら'
    ])
  })

  it('renders self-closing tags with no text', () => {
    const token = () => <code>abc</code>
    expect(richParts('ref <token/> ok', { token })).toEqual([
      'ref ',
      token(),
      ' ok'
    ])
  })

  it('keeps a tag it has no renderer for as its plain text, never as HTML', () => {
    expect(richParts('a <b>bold</b> <img/> z', {})).toEqual([
      'a ',
      'bold',
      ' ',
      ' z'
    ])
    expect(richParts('plain', {})).toEqual(['plain'])
  })
})

describe('<RichText>', () => {
  afterEach(() => act(() => setLocale('en')))

  it('puts the link where each language wants it', () => {
    const { container } = render(
      <p>
        <RichText
          k="auth.noAccount"
          components={{ link }}
        />
      </p>
    )
    expect(container.textContent).toBe('No account? Sign up')
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeTruthy()
    act(() => setLocale('ja'))
    expect(container.textContent).toBe('アカウントをお持ちでない方は新規登録')
    expect(container.querySelector('p')?.lastElementChild?.textContent).toBe(
      '新規登録'
    )
  })

  it('fills values too', () => {
    const { container } = render(
      <RichText
        k="filter.chosen"
        values={{ label: 'Dairy' }}
        components={{}}
      />
    )
    expect(container.textContent).toBe('Dairy: chosen')
  })
})
