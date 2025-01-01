import bcrypt from 'bcrypt'
import {
  CallbackWithoutResultAndOptionalError,
  Document,
  Schema,
  Types,
  model
} from 'mongoose'
import { RecipeSchema } from './Recipe'

export interface UserSchema extends Document {
  _id: Types.ObjectId
  firstName: string
  lastName: string
  email: string
  password: string
  pro: boolean
  savedRecipes: Array<Types.Subdocument & RecipeSchema>
  numSavedRecipes: number // virtual
}

export interface UserMethods {
  isCorrectPassword(password: string): Promise<boolean>
}
export interface UserVirtuals {
  numSavedRecipes: number
}
const userSchema = new Schema<UserSchema, {}, UserMethods, UserVirtuals>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 5 },
    savedRecipes: [{ type: Types.ObjectId, ref: 'Recipe', required: true }],
    pro: { type: Boolean, default: false }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

userSchema.virtual('numSavedRecipes').get(function (this: UserSchema) {
  return this.savedRecipes.length
})

userSchema.pre(
  'save',
  async function (next: CallbackWithoutResultAndOptionalError) {
    if (
      this.isNew
      // || this.isModified('password') // we have not allowed a user to reset their password at this stage
    ) {
      const saltRounds = 10
      this.password = await bcrypt.hash(this.password, saltRounds)
    }
    next()
  }
)

userSchema.method('isCorrectPassword', function (password: string) {
  return bcrypt.compare(password, this.password)
})

export const User = model('User', userSchema)
