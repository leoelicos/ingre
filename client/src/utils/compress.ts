/* aggregate all the ingredients from all the recipes
   aggregateQuantities() returns an array of unique ingredients
   where duplicate ingredients have their quantities added together */

import { plural, singular } from 'pluralize'

type savedIngredientType = {
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

const clean = (str: string): string =>
  singular(
    str
      .toLocaleLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/[  ]/g, ' ')
      .trim()
  )

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

    const foundIdx = prev.findIndex(
      (r) => r.name === name && r.category === category
    )
    if (foundIdx === -1) {
      prev.push({
        key,
        name,
        quantityMeasures: [{ quantity, measure }],
        category
      })
    } else {
      const foundMeasureIdx = prev[foundIdx].quantityMeasures.findIndex(
        (qm) => qm.measure.trim().toLocaleLowerCase() === measure
      )
      if (foundMeasureIdx === -1) {
        prev[foundIdx].quantityMeasures.push({ quantity, measure })
      } else {
        prev[foundIdx].quantityMeasures[foundMeasureIdx].quantity +=
          parseFloat(quantity)
      }
    }
    return prev
  }, [] as aggregatedIngredientType[])

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
  const uniqueCategories: compressedCategoriesType = Array.from(
    new Set(arr.map((i) => i.category.name))
  ).map((i) => ({ category: { name: i }, items: [] }))

  /* iterate through arr to populate each category's empty items array */
  arr.forEach((v) => {
    const { description, category } = v
    const j = uniqueCategories.findIndex(
      (i) => i.category.name === category.name
    )
    uniqueCategories[j].items.push({ description, checked: false })
  })

  return uniqueCategories
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
