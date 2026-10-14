import { useEffect, useMemo, useState } from 'react'
import searchLibrary, {
  getLibraryTags
} from '../../utils/library/recipeLibrary'
import { changeTitle } from '../../utils/changeTitle'
import { usePeople } from '../../utils/storage/people'
import { usePickedIds } from '../../utils/storage/shoppingState'
import { orderTags, toggleTag } from './homeFilters'

export const useHome = () => {
  useEffect(() => {
    changeTitle('Recipes')
  }, [])

  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [people, setPeople] = usePeople()
  const [pickedIds, togglePicked] = usePickedIds()
  const tags = useMemo(() => orderTags(getLibraryTags()), [])
  const recipes = useMemo(
    () => searchLibrary({ q: query, tags: selectedTags }),
    [query, selectedTags]
  )

  return {
    query,
    setQuery,
    tags,
    selectedTags,
    onToggleTag: (tag: string) =>
      setSelectedTags((prev) => toggleTag(prev, tag)),
    people,
    setPeople,
    recipes,
    pick: { pickedIds, onToggle: togglePicked }
  }
}
