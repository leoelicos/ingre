import mongoose, { Types } from 'mongoose'
import { UserInput } from 'schemas/types'
import { CategoryApi } from './category'
import { IngredientApi } from './ingredient'
import { RecipeApi } from './recipe'
import { UserApi } from './user'
import { User } from 'models/User'

const categoryApi = new CategoryApi()
const ingredientApi = new IngredientApi()
const recipeApi = new RecipeApi()
const userApi = new UserApi()
jest.setTimeout(60000)

const mockInput: UserInput = {
  email: 'email@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
}

describe('userApi', () => {
  beforeEach(async (done) => {
    mongoose.set('strictQuery', false)
    await mongoose.connect('mongodb://127.0.0.1:27017/test_ingre_user')
    await categoryApi.deleteAllCategories()
    await ingredientApi.deleteAllIngredients()
    await recipeApi.deleteAllRecipes()
    await userApi.deleteAllUsers()
    jest.resetAllMocks()
    jest.clearAllMocks()
    done()
  })
  afterEach(async (done) => {
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    done()
  })
  it('createUser returns created user', async () => {
    const user = await userApi.createUser(mockInput)
    if (!user) return

    expect(user).toMatchObject({
      email: mockInput.email,
      firstName: mockInput.firstName,
      lastName: mockInput.lastName,
      numSavedRecipes: 0,
      pro: false,
      savedRecipes: []
    })
    // hides password
    expect(user.password).not.toBe(mockInput.password)
    expect(user._id).toBeInstanceOf(Types.ObjectId)
  })
  it('createUser throws error if findById api fails', async () => {
    const findByIdSpy = jest
      .spyOn(User, 'findById')
      .mockImplementationOnce(() => {
        throw new Error('mocked find error')
      })

    await expect(userApi.createUser(mockInput)).rejects.toThrowError(
      'mocked find error'
    )

    findByIdSpy.mockReset()
    findByIdSpy.mockRestore()
  })
  it("addRecipeToUser saves recipes, addRecipeToUser removes recipes, and the following API's also return saved recipes: getUserSavedRecipes, findOneUserById, findOneUser", async () => {
    // create a mock user
    const user = await userApi.createUser(mockInput)
    if (!user) return
    const { id: userId } = user

    // create a mock recipe
    const mockRecipe = {
      name: 'Test Recipe',
      portions: 4,
      picture_url: 'http://example.com/image.jpg',
      edamamId: 'some-edamam-id',
      instructions: 'Test instructions'
    }

    const category = await categoryApi.createCategory('Meat')
    if (!category) return
    const chicken = await ingredientApi.createIngredient({
      name: 'Chicken',
      quantity: 1,
      measure: 'unit',
      category: category._id
    })
    if (!chicken) return
    const broccoli = await ingredientApi.createIngredient({
      name: 'Broccoli',
      quantity: 1,
      measure: 'unit',
      category: category._id
    })
    if (!broccoli) return
    const recipe = await recipeApi.createRecipe({
      name: mockRecipe.name,
      portions: mockRecipe.portions,
      ingredients: [chicken._id, broccoli._id],
      picture_url: mockRecipe.picture_url,
      edamamId: mockRecipe.edamamId,
      instructions: mockRecipe.instructions
    })
    if (!recipe) return

    // add mock recipe to mock user
    await userApi.addRecipeToUser({ userId, recipeId: recipe._id })

    const userSavedRecipes = await userApi.getUserSavedRecipes({ id: userId })
    const expectedObject = [
      {
        edamamId: 'some-edamam-id',
        ingredients: [
          {
            category: { name: 'Meat' },
            measure: 'unit',
            name: 'Chicken',
            quantity: 1
          },
          {
            category: { name: 'Meat' },
            measure: 'unit',
            name: 'Broccoli',
            quantity: 1
          }
        ],
        instructions: 'Test instructions',
        name: 'Test Recipe',
        picture_url: 'http://example.com/image.jpg',
        portions: 4
      }
    ]
    expect(userSavedRecipes).toMatchObject(expectedObject)

    const foundUserById = await userApi.findOneUserById({ id: userId })
    if (!foundUserById) return
    expect(foundUserById.savedRecipes).toMatchObject(expectedObject)

    let foundOneUser = await userApi.findOneUser({ email: mockInput.email })
    if (!foundOneUser) return
    expect(foundOneUser.savedRecipes).toMatchObject(expectedObject)

    await userApi.removeRecipeFromUser({ recipeId: recipe._id, userId: userId })

    foundOneUser = await userApi.findOneUser({ email: mockInput.email })
    if (!foundOneUser) return
    expect(foundOneUser.savedRecipes).toMatchObject([])
  })

  it('findOneUser return one user', async () => {
    await userApi.createUser(mockInput)
    const result = await userApi.findOneUser({ email: mockInput.email })
    if (!result) return
    expect(result.firstName).toEqual(mockInput.firstName)
  })
  it('findOneUserById return one user', async () => {
    const user = await userApi.createUser(mockInput)
    if (!user) return
    const result = await userApi.findOneUserById({
      id: user._id
    })
    if (!result) return
    expect(result.email).toEqual(mockInput.email)
    expect(result.firstName).toEqual(mockInput.firstName)
    expect(result.lastName).toEqual(mockInput.lastName)
  })
  it('findOneUserById throws error if api failed', async () => {
    const user = await userApi.createUser(mockInput)
    if (!user) return

    const findByIdSpy = jest
      .spyOn(User, 'findById')
      .mockImplementationOnce(() => {
        throw new Error('mocked find error')
      })

    await expect(
      userApi.findOneUserById({
        id: user._id
      })
    ).rejects.toThrowError('mocked find error')

    findByIdSpy.mockReset()
    findByIdSpy.mockRestore()
  })

  it('getAllUsers gets all users', async () => {
    await userApi.createUser(mockInput)
    await userApi.createUser({ ...mockInput, email: 'email1@example.com' })
    await userApi.createUser({ ...mockInput, email: 'email2@example.com' })
    await userApi.createUser({ ...mockInput, email: 'email3@example.com' })
    await userApi.createUser({ ...mockInput, email: 'email4@example.com' })
    const numUsers = await userApi.getAllUsers()
    expect(numUsers.length).toBe(5)
  })

  it('deleteAllUsers deletes all users', async () => {
    await userApi.createUser(mockInput)
    await userApi.createUser({ ...mockInput, email: 'email1@example.com' })
    await userApi.createUser({ ...mockInput, email: 'email2@example.com' })
    await userApi.createUser({ ...mockInput, email: 'email3@example.com' })
    await userApi.createUser({ ...mockInput, email: 'email4@example.com' })
    await userApi.deleteAllUsers()
    const numUsers = await userApi.getAllUsers()
    expect(numUsers.length).toBe(0)
  })

  it('checkUserPassword validates correct password', async () => {
    const createdUser = await userApi.createUser(mockInput)
    if (!createdUser) return
    const validCheck = await userApi.checkUserPassword({
      email: mockInput.email,
      password: mockInput.password
    })
    expect(validCheck).toMatchObject(createdUser)
  })
  it('checkUserPassword invalidates incorrect password', async () => {
    await userApi.createUser(mockInput)
    const checkedUser = await userApi.checkUserPassword({
      email: mockInput.email,
      password: 'password124'
    })
    expect(checkedUser).toBeNull()
  })
  it('checkUserPassword throws if no user is found', async () => {
    await userApi.createUser(mockInput)
    try {
      await userApi.checkUserPassword({
        email: 'doesnotexist@example.com',
        password: mockInput.password
      })
    } catch (error) {
      expect(error).toBe('no user found')
    }
  })

  it('makeUserPro makes a user pro', async () => {
    const user = await userApi.createUser(mockInput)
    if (!user) return
    expect(user.pro).toBe(false)
    const newUser = await userApi.makeUserPro({ _id: user._id })
    expect(newUser.pro).toBe(true)
  })

  it('makeUserPro throws if findByIdAndUpdate returns null', async () => {
    try {
      await userApi.makeUserPro({
        _id: new Types.ObjectId('66dd91fce41720d94c15edd7')
      })
    } catch (error) {
      expect(error).toStrictEqual(new Error('User not found'))
    }
  })
})
