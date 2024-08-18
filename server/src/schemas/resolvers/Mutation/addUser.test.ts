import { User } from 'models/User';
import { signToken } from 'utils/auth';
import { addUser } from 'schemas/resolvers/Mutation/addUser';
import { Auth, UserInput } from 'schemas/types';

// Mock the User and signToken functions
jest.mock('models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('utils/auth', () => ({
  signToken: jest.fn()
}));

describe('addUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  const input: UserInput = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  };

  const user = {
    _id: '12345',
    ...input
  };

  it('should create a new user and return the token and user', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
    (User.create as jest.Mock).mockResolvedValue(user);
    (signToken as jest.Mock).mockResolvedValue('mocked_token');

    const result: Auth = await addUser(undefined, { input });

    expect(User.findOne).toHaveBeenCalledWith({ email: input.email });
    expect(User.create).toHaveBeenCalledWith(input);
    expect(signToken).toHaveBeenCalledWith(user);
    expect(result).toEqual({ token: 'mocked_token', user });
  });

  it('should throw an error if the email is already in use', async () => {
    const existingUser = { ...input, _id: 'existing_id' };
    (User.findOne as jest.Mock).mockResolvedValue(existingUser); // User exists
    (User.create as jest.Mock).mockResolvedValue(user); // Ensure it won't be called

    await expect(addUser(undefined, { input })).rejects.toThrow('Email already in use');

    expect(User.findOne).toHaveBeenCalledWith({ email: input.email });
    expect(User.create).not.toHaveBeenCalled(); // Ensure create is not called
    expect(signToken).not.toHaveBeenCalled(); // Ensure signToken is not called
  });

  it('should throw an error if any other error occurs', async () => {
    const error = new Error('Unexpected error');
    (User.findOne as jest.Mock).mockRejectedValue(error);
    (User.create as jest.Mock).mockResolvedValue(user); // Ensure it won't be called
    (signToken as jest.Mock).mockResolvedValue('mocked_token'); // Ensure it won't be called

    await expect(addUser(undefined, { input })).rejects.toThrow('Unexpected error');

    expect(User.findOne).toHaveBeenCalledWith({ email: input.email });
    expect(User.create).not.toHaveBeenCalled(); // Ensure create is not called
    expect(signToken).not.toHaveBeenCalled(); // Ensure signToken is not called
  });
});
