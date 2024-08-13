import { User as UserType } from 'schemas/types';
import { User } from 'models';
import { UserMethods, UserSchema } from 'models/User';

export const getUser = async (_: any, __: any, context: any): Promise<UserType> => {
  try {
    if (!context.user) throw 'Not logged in!';
    const user = await User.findById<UserSchema & UserMethods>(context.user._id);
    if (!user) throw new Error('Please log in');
    return user;
  } catch (error) {
    throw error;
  }
};
