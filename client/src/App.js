import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';

// allow font awesome icon components to be used globally
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPen, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
library.add(faPen, faFloppyDisk);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
