import { Category } from '../models/Category'

export class CategoryApi {
  public createCategory = async (name: string) => {
    const category = await Category.create({ name })
    const result = await Category.findById(category._id).select('-__v').orFail()
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
    const found = categories.find(({ name }) => name === categoryName)
    return found ?? (await this.createCategory(categoryName))
  }

  public deleteAllCategories = async () => {
    return await Category.deleteMany({})
  }
}
