// React
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Global state
import { useStoreContext } from '../utils/state/GlobalState';
import { ADD_SAVED_RECIPE, ADD_EDIT_RECIPE, REMOVE_SAVED_RECIPE } from '../utils/state/actions';

// Component library
import { Card, Image, Button, Space, Tooltip } from 'antd';

// Apollo
import { useMutation } from '@apollo/client';
import { SAVE_RECIPE, REMOVE_RECIPE } from '../utils/apollo/mutations';

// JWT Decode
import Auth from '../utils/auth';

const { Meta } = Card;

const App = (props) => {
  const { recipe } = props;
  // ApolloClient
  const [saveRecipe, { data: saveRecipeData, loading: saveRecipeLoading, error: saveRecipeError }] = useMutation(SAVE_RECIPE);
  const [removeRecipe, { data: removeRecipeData, loading: removeRecipeLoading, error: removeRecipeError }] = useMutation(REMOVE_RECIPE);

  const [state, dispatch] = useStoreContext();

  const handleEdit = () => {
    dispatch({ type: ADD_EDIT_RECIPE, data: recipe });
  };

  const handleSave = async () => {
    try {
      console.log('[RecipeCard][handleSave]', recipe);
      const input = {
        name: recipe.name,
        portions: parseInt(recipe.portions || 1),
        ingredients: recipe.ingredients.map((i) => {
          const name = i.name || 'Ingredient';
          const quantity = parseFloat(i.quantity) || 1;
          const measure = i.measure || 'unit';
          const category = i.category || 'Generic';
          const ingredient = { name, quantity, measure, category };
          return ingredient;
        }),
        picture_url: recipe.picture_url,
        edamamId: recipe.edamamId
      };
      const payload = { variables: { input } };
      console.log('payload = ', payload);

      const res = await saveRecipe(payload);
      if (!res) throw new Error('Could not save recipe');

      const saveData = res.data.saveRecipe;
      console.log('[RecipeCard][handleSave]', saveData);
      await dispatch({ type: ADD_SAVED_RECIPE, data: saveData });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async () => {
    try {
      if (!recipe._id) return;
      console.log('[RecipeCard][handleRemove] recipe', recipe);

      const payload = { variables: { recipeId: recipe._id } };
      console.log('[RecipeCard][handleRemove] payload', payload);
      const res = await removeRecipe(payload);
      if (!res) throw new Error('Could not save recipe');
      const removeData = res.data;
      console.log('[RecipeCard][handleRemove] removeData', removeData);
      await dispatch({ type: REMOVE_SAVED_RECIPE, data: recipe._id });
    } catch (error) {
      console.error(Error);
    }
  };

  const capitalize = (name) => name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Card
      cover={
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
          fallback="/images/ingre.png"
          //
        />
      }
      actions={
        Auth.loggedIn()
          ? [
              // edit button
              <Link to="/custom">
                <Button onClick={handleEdit} style={{ borderRadius: '50%', padding: '4px 8px' }}>
                  <Space>
                    <FontAwesomeIcon key="edit" icon="fa-solid fa-pen" />
                  </Space>
                </Button>
              </Link>,
              // save button
              <Button onClick={handleSave} disabled={recipe.edamamId === '-1' || state.savedRecipes.some((r) => r.edamamId === recipe.edamamId)} style={{ borderRadius: '50%', padding: '4px 8px' }}>
                <Space>
                  <FontAwesomeIcon key="save" icon="fa-solid fa-floppy-disk" />
                </Space>
              </Button>,
              // remove button
              <Button onClick={handleRemove} disabled={!recipe._id || !state.savedRecipes.find((r) => r._id === recipe._id)} style={{ borderRadius: '50%', padding: '4px 8px' }}>
                <Space>
                  <FontAwesomeIcon key="save" icon="fa-solid fa-trash" />
                </Space>
              </Button>
              //
            ]
          : [
              <Link to="/Login">
                <Space>Login to Edit and Save!</Space>
              </Link>
            ]
      }

      //
    >
      <Meta
        title={
          <Tooltip
            title={recipe.name}
            style={{ display: 'inline-block' }}
            //
          >
            {capitalize(recipe.name)}
          </Tooltip>
        }
        style={{
          display: 'inline-block',
          height: '50px',
          whiteSpace: 'wrap'
        }}
        //
      />
    </Card>
  );
};

export default App;
