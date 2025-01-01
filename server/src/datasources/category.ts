import { Category } from 'models/Category'

export class CategoryApi {
  public createCategory = async (name: string) => {
    const category = await Category.create({ name })
    const result = await Category.findById(category._id).select('-__v')
    return result
  }

  public getAllCategories = async () => {
    const result = await Category.find().select('-__v')
    return result
  }

  public findOrCreateCategory = async ({
    categoryName
  }: {
    categoryName: string
  }) => {
    const categories = await this.getAllCategories()
    const foundIndex = categories.findIndex(({ name }) => name === categoryName)
    if (foundIndex === -1) {
      const createdCategory = await this.createCategory(categoryName)
      return createdCategory
    }
    return categories[foundIndex]
  }

  public deleteAllCategories = async () => {
    return await Category.deleteMany({})
  }
}
