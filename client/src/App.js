import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { StoreProvider } from './utils/GlobalState';

// layout components

import Header from './components/Header';
import Main from './components/Main';
import Content from './components/Content';
import Sidebar from './components/Sidebar';

// main pages
import Home from './pages/Home'; // list of recipes automatically generated
import Search from './pages/Search'; // search bar for recipes
import Custom from './pages/Custom'; // like State-20 StudentList.js
import Saved from './pages/Saved'; // like State-26 Cart.js
import ShoppingList from './pages/ShoppingList'; // like State-26 Cart.js
import TapOff from './pages/TapOff'; // like Toggle

// auxiliary pages
import NoMatch from './pages/NoMatch';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Success from './pages/Success';
import OrderHistory from './pages/OrderHistory';

// Ant Design React Component Library
import './App.css';

// Font Awesome React Component Icon Library
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faCircle, faPen, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';
library.add(faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faCircle, faPen, faFloppyDisk);

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
  const title = 'ingré';
  useEffect(() => {
    document.title = title;
  }, []);

  return (
    <ApolloProvider client={client}>
      <Router>
        <StoreProvider>
          <div className="layout">
            <Header />
            <Main>
              <Sidebar />
              <Content>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/custom" element={<Custom />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/shoppinglist" element={<ShoppingList />} />
                  <Route path="/tapoff" element={<TapOff />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/orderHistory" element={<OrderHistory />} />
                  <Route path="*" element={<NoMatch />} />
                </Routes>
              </Content>
            </Main>
          </div>
        </StoreProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
