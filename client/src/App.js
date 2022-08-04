import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { StoreProvider } from './utils/GlobalState';

// layout components
import Layout from './components/Layout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import Guide from './components/Guide';

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
        <div className="page-layout">
          <StoreProvider>
            <Layout>
              <Header />
              <Sidebar />
              <Main>
                <Routes>
                  {/* main pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/custom" element={<Custom />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="/shoppinglist" element={<ShoppingList />} />
                  <Route path="/tapoff" element={<TapOff />} />
                  {/* auxiliary pages */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/orderHistory" element={<OrderHistory />} />
                  <Route path="*" element={<NoMatch />} />
                </Routes>
              </Main>
              <Guide />
            </Layout>
          </StoreProvider>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
