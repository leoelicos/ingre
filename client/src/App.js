// React
import React, { useEffect } from 'react';

// React Router DOM
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Apollo Client
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Global state provider
import { StoreProvider } from './utils/state/GlobalState';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import Customise from './pages/Customise';
import Saved from './pages/Saved';
import Ingredients from './pages/Ingredients';
import TapOff from './pages/TapOff';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NoMatch from './pages/NoMatch';
import Success from './pages/Success';
import Upgrade from './pages/Upgrade';

// Components
import Header from './components/Header';
import Layout from './components/Layout';
import MainLayout from './components/MainLayout';
import SiderLeft from './components/SiderLeft';
import Content from './components/Content';

// style
import './App.css';

// Font Awesome
import { faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faSquareCheck, faPen, faCircleXmark, faXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus, faTruckLoading, faRotateRight, faRotateLeft, faEraser, faExclamation, faCropSimple, faDownLeftAndUpRightToCenter, faMagnifyingGlassChart, faUserGroup, faSpinner, faBookOpen } from '@fortawesome/free-solid-svg-icons';

// Add Font Awesome to library so they can be accessed by children
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faSquareCheck, faPen, faCircleXmark, faXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus, faTruckLoading, faRotateRight, faRotateLeft, faEraser, faExclamation, faCropSimple, faDownLeftAndUpRightToCenter, faMagnifyingGlassChart, faUserGroup, faSpinner, faBookOpen);

// ApolloClient
const authLink = setContext((_, { headers: oldHeaders }) => {
  const token = localStorage.getItem('id_token');
  const authorization = token ? `Bearer ${token}` : '';
  const headers = { ...oldHeaders, authorization };
  return { headers };
});
const httpLink = createHttpLink({ uri: '/graphql' });
const link = authLink.concat(httpLink);
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

function App() {
  useEffect(() => {
    document.title = 'ingré';
  }, []);

  return (
    <ApolloProvider client={client}>
      <Router>
        <StoreProvider>
          <Layout>
            <Header />
            <MainLayout>
              <SiderLeft />
              <Content>
                <Routes>
                  {/* pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/customise" element={<Customise />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/ingredients" element={<Ingredients />} />
                  <Route path="/tapoff" element={<TapOff />} />
                  {/* admin */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="*" element={<NoMatch />} />
                </Routes>
              </Content>
            </MainLayout>
          </Layout>
        </StoreProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
