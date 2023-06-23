import { useState, useEffect } from 'react'

type UpdateTitleType = (str: string) => void

const useTitle: UpdateTitleType = () => {
  const [title, setTitle] = useState<string>('ingré')

  useEffect(() => {
    document.title = title
  }, [title])

  const updateTitle: UpdateTitleType = (str) => setTitle(str)

  return updateTitle
}
export default useTitle
