// React
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Global state
import { useStoreContext } from '../utils/state/GlobalState';
import { ADD_SAVED_RECIPE, ADD_EDIT_RECIPE } from '../utils/state/actions';

// Component library
import { Card, Image, Button, Space, Tooltip } from 'antd';
// Apollo
import { useMutation } from '@apollo/client';
import { SAVE_RECIPE } from '../utils/apollo/mutations.js';

// JWT Decode
import Auth from '../utils/auth';

const { Meta } = Card;

const App = (props) => {
  // states to manage saving recipe
  const [saveRecipe, { loading: dbLoading }] = useMutation(SAVE_RECIPE); // database
  const [state, dispatch] = useStoreContext(); // global store
  const [dbId, setDbId] = useState(''); // after save button clicked and saved

  const handleEdit = () => {
    console.log('Edit button was clicked - the props.recipe is ', props.recipe);
    dispatch({ type: ADD_EDIT_RECIPE, data: props.recipe });
  };

  const handleSave = async () => {
    console.log('[RecipeCard][handleSave] props.recipe', props.recipe);
    try {
      // update database with recipe object
      const recipe = props.recipe;
      const res = await saveRecipe({ variables: { input: recipe } });
      if (!res) throw new Error('Could not save recipe');

      const saveData = res.data.saveRecipe;
      console.log('[RecipeCard][handleSave] saveData', saveData);
      // update global state with database object
      dispatch({ type: ADD_SAVED_RECIPE, data: saveData });
      console.log('[RecipeCard][handleSave] dispatch state.savedRecipes', state.savedRecipes);
      setDbId(saveData._id);
    } catch (e) {
      console.log(e);
    }
  };

  const getTitle = (name) => {
    let title = name;
    // capitalize the first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    // trim the first 100 characters
    // const titleLength = title.length;
    // title = title.slice(0, 40);
    // if (titleLength > 40) title += '...';
    return title;
  };

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
          alt={props.name}
          src={props.picture_url}
          placeholder={true}
          fallback="/images/ingre.png"
          //
        />
      }
      actions={
        Auth.loggedIn()
          ? [
              <Link to="/custom">
                <Button onClick={handleEdit}>
                  <Space>
                    Edit
                    <FontAwesomeIcon key="edit" icon="fa-solid fa-pen" />
                  </Space>
                </Button>
              </Link>,

              <Button
                onClick={handleSave}
                disabled={state.savedRecipes.some((r) => r._id === dbId)}
                loading={dbLoading}
                //
              >
                {state.savedRecipes.some((r) => r._id === dbId) ? (
                  <Space>Saved!</Space>
                ) : (
                  <Space>
                    Save <FontAwesomeIcon key="save" icon="fa-solid fa-floppy-disk" />
                  </Space>
                )}
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
            title={props.name}
            style={{ display: 'inline-block' }}
            //
          >
            {getTitle(props.name)}
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
