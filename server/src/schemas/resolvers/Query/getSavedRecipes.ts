import { User } from 'models';
import mongoose from 'mongoose';

export const getSavedRecipes = async (_parent: any, _args: any, context: { user: { _id: any } }): Promise<Array<mongoose.Types.ObjectId>> => {
  try {
    if (!context.user) throw 'Not logged in!';
    const user = await User.findById(context.user._id).populate({ path: 'savedRecipes' });
    if (!user) throw new Error('User not found, please log in');
    return user.savedRecipes;
  } catch (e) {
    throw e;
  }
};
