// react
import React, { FC } from 'react'

// components
import { Card, Tooltip } from 'antd'
import PortionsButton from './Buttons/PortionsButton.tsx'
import DisabledEditButton from './Buttons/DisabledEditButton.tsx'
import DisabledSaveButton from './Buttons/DisabledSaveButton.tsx'
import DisabledTrashButton from './Buttons/DisabledTrashButton.tsx'
import InstructionsButton from './Buttons/InstructionsButton.tsx'
import SaveButton from './Buttons/SaveButton.tsx'
import TrashButton from './Buttons/TrashButton.tsx'
import EditButton from './Buttons/EditButton.tsx'
import RecipeImage from './RecipeImage.tsx'

// state
import { useStoreContext } from '../../../utils/state/GlobalState.tsx'
import {
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE,
  SET_EDIT_RECIPE
} from '../../../utils/state/actions.ts'
import { useAuthContext } from '../../../utils/auth/AuthContext.tsx'

// data
import { useMutation, useLazyQuery } from '@apollo/client'
import {
  SAVE_RECIPE,
  REMOVE_RECIPE
} from '../../../lib/apollo/graphQL/mutations.ts'
import {
  GET_SAVED_RECIPES,
  GET_RECIPE
} from '../../../lib/apollo/graphQL/queries.ts'

/* types */
import type { ClientRecipe } from '../../../@types/client'
import type { RecipeInput } from '../../../@types/payloads.d.ts'

interface RecipeCardProps {
  recipe: ClientRecipe
  onSavedPage: boolean
  pro: boolean
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe, onSavedPage, pro }) => {
  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn

  const [saveRecipe, { loading: saveRecipeLoading, error: saveRecipeError }] =
    useMutation(SAVE_RECIPE, {
      refetchQueries: [{ query: GET_SAVED_RECIPES }]
    })
  if (saveRecipeError) console.error('saveRecipeError', { saveRecipeError })
  const [
    removeRecipe,
    { loading: removeRecipeLoading, error: removeRecipeError }
  ] = useMutation(REMOVE_RECIPE, {
    refetchQueries: [{ query: GET_SAVED_RECIPES }]
  })

  if (removeRecipeError) console.error({ removeRecipeError })

  const [state, dispatch] = useStoreContext()

  const [getRecipe, { loading: getRecipeLoading, error: getRecipeError }] =
    useLazyQuery(GET_RECIPE)

  const handleEdit = async () => {
    let data = recipe

    if (recipe._id) {
      // saved on backend so need to GET ingredients
      const query = GET_RECIPE
      const variables = { id: recipe._id }
      const res = await getRecipe({ query, variables })
      data = res.data.getRecipe
    }
    dispatch({ type: SET_EDIT_RECIPE, data: data })
  }

  const handleSave = async () => {
    const placeholder =
      'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
    try {
      const input: RecipeInput = {
        name: recipe.name || 'Recipe',
        portions: recipe.portions ? Math.floor(recipe.portions) : 1,
        picture_url: recipe.picture_url || placeholder,
        edamamId: recipe.edamamId || '',
        instructions: recipe.instructions || '',
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name || 'Ingredient',
          quantity: i.quantity || 1,
          measure: i.measure || 'unit',
          category: i.category || 'Generic'
        }))
      }
      console.log('handleSave', { input })
      const variables = { input }
      const payload = { variables }
      console.log({ payload }) // this is good
      const res = await saveRecipe(payload)
      if (!res) throw 'Could not save recipe'
      const saveData = res.data.saveRecipe
      console.log({ res }) // this is returning null
      dispatch({ type: ADD_SAVED_RECIPE, data: saveData })
    } catch (error) {
      console.error(error)
      console.log('error here')
    }
  }

  const handleRemove = async () => {
    try {
      let _id
      if (onSavedPage) {
        _id = recipe._id
      } else {
        _id = state.savedRecipes.find((r) => r.edamamId === recipe.edamamId)._id
      }
      const payload = { variables: { recipeId: _id } }
      const res = await removeRecipe(payload)
      if (!res) throw new Error('Could not save recipe')
      dispatch({ type: REMOVE_SAVED_RECIPE, data: recipe.edamamId }) // this won't work if it doesn't have edamamId
    } catch (error) {
      console.error(Error)
    }
  }

  const capitalize = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1)

  const actions = loggedIn
    ? [
        <PortionsButton
          key="portions"
          portions={recipe.portions || 0}
        />,
        pro ? (
          <InstructionsButton
            key="instructions"
            handleRemove={handleRemove}
            instructions={recipe.instructions}
          />
        ) : null,

        <EditButton
          key="edit"
          getRecipeError={getRecipeError}
          getRecipeLoading={getRecipeLoading}
          handleEdit={handleEdit}
        />,
        <SaveButton
          key="save"
          handleSave={handleSave}
          savedRecipes={state.savedRecipes}
          saveRecipeLoading={saveRecipeLoading}
          edamamId={recipe.edamamId}
        />,
        <TrashButton
          key="trash"
          removeRecipeLoading={removeRecipeLoading}
          handleRemove={handleRemove}
          savedRecipes={state.savedRecipes}
          edamamId={recipe.edamamId}
        />
      ].filter((n) => n !== null)
    : [
        <PortionsButton
          key="portions"
          portions={recipe.portions || 0}
        />,
        <DisabledEditButton key="edit" />,
        <DisabledSaveButton key="save" />,
        <DisabledTrashButton key="trash" />
      ]

  return (
    <Card
      cover={
        <RecipeImage
          name={recipe.name}
          picture_url={recipe.picture_url}
        />
      }
      actions={actions}
    >
      <Card.Meta
        title={
          <Tooltip
            title={recipe.name}
            style={{ display: 'inline-block' }}
          >
            {recipe.name ? capitalize(recipe.name) : ''}
          </Tooltip>
        }
        style={{
          display: 'inline-block',
          height: '50px',
          whiteSpace: 'break-spaces'
        }}
      />
    </Card>
  )
}

export default RecipeCard
