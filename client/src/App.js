// React
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Apollo
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Global state provider
import { StoreProvider } from './utils/state/GlobalState';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import Custom from './pages/Custom';
import Saved from './pages/Saved';
// import ShoppingList from './pages/ShoppingList';
// import TapOff from './pages/TapOff';

// Components
import Header from './components/Header/index';
import Layout from './components/Layout.js';
import MainLayout from './components/MainLayout.js';
import SiderLeft from './components/SiderLeft';
import Content from './components/Content';
import Login from './pages/Admin/Login';
import Signup from './pages/Admin/Signup';
import NoMatch from './pages/Admin/NoMatch';
// import Success from './pages/Success';

// style
import './App.css';

// Font Awesome
import {
  faBars,
  faEgg,
  faCircleInfo,
  faCookie,
  faMagnifyingGlass,
  faCartShopping,
  faSquareCheck,
  faPen,
  faCircleXmark,
  faAdd,
  faFloppyDisk,
  faTrash,
  faCubesStacked,
  faRightToBracket,
  faRightFromBracket,
  faUserPlus,
  faTruckLoading,
  faRotateRight,
  faRotateLeft
  //
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faSquareCheck, faPen, faCircleXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus, faTruckLoading, faRotateRight, faRotateLeft);

// ApolloClient, cache, and 2 middlewares: authLink and GraphQL
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});
const httpLink = createHttpLink({ uri: '/graphql' });
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
  //
});

console.clear();
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
                  <Route path="/custom" element={<Custom />} />
                  <Route path="/saved" element={<Saved />} />
                  {/*
                  <Route path="/shoppinglist" element={<ShoppingList />} />
                  <Route path="/tapoff" element={<TapOff />} />
                  <Route path="/success" element={<Success />} />
                  
                  */}
                  {/* admin */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
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
