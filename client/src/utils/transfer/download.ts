/* #230: offer text as a file download, no server involved. */
export const download = (name: string, type: string, text: string): void => {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
