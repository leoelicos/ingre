/*
 * Messages with markup in them: "No account? <link>Sign up</link>", "<token/>".
 * The tags sit inside the message, so each locale orders the words and the link itself
 * ("アカウントをお持ちでない方は<link>新規登録</link>"). Only the tags the caller renders
 * become elements; any other tag is kept as its plain text, and nothing is parsed as HTML.
 */
import { Fragment } from 'react'
import type { FC, ReactNode } from 'react'
import type { Values } from './i18n'
import { useT } from './useT'

/** How each tag renders: a paired tag gets its inner text, a self-closing one gets "". */
export type Renderers = Readonly<
  Record<string, (children: string) => ReactNode>
>

/** A paired tag with its text, <link>…</link>, or a self-closing one, <token/>. */
const TAG = /<([a-z]+)(?:>(.*?)<\/\1>|\/>)/g

/** A message's text and tags, in its own order; a tag with no renderer stays as its text. */
export const richParts = (
  message: string,
  renderers: Renderers
): ReactNode[] => {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of message.matchAll(TAG)) {
    const [whole, name, inner] = match
    const render = renderers[String(name)]
    parts.push(message.slice(last, match.index))
    parts.push(render === undefined ? inner ?? '' : render(inner ?? ''))
    last = match.index + whole.length
  }
  parts.push(message.slice(last))
  return parts.filter((part) => part !== '')
}

/** A translated message with its tags rendered: <RichText k="auth.noAccount" … />. */
export const RichText: FC<{
  k: string
  values?: Values
  components: Renderers
}> = ({ k, values = {}, components }) => {
  const t = useT()
  return (
    <>
      {richParts(t(k, values), components).map((part, i) => (
        <Fragment key={i}>{part}</Fragment>
      ))}
    </>
  )
}
