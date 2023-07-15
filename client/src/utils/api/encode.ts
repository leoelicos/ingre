import type { SearchParams } from '../../@types/edamam.d.ts'

const encode = ({
  q,
  diet,
  health,
  cuisineType,
  mealType,
  dishType
}: SearchParams): string => {
  /*
   * From the Edamam Docs for Recipe API:
   * Parameter q is required if no other parameter is specified
   * Parameter q is not required if any other parameter is specified
   */

  if (
    q === undefined &&
    diet === undefined &&
    health === undefined &&
    cuisineType === undefined &&
    mealType === undefined &&
    dishType === undefined
  )
    return 'q=yum'

  const qMap = !!q && q.length > 0 ? [`q=${encodeURIComponent(q)}`] : []
  const dietMap =
    diet?.map((v: string) => `diet=${encodeURIComponent(v)}`) || []
  const healthMap =
    health?.map((v: string) => `health=${encodeURIComponent(v)}`) || []
  const mealTypeMap =
    mealType?.map((v: string) => `mealType=${encodeURIComponent(v)}`) || []
  const dishTypeMap =
    dishType?.map((v: string) => `dishType=${encodeURIComponent(v)}`) || []
  const cuisineTypeMap =
    cuisineType?.map((v: string) => `cuisineType=${encodeURIComponent(v)}`) ||
    []

  return [
    ...qMap,
    ...dietMap,
    ...healthMap,
    ...mealTypeMap,
    ...dishTypeMap,
    ...cuisineTypeMap
  ].join('&')
}
export default encode
