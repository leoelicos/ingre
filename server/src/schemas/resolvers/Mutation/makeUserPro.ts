import { User as UserType } from 'schemas/types';
import { User } from 'models/User';

// makes a user pro
export const makeUserPro = async (_parent: any, _args: any, context: any): Promise<UserType> => {
  try {
    if (!context.user) throw 'Not logged in!';
    const id = context.user._id;
    const update = { $set: { pro: true } };
    const options = { new: true };
    const user = await User.findByIdAndUpdate(id, update, options).select('pro');
    if (!user) throw new Error('no user found ');
    return user;
  } catch (error) {
    throw error;
  }
};
