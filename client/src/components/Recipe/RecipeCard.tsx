// react
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

// components
import { Card, Image, Button, Tooltip, Space, Typography } from 'antd'

// state
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import {
  ADD_SAVED_RECIPE,
  REMOVE_SAVED_RECIPE,
  ADD_EDIT_RECIPE
} from '../../utils/state/actions.ts'

// data
import { useMutation, useApolloClient } from '@apollo/client'
import { SAVE_RECIPE, REMOVE_RECIPE } from '../../utils/apollo/mutations.ts'
import {
  GET_SAVED_RECIPES,
  GET_NUM_SAVED_RECIPES,
  GET_RECIPE
} from '../../utils/apollo/queries.ts'

// authentication
import Auth from '../../utils/auth/auth.ts'

/* types */
import type { RecipeType } from '../../@types/recipe.d.ts'
import {
  IngreIconCustomise,
  IngreIconPortion,
  IngreIconPro,
  IngreIconRemove,
  IngreIconSave,
  IngreIconSpin
} from '../Icons/Icon.tsx'

interface RecipeCardProps {
  recipe: RecipeType
  onSavedPage: boolean
  pro: boolean
}

const RecipeCard: FC<RecipeCardProps> = ({ recipe, onSavedPage, pro }) => {
  const [saveRecipe, { loading: saveRecipeLoading, error: saveRecipeError }] =
    useMutation(SAVE_RECIPE, {
      refetchQueries: [
        { query: GET_SAVED_RECIPES },
        { query: GET_NUM_SAVED_RECIPES }
      ]
    })
  if (saveRecipeError) console.error({ saveRecipeError })
  const [
    removeRecipe,
    { loading: removeRecipeLoading, error: removeRecipeError }
  ] = useMutation(REMOVE_RECIPE, {
    refetchQueries: [
      { query: GET_SAVED_RECIPES },
      { query: GET_NUM_SAVED_RECIPES }
    ]
  })

  if (removeRecipeError) console.error({ removeRecipeError })

  const [state, dispatch] = useStoreContext()
  const client = useApolloClient()

  const handleEdit = async () => {
    let data = recipe

    if (recipe._id) {
      // saved on backend so need to GET ingredients
      const query = GET_RECIPE
      const variables = { id: recipe._id }
      const res = await client.query({ query, variables })
      data = res.data.getRecipe
    }
    dispatch({ type: ADD_EDIT_RECIPE, data: data })
  }

  const handleSave = async () => {
    try {
      const input = {
        name: recipe.name,
        portions: recipe.portions ? Math.floor(recipe.portions) : 1,
        ingredients: recipe.ingredients.map((i) => {
          const name = i.name || 'Ingredient'
          const quantity = i.quantity || 1
          const measure = i.measure || 'unit'
          const category = i.category || 'Generic'
          const ingredient = { name, quantity, measure, category }
          return ingredient
        }),
        picture_url: recipe.picture_url,
        edamamId: recipe.edamamId,
        instructions: recipe.shareAs
      }
      const variables = { input }
      const payload = { variables }
      const res = await saveRecipe(payload)
      if (!res) throw new Error('Could not save recipe')

      const saveData = res.data.saveRecipe
      dispatch({ type: ADD_SAVED_RECIPE, data: saveData })
    } catch (error) {
      console.error(error)
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

  const editButton = (
    <Tooltip
      color="var(--ingre-dark-brown)"
      placement="top"
      title="Edit"
      className="button-tooltip"
    >
      <Button
        onClick={handleEdit}
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        <Link to="/customise">
          <IngreIconCustomise />
        </Link>
      </Button>
    </Tooltip>
  )

  const saveButton = (
    <Tooltip
      color="var(--ingre-dark-brown)"
      placement="top"
      title="Save"
      className="button-tooltip"
    >
      <Button
        key="saveButton"
        onClick={handleSave}
        disabled={
          saveRecipeLoading ||
          (state.savedRecipes.length > 0 &&
            state.savedRecipes.some((r) => r.edamamId === recipe.edamamId))
        }
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        {saveRecipeLoading ? <IngreIconSpin /> : <IngreIconSave />}
      </Button>
    </Tooltip>
  )

  const removeButton = (
    <Tooltip
      color="var(--ingre-dark-brown)"
      placement="top"
      title="Unsave"
      className="button-tooltip"
    >
      <Button
        key="removeButton"
        disabled={
          removeRecipeLoading ||
          !state.savedRecipes.some((r) => r.edamamId === recipe.edamamId)
        }
        onClick={handleRemove}
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        {removeRecipeLoading ? <IngreIconSpin /> : <IngreIconRemove />}
      </Button>
    </Tooltip>
  )
  const disabledEditButton = (
    <Tooltip
      placement="top"
      title={
        <Link to="/login">
          <Button type="primary">Log in</Button>
        </Link>
      }
    >
      <Button
        disabled
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        <IngreIconCustomise />
      </Button>
    </Tooltip>
  )

  const disabledSaveButton = (
    <Tooltip
      placement="top"
      title={
        <Link to="/login">
          <Button type="primary">Log in</Button>
        </Link>
      }
    >
      <Button
        disabled
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        <IngreIconSave />
      </Button>
    </Tooltip>
  )

  const disabledTrashButton = (
    <Tooltip
      placement="top"
      title={
        <Link to="/login">
          <Button type="primary">Log in</Button>
        </Link>
      }
    >
      <Button
        disabled
        style={{
          borderRadius: '50%',
          padding: '4px 8px'
        }}
      >
        <IngreIconRemove />
      </Button>
    </Tooltip>
  )

  const portionsButton = (
    <Tooltip
      color="var(--ingre-dark-brown)"
      placement="top"
      title={'Serves ' + recipe.portions + ' people'}
      className="button-tooltip"
    >
      <IngreIconPortion />
      <Typography.Text>{recipe.portions}</Typography.Text>
    </Tooltip>
  )

  const instructionsButton = (
    <Tooltip
      color="var(--ingre-dark-brown)"
      placement="top"
      title={<Space size="small">Cooking instructions</Space>}
    >
      <Button
        key="removeButton"
        onClick={handleRemove}
        style={{
          borderRadius: '50%',
          padding: '4px 7px'
        }}
        shape="circle"
      >
        <a
          href={recipe.instructions}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IngreIconPro />
        </a>
      </Button>
    </Tooltip>
  )

  const getActions = () => {
    // Every page gets a portions button
    let actions = [portionsButton]
    // if not logged in, buttons are disabled
    if (!Auth.loggedIn()) {
      actions.push(disabledEditButton, disabledSaveButton, disabledTrashButton)
      return actions
    }
    // if user is pro, instructions button
    if (pro) actions.push(instructionsButton)
    // everyone gets an edit button
    actions.push(editButton)
    // everyone except saved page gets a save button
    if (!onSavedPage) actions.push(saveButton)
    // everyone gets a remove button
    actions.push(removeButton)
    return actions
  }

  const recipeImage = (
    <Image
      width={'100%'}
      height={150}
      style={{
        objectFit: 'cover',
        borderTopLeftRadius: '1rem',
        borderTopRightRadius: '1rem'
      }}
      alt={recipe.name}
      src={recipe.picture_url}
      placeholder={true}
      fallback="https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc"
    />
  )

  return (
    <Card
      cover={recipeImage}
      actions={getActions()}
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
