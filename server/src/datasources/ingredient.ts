import { Ingredient, IngredientSchema } from 'models/Ingredient'
import { Types } from 'mongoose'

export type CreatedIngredient = IngredientSchema &
  Required<{
    _id: Types.ObjectId
  }>
export class IngredientApi {
  public createIngredient = async ({
    name,
    quantity,
    measure,
    category
  }: {
    name: string
    quantity: number
    measure: string
    category: Types.ObjectId
  }): Promise<CreatedIngredient | null> => {
    try {
      const ingredient = await Ingredient.create({
        name,
        quantity,
        measure,
        category
      })
      return await Ingredient.findById(ingredient._id)
        .select('-__v')
        .populate({ path: 'category' })
    } catch (error) {
      throw new Error('could not create ingredient')
    }
  }

  public deleteIngredient = async ({ _id }: { _id: Types.ObjectId }) => {
    return await Ingredient.findByIdAndDelete(_id).select('-__v')
  }

  public getAllIngredients = async () => {
    return await Ingredient.find().select('-__v')
  }

  public deleteAllIngredients = async () => {
    return await Ingredient.deleteMany()
  }
}
