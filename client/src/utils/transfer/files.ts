/* #230: reading chosen files in the browser. */

/** The files a file input handed over; none when it handed over nothing. */
export const chosenFiles = (files: FileList | null): File[] =>
  Array.from(files ?? [])

export const readFile = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsText(file)
  })
