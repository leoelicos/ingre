import { User } from 'models';
import { signToken } from 'utils/auth';
import { Auth, RecipeInput } from 'schemas/types';

export const addUser = async (_parent: unknown, input: RecipeInput): Promise<Auth> => {
  try {
    const user = await User.create({ ...input });
    const token = await signToken(user);
    return { token, user };
  } catch (e) {
    throw e;
  }
};
