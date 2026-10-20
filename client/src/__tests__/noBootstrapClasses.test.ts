import { readdirSync, readFileSync, statSync } from 'fs'
import { join, relative } from 'path'
import ts from 'typescript'

/** Class names that only make sense with Bootstrap; Tailwind look-alikes (col-start-1, row-span-2) stay allowed. */
const BOOTSTRAP =
  /^(btn(-[a-z-]+)?|container(-fluid)?|row|col(-(sm|md|lg|xl|xxl))?(-(\d{1,2}|auto))?|form-(control|label|group|check(-[a-z-]+)?|select|text|floating|range)|input-group(-[a-z-]+)?|d-(sm-|md-|lg-|xl-)?(none|inline|inline-block|block|flex|inline-flex|grid|table)|(justify-content|align-items|align-self|align-content)-[a-z]+|card-(body|title|text|header|footer|img(-[a-z]+)?)|navbar(-[a-z-]+)?|nav-(link|item|tabs|pills)|list-group(-[a-z-]+)?|alert-[a-z]+|text-muted|fw-[a-z]+|[mp][se]-\d|img-fluid|[wh]-100|visually-hidden(-focusable)?|modal(-[a-z]+)?|dropdown(-[a-z]+)?|spinner-(border|grow)|text-(start|end)|float-(start|end))$/

const SRC = join(__dirname, '..')

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory())
      return name === '__tests__' || name === 'data' ? [] : filesUnder(path)
    return [path]
  })

const isSource = (path: string) =>
  /\.(ts|tsx)$/.test(path) && !/\.(test|d)\.tsx?$/.test(path)

const CLASS_CALLS = new Set([
  'add',
  'remove',
  'toggle',
  'contains',
  'closest',
  'querySelector',
  'querySelectorAll'
])

const nameOf = (node: ts.Node): string => {
  if (ts.isJsxAttribute(node)) return node.name.getText()
  if (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node))
    return node.name?.getText() ?? ''
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression)
  )
    return node.expression.name.text
  return ''
}

/** Is this node a place that holds class names? */
const holdsClasses = (node: ts.Node): boolean => {
  const name = nameOf(node)
  if (ts.isJsxAttribute(node)) return name === 'className'
  if (ts.isCallExpression(node)) return CLASS_CALLS.has(name)
  return /class/i.test(name)
}

const stringsIn = (node: ts.Node): string[] => {
  const own =
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node)
      ? [node.text]
      : []
  return [...own, ...node.getChildren().flatMap(stringsIn)]
}

/** Every class-name token written in a TS/TSX source. */
export const classTokensInSource = (path: string, text: string): string[] => {
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true)
  const visit = (node: ts.Node): string[] =>
    holdsClasses(node) ? stringsIn(node) : node.getChildren(file).flatMap(visit)
  return visit(file)
    .flatMap((s) => s.split(/[\s.]+/))
    .filter(Boolean)
}

/** Every class selector in a stylesheet. */
export const classTokensInCss = (text: string): string[] =>
  Array.from(
    text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-zA-Z_][\w-]*)/g),
    (m) => m[1] ?? ''
  )

const tokensOf = (path: string): string[] => {
  const text = readFileSync(path, 'utf8')
  if (path.endsWith('.css')) return classTokensInCss(text)
  return isSource(path) ? classTokensInSource(path, text) : []
}

describe('no Bootstrap class names (#170)', () => {
  it('finds none in client/src', () => {
    const found = filesUnder(SRC).flatMap((path) =>
      tokensOf(path)
        .filter((t) => BOOTSTRAP.test(t))
        .map((t) => `${relative(SRC, path)}: ${t}`)
    )
    expect(found).toEqual([])
  })

  it('would catch them coming back', () => {
    const tsx = `const a = <a className="btn btn-primary">x</a>
const b = <div className={\`row \${x} col-md-6\`} role="row" />
const rowClass = 'd-flex'
el.closest('.form-control')`
    expect(
      classTokensInSource('x.tsx', tsx).filter((t) => BOOTSTRAP.test(t))
    ).toEqual([
      'btn',
      'btn-primary',
      'row',
      'col-md-6',
      'd-flex',
      'form-control'
    ])
    expect(
      classTokensInCss('/* .row */ .list-group, a.btn:hover {}').filter((t) =>
        BOOTSTRAP.test(t)
      )
    ).toEqual(['list-group', 'btn'])
  })

  it('allows the Tailwind grid and token classes', () => {
    expect(
      ['col-start-1', 'row-start-1', 'mb-2', 'bg-primary', 'rounded-pill'].some(
        (t) => BOOTSTRAP.test(t)
      )
    ).toBe(false)
  })
})
