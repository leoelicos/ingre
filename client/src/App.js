import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import Header from './components/Header';

// allow font awesome icon components to be used globally
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faEgg, faCircleInfo, faPen, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
library.add(faBars, faEgg, faCircleInfo, faPen, faFloppyDisk);

function App() {
  return (
    <Router>
      <div className="page-layout">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
