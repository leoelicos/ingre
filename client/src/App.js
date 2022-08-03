import React from 'react';
import Home from './components/Home';
import { library } from '@fortawesome/fontawesome-svg-core';

import { faPen, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

library.add(faPen, faFloppyDisk);

function App() {
  return <Home />;
}

export default App;
