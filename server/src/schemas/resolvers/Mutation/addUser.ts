import { User } from 'models/User';
import { signToken } from 'utils/auth';
import { Auth, UserInput } from 'schemas/types';

export const addUser = async (
  _parent: unknown,
  {
    input
  }: {
    input: UserInput;
  }
): Promise<Auth> => {
  try {
    const { email, password, firstName, lastName } = input;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const user = await User.create({ email, password, firstName, lastName });

    const token = await signToken(user);
    return { token, user };
  } catch (e) {
    throw e;
  }
};
