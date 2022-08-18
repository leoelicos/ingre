import { useEffect } from 'react';

import { ADD_SAVED_RECIPE, DELETE_SAVED_RECIPE } from '../utils/state/actions';
import { GET_USER } from '../utils/apollo/queries';
// import { GET_USER } from '../utils/apollo/mutations';
import Auth from '../utils/auth';
import { Empty } from '../components/Empty';

// update savedRecipes
import { useStoreContext } from '../../utils/state/GlobalState';

const SavedBooks = () => {
  const [state, dispatch] = useStoreContext();
  if (!Auth.loggedIn()) {
    return (
      <Empty>
        <p>You need to be logged in to see saved recipes!</p>
      </Empty>
    );
  }

  const handleDeleteBook = async (recipeId) => {
    dispatch({ type: ADD_SAVED_RECIPE });
  };

  // if data isn't here yet, say so
  /*   if (!userDataLength) {
    return <h2>LOADING...</h2>;
  } */

  useEffect(() => {
    document.title = 'ingré Search';
  }, []);

  return (
    <>
      <div fluid className="text-light bg-dark">
        <div>
          <h1>Viewing saved recipes!</h1>
        </div>
      </div>
      <div>
        <h2>{userData.savedBooks.length ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'recipe' : 'recipes'}:` : 'You have no saved recipes!'}</h2>
        <div>
          {userData.savedBooks.map((recipe) => {
            return (
              <div key={recipe.recipeId} border="dark">
                {recipe.image ? <div.Img src={recipe.image} alt={`The cover for ${recipe.title}`} variant="top" /> : null}
                <div.Body>
                  <div.Title>{recipe.title}</div.Title>
                  <p className="small">Authors: {recipe.authors}</p>
                  <div.Text>{recipe.description}</div.Text>
                  <div className="btn-block btn-danger" onClick={() => handleDeleteBook(recipe.recipeId)}>
                    Delete this Book!
                  </div>
                </div.Body>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SavedBooks;
