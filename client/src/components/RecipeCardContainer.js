import RecipeCard from './RecipeCard';
// import { Link } from 'react-router-dom';
// import { Row, Button } from 'antd';
import Empty from './Empty';
import { v4 as uuidv4 } from 'uuid';
// Auth
// import Auth from '../utils/auth';

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
        {/* {!Auth.loggedIn() && (
          <Row>
            <Link to="/Login">
              <Button type="primary">Log in to edit and save</Button>
            </Link>
          </Row>
        )} */}
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
          <Empty>No results</Empty>
        )}
      </div>
    </>
  );
};

export default App;
