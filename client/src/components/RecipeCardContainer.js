import RecipeCard from './RecipeCard';
import { Divider } from 'antd';
import Empty from './Empty';
import { v4 as uuidv4 } from 'uuid';
// Auth
import Auth from '../utils/auth';

const App = ({ results, loading }) => {
  // console.log('[RecipeCardContainer] results ', results);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row wrap',
          justifyContent: 'center',
          marginTop: '1rem',
          rowGap: '1rem',
          columnGap: '1rem'
          //
        }}
      >
        {results.length ? !Auth.loggedIn() && <Divider>Log in to edit and save recipes!</Divider> : null}
        {results.length ? (
          results.map((recipe) => {
            return (
              <RecipeCard
                key={uuidv4()}
                name={recipe.name}
                picture_url={recipe.picture_url}
                recipe={recipe}
                loading={loading}
                //
              />
            );
          })
        ) : (
          <Empty />
        )}
      </div>
    </>
  );
};

export default App;
