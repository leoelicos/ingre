import { User } from 'models/User';
import { UserMethods, UserSchema } from 'models/User';
import { signToken } from 'utils/auth';

export const login = async (_: any, { email, password }: { email: string; password: string }) => {
  try {
    const user = await User.findOne<UserSchema & UserMethods>({ email });

    if (!user) {
      throw 'Incorrect credentials';
    }

    const isCorrectPassword = user.isCorrectPassword(password);

    if (!isCorrectPassword) {
      throw 'Incorrect credentials';
    }

    const token = signToken(user);
    const payload = { token, user };
    return payload;
  } catch (e) {
    console.error('[login][error]' + e);
    return null; // for now
  }
};
