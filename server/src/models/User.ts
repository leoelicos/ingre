import bcrypt from 'bcrypt';

import mongoose from 'mongoose';
import type { Document } from 'mongoose';

export interface UserSchema extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pro: boolean;
  savedRecipes: Array<mongoose.Types.ObjectId>;
  numSavedRecipes: number; // virtual
  allCategoryNames: Array<string>;
}

export interface UserMethods {
  isCorrectPassword(password: string): Promise<boolean>;
}
export interface UserVirtuals {
  numSavedRecipes: number;
  allCategoryNames: Promise<Array<string>>;
}
const userSchema = new mongoose.Schema<UserSchema, {}, UserMethods, UserVirtuals>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 5 },
    savedRecipes: [{ type: mongoose.Types.ObjectId, ref: 'Recipe', required: true }],
    pro: { type: Boolean, default: false }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('numSavedRecipes').get(function (this: UserSchema) {
  return this.savedRecipes.length;
});

userSchema.virtual('allCategoryNames').get(async function (this: UserSchema) {
  await this.populate({ path: 'savedRecipes', populate: 'ingredients.category' });
  const categoryNames: Set<string> = new Set();

  this.savedRecipes.forEach((savedRecipe: any) => {
    savedRecipe.ingredients.forEach((ingredient: any) => {
      categoryNames.add(ingredient.category.name);
    });
  });

  return Array.from(categoryNames);
});

userSchema.pre('save', async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.method('isCorrectPassword', function (password: string) {
  return bcrypt.compare(password, this.password);
});

export const User = mongoose.model('User', userSchema);
