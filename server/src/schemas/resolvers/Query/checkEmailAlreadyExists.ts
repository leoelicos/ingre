import { User } from 'models/User';

export const checkEmailAlreadyExists = async (_parent: any, email: string): Promise<boolean> => {
  try {
    const user = await User.findOne({ email });
    if (user) return true;
    else return false;
  } catch (error) {
    throw error;
  }
};
