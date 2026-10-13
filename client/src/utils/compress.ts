/* aggregate all the ingredients from all the recipes
   aggregateQuantities() returns an array of unique ingredients
   where duplicate ingredients have their quantities added together */

import { plural, singular } from 'pluralize'

export type savedIngredientType = {
  _id: string
  name: string
  quantity: string
  measure: string
  category: { name: string }
  recipe: string
  recipeId: string
}

type aggregatedIngredientType = {
  key: string
  name: string

  quantityMeasures: { quantity: string; measure: string }[]
  category: { name: string }
}

type categoryType = {
  description: string
  category: { name: string }
}

export type compressedCategoryType = {
  category: { name: string }
  items: {
    description: string
    checked: boolean
  }[]
}

export type compressedCategoriesType = compressedCategoryType[]

const clean = (str: string): string => {
  return singular(
    str
      .toLocaleLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/[  ]/g, ' ')
      .trim()
  )
}

const aggregateQuantities = (
  arr: savedIngredientType[]
): aggregatedIngredientType[] =>
  arr.reduce((prev, curr) => {
    let { name, quantity, measure, category } = curr
    name = clean(name)
    const key = name
    quantity = parseFloat(quantity).toString()
    measure = clean(measure)
    category = { ...category, name: clean(category.name) }

    const found = prev.find(
      (r) => r.name === name && r.category.name === category.name
    )
    if (!found) {
      prev.push({
        key,
        name,
        quantityMeasures: [{ quantity, measure }],
        category
      })
      return prev
    }
    const current = found.quantityMeasures.find(
      (qm) => qm.measure.trim().toLocaleLowerCase() === measure
    )
    if (!current) {
      found.quantityMeasures.push({ quantity, measure })
    } else {
      const sum = parseFloat(current.quantity) + parseFloat(quantity)
      current.quantity = sum.toString()
    }
    return prev
  }, emptyAggregates())

function emptyAggregates(): aggregatedIngredientType[] {
  return []
}

const qualifyDescriptions = (arr: aggregatedIngredientType[]): categoryType[] =>
  arr.map((i) => {
    let { name, quantityMeasures, category } = i
    name = name.slice(0, 1).toLocaleUpperCase() + name.slice(1)
    category.name =
      category.name.slice(0, 1).toLocaleUpperCase() + category.name.slice(1)

    const quantityMeasuresString = quantityMeasures
      // sort measures alphabetically, e.g. cups, grams, tablespoons, units
      .sort((a, b) => a.measure.localeCompare(b.measure))
      .map(({ quantity, measure }) => {
        const roundedQuantity = Math.round(parseFloat(quantity) * 100) / 100
        if (roundedQuantity !== 1) measure = plural(measure)
        if (measure === 'unit' && quantityMeasures.length === 1)
          return roundedQuantity
        return roundedQuantity + ' ' + measure
      })
      .join(' + ')

    return { description: `${name} (${quantityMeasuresString})`, category }
  })

const categorize = (arr: categoryType[]): compressedCategoriesType => {
  const byCategory = new Map<string, compressedCategoryType>()
  for (const { description, category } of arr) {
    const entry = byCategory.get(category.name) ?? {
      category: { name: category.name },
      items: []
    }
    entry.items.push({ description, checked: false })
    byCategory.set(category.name, entry)
  }
  return Array.from(byCategory.values())
}

const sortCategoriesAndItems = (
  arr: compressedCategoriesType
): compressedCategoriesType => {
  return arr
    .sort((a, b) => a.category.name.localeCompare(b.category.name))
    .map((category) => ({
      ...category,
      items: category.items.sort((a, b) =>
        a.description.localeCompare(b.description)
      )
    }))
}

const compress = (arr: savedIngredientType[]): compressedCategoriesType => {
  const aggregated = aggregateQuantities(arr)
  const qualified = qualifyDescriptions(aggregated)
  const categorized = categorize(qualified)
  const sorted = sortCategoriesAndItems(categorized)
  return sorted
}

export default compress
