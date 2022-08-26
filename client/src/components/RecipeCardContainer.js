import RecipeCard from './RecipeCard';
import { Divider } from 'antd';
import Empty from './Empty';
import { v4 as uuidv4 } from 'uuid';
// Auth
import Auth from '../utils/auth';

const App = ({ results, loading, savePage }) => {
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
        {!Auth.loggedIn() && <Divider>Log in to edit and save recipes!</Divider>}
        {results?.length ? (
          results.map((recipe) => {
            return (
              <RecipeCard
                key={uuidv4()}
                recipe={recipe}
                loading={loading}
                savePage={savePage}
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
