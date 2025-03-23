import { User, UserMethods, UserSchema } from 'models/User'
import { Types } from 'mongoose'
import { UserInput } from 'schemas/types'

export class UserApi {
  public async findOneUserById({ id }: { id: Types.ObjectId }) {
    const user = await User.findById<UserSchema & UserMethods>(id)
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
    if (user) {
      return user.toObject({ virtuals: true })
    }
  }
  public async getUserSavedRecipes({ id }: { id: Types.ObjectId }) {
    const user = await User.findById<UserSchema & UserMethods>(id)
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
    if (user) {
      return user.savedRecipes
    }
  }
  public async findOneUser({ email }: { email: string }) {
    const user = await User.findOne<UserSchema & UserMethods>({ email })
      .select('-__v')
      .populate({
        path: 'savedRecipes',
        populate: {
          path: 'ingredients',
          populate: {
            path: 'category'
          }
        }
      })
    if (user) {
      return user.toObject({ virtuals: true })
    }
  }

  public async addRecipeToUser({
    userId,
    recipeId
  }: {
    userId: Types.ObjectId
    recipeId: Types.ObjectId
  }) {
    return await User.findByIdAndUpdate<UserSchema & UserMethods>(
      userId,
      { $push: { savedRecipes: recipeId } },
      { new: true }
    ).select('-__v')
  }

  public async removeRecipeFromUser({
    userId,
    recipeId
  }: {
    userId: Types.ObjectId
    recipeId: Types.ObjectId
  }) {
    return await User.findByIdAndUpdate<UserSchema & UserMethods>(
      userId,
      { $pull: { savedRecipes: recipeId } },
      { new: true }
    ).select('-__v')
  }

  public async createUser({ email, password, firstName, lastName }: UserInput) {
    try {
      const user = await User.create({ email, password, firstName, lastName })
      const foundUser = await User.findById(user._id)
        .select('-__v')
        .populate({
          path: 'savedRecipes',
          populate: {
            path: 'ingredients',
            populate: {
              path: 'category'
            }
          }
        })
      if (foundUser) {
        return foundUser.toObject<
          UserSchema & Required<{ _id: Types.ObjectId }>
        >({ virtuals: true })
      }
    } catch (error) {
      throw error
    }
  }

  public async deleteAllUsers() {
    return await User.deleteMany()
  }

  public async getAllUsers() {
    return await User.find().select('-__v')
  }

  public async checkUserPassword({
    email,
    password
  }: {
    email: string
    password: string
  }) {
    const user = await User.findOne<UserSchema & UserMethods>({ email })
    if (!user) return null
    const result = await user.isCorrectPassword(password)
    if (result) return user
    else return null
  }

  public async makeUserPro({ _id }: { _id: Types.ObjectId }) {
    try {
      const user = await User.findByIdAndUpdate(
        _id,
        { $set: { pro: true } },
        { new: true }
      ).select('-__v')
      if (!user) throw new Error('User not found')
      return user.toObject({ virtuals: true })
    } catch (error) {
      throw error
    }
  }
}
