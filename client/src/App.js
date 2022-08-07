import React, { useEffect } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

// Apollo
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// state
import { StoreProvider } from './utils/state/GlobalState';

// Components
import Header from './components/Header/index';
import Layout from './components/Layout.js';
import SiderLeft from './components/SiderLeft';
import Content from './components/Content';

// admin
import Login from './pages/Admin/Login';
import Signup from './pages/Admin/Signup';
import NoMatch from './pages/Admin/NoMatch';
// import Success from './pages/Success';
// import OrderHistory from './pages/OrderHistory';

// pages
import Home from './pages/Home';
import Search from './pages/Search';
// import Custom from './pages/Custom';
// import Saved from './pages/Saved';
// import ShoppingList from './pages/ShoppingList';
// import TapOff from './pages/TapOff';

// style
import './App.css';

// Font Awesome
import { faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faSquareCheck, faPen, faCircleXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus, faTruckLoading } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faSquareCheck, faPen, faCircleXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus, faTruckLoading);

const httpLink = createHttpLink({
  uri: '/graphql'
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

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
            <Layout>
              <SiderLeft />
              <Content>
                <Routes>
                  {/* pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  {/*
                  <Route path="/custom" element={<Custom />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/shoppinglist" element={<ShoppingList />} />
                  <Route path="/tapoff" element={<TapOff />} />
                  
                  
                  <Route path="/success" element={<Success />} />
                  <Route path="/orderHistory" element={<OrderHistory />} />
                  
                  */}
                  {/* admin */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<NoMatch />} />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </StoreProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
