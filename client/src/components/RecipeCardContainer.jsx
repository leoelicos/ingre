// Custom components
import RecipeCard from './RecipeCard';
import Empty from './Empty';
import { BackTop } from 'antd';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/apollo/queries';

import Auth from '../utils/auth';
const App = ({ results, loading, savePage }) => {
  const { data } = useQuery(GET_USER);

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
        }}
      >
        {results?.length ? (
          results.map((recipe, idx) => {
            return (
              <RecipeCard
                key={idx}
                recipe={recipe}
                loading={loading}
                savePage={savePage}
                pro={Auth.loggedIn() ? data?.getUser?.pro || false : false}
                //
              />
            );
          })
        ) : (
          <Empty>No recipes</Empty>
        )}
        <BackTop />
      </div>
    </>
  );
};

export default App;
