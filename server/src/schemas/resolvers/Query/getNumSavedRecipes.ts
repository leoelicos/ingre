import { User } from 'models/User';

export const getNumSavedRecipes = async (_parent: any, _args: any, context: any): Promise<number> => {
  try {
    if (!context.user) throw 'Not logged in!';
    const user = await User.findById(context.user._id);
    if (!user) throw new Error('User not found, please log in');
    return user.numSavedRecipes;
  } catch (error) {
    throw error;
  }
};
