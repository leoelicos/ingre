import { useEffect } from 'react';
import Empty from '../../components/Empty';

const App = () => {
  useEffect(() => {
    document.title = 'ingré Not Found';
  }, []);
  return (
    <Empty>
      <h1>Page Not Found</h1>
    </Empty>
  );
};

export default App;
