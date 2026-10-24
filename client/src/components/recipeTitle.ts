/** Splits "Shaking beef (bò lúc lắc)" into its title and trailing bracketed local name. */
export const splitTitle = (
  name: string
): { title: string; localName: string | null } => {
  const match = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(name)
  const title = match?.[1]
  const localName = match?.[2]
  return title === undefined || localName === undefined
    ? { title: name.trim(), localName: null }
    : { title, localName: localName.trim() }
}
