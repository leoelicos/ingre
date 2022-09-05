// Custom components
import RecipeCard from './RecipeCard';
import Empty from './Empty';
import { BackTop } from 'antd';

const App = ({ results, loading, savePage }) => (
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

export default App;
