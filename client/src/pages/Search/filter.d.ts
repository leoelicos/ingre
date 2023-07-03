export interface filterTypes {
  diet: dietType[]
  health: healthType[]
  cuisineType: cuisineType[]
  mealType: mealType[]
  dishType: dishType[]
}

/* export type filterType =
  | dietFilterType
  | healthFilterType
  | cuisineFilterType
  | mealFilterType
  | dishFilterType */

type dietFilterType = ['diet', dietType]
type dietType =
  | 'balanced'
  | 'high-fiber'
  | 'high-protein'
  | 'low-carb'
  | 'low-fat'
  | 'low-sodium'

type healthFilterType = ['health', healthType]
type healthType =
  | 'dairy-free'
  | 'egg-free'
  | 'fish-free'
  | 'gluten-free'
  | 'low-potassium'
  | 'low-sugar'
  | 'lupine-free'
  | 'Mediterranean'
  | 'mollusk-free'
  | 'mustard-free'
  | 'no-oil-added'
  | 'paleo'
  | 'peanut-free'
  | 'pescatarian'
  | 'pork-free'
  | 'red-meat-free'
  | 'sesame-free'
  | 'shellfish-free'
  | 'soy-free'
  | 'sugar-conscious'
  | 'sulfite-free'
  | 'tree-nut-free'
  | 'vegan'
  | 'vegetarian'
  | 'wheat-free'

type cuisineFilterType = ['cuisine-type', cuisineType]
type cuisineType =
  | 'American'
  | 'Asian'
  | 'British'
  | 'Caribbean'
  | 'Central Europe'
  | 'Chinese'
  | 'Eastern Europe'
  | 'French'
  | 'Indian'
  | 'Italian'
  | 'Japanese'
  | 'Mediterranean'
  | 'Mexican'
  | 'Middle Eastern'
  | 'Nordic'
  | 'South American'
  | 'South East Asian'

type mealFilterType = ['meal-type', mealType]
type mealType = 'Breakfast' | 'Dinner' | 'Lunch' | 'Snack'

type dishFilterType = ['dish-type', dishType]
type dishType =
  | 'Biscuits-and-cookies'
  | 'Bread'
  | 'Cereals'
  | 'Condiments-and-sauces'
  | 'Desserts'
  | 'Drinks'
  | 'Main-course'
  | 'Pancake'
  | 'Preps'
  | 'Preserve'
  | 'Salad'
  | 'Sandwiches'
  | 'Side dish'
  | 'Soup'
  | 'Starter'
  | 'Sweets'
