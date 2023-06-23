import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Ingre from './components/Ingre.tsx'
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)

root.render(
  // temporarily disabled React.StrictMode for production
  <Ingre />
)

// serviceWorkerRegistration.register();
// reportWebVitals();
