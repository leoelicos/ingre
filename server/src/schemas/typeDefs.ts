import { gql } from 'graphql-tag'

export const typeDefs = gql`
  # #208: Explorer, Manager and Leader are opt-in; everything stays available
  enum Tier {
    EXPLORER
    MANAGER
    LEADER
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    pro: Boolean!
    tier: Tier
    "#312: true while the tier's Stripe subscription is active or trialing"
    active: Boolean!
    "#312: Stripe's subscription status (active, incomplete, past_due, canceled...), null before one"
    subscriptionStatus: String
    savedRecipes: [Recipe!]!
    numSavedRecipes: Int!
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  type Recipe {
    _id: ID!
    name: String!
    portions: Int!
    ingredients: [Ingredient!]!
    picture_url: String!
    libraryId: String
    instructions: String
    customisations: [Customisation!]!
  }

  # #182: one type per kind of change, so no field is ever empty
  type AddedIngredient {
    ingredientId: String!
    to: Float!
  }

  type RemovedIngredient {
    ingredientId: String!
    from: Float!
  }

  type ChangedIngredient {
    ingredientId: String!
    from: Float!
    to: Float!
  }

  type PortionsChange {
    from: Int!
    to: Int!
  }

  union Customisation =
    | AddedIngredient
    | RemovedIngredient
    | ChangedIngredient
    | PortionsChange

  input AddedIngredientInput {
    ingredientId: String!
    to: Float!
  }

  input RemovedIngredientInput {
    ingredientId: String!
    from: Float!
  }

  input ChangedIngredientInput {
    ingredientId: String!
    from: Float!
    to: Float!
  }

  input PortionsChangeInput {
    from: Int!
    to: Int!
  }

  input CustomisationsInput {
    added: [AddedIngredientInput!]!
    removed: [RemovedIngredientInput!]!
    changed: [ChangedIngredientInput!]!
    portions: PortionsChangeInput
  }

  input RecipeInput {
    name: String!
    portions: Int!
    ingredients: [IngredientInput!]!
    picture_url: String!
    libraryId: String
    instructions: String
    customisations: CustomisationsInput!
  }
  type Ingredient {
    _id: ID!
    name: String!
    quantity: Float!
    measure: String!
    category: Category!
    "catalogue id (#182); missing on recipes saved before it"
    ingredientId: String
  }

  input IngredientInput {
    name: String!
    quantity: Float!
    measure: String!
    category: String!
    ingredientId: String!
  }

  type Category {
    _id: ID!
    name: String!
  }

  type Checkout {
    session: String!
  }

  type Auth {
    token: String!
    user: User!
  }

  # recipe
  type Query {
    getRecipe(_id: ID!): Recipe!
  }

  type Mutation {
    saveRecipe(input: RecipeInput!): Recipe!
    removeRecipe(recipeId: ID!): Boolean!
  }

  # #312: the result of subscribing to a tier
  type TierSubscription {
    tier: Tier!
    status: String!
    active: Boolean!
  }

  # session
  type Query {
    checkout(tier: Tier): Checkout!
  }

  type Mutation {
    login(email: String!, password: String!): Auth!
  }

  # user
  type Query {
    getUser: User!
    getSavedRecipes: [Recipe!]!
    getNumSavedRecipes: Int!
    checkEmailAlreadyExists(email: String!): Boolean!
  }

  type Mutation {
    addUser(input: UserInput!): Auth!
    makeUserPro(tier: Tier): User!
    "#312: subscribes to a tier with a Stripe.js card token (createToken); test mode only"
    subscribe(tier: Tier!, token: String!): TierSubscription!
  }
`

export const schema = typeDefs
