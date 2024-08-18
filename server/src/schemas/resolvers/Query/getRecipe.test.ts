import mongoose from 'mongoose';
import { getRecipe } from './getRecipe';
import { Recipe } from 'models/Recipe';

describe('getRecipe', () => {
  let findByIdMock: any = undefined;
  let populateMock: any = undefined;

  beforeEach(() => {
    populateMock = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Recipe',
      portions: 2,
      ingredients: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Ingredient',
          category: 'Test Category'
        }
      ],
      picture_url: 'http://example.com/pic.jpg',
      edamamId: '12345',
      instructions: 'Test instructions'
    });

    findByIdMock = jest.fn().mockReturnValue({
      populate: populateMock
    });

    Recipe.findById = findByIdMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the recipe with populated ingredients', async () => {
    const _id = new mongoose.Types.ObjectId();
    const result = await getRecipe(null, _id);

    expect(findByIdMock).toHaveBeenCalledWith(_id);
    expect(populateMock).toHaveBeenCalledWith({ path: 'ingredients', populate: 'category' });
    expect(result).toBeInstanceOf(Object);
    expect(result?.name).toBe('Test Recipe');
    expect(result?.ingredients).toBeInstanceOf(Array);
  });
});
