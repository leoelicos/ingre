import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
// import { Route, Routes } from 'react-router-dom';

// Apollo
//  import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';
import { StoreProvider } from './utils/state/GlobalState';

// layout components

import Header from './components/Header';
import SiderLeft from './components/SiderLeft';
// import Main from './components/Main';
// import Content from './components/Content';
// import Sidebar from './components/Sidebar';

// main pages
// import Home from './pages/Home';
// import Search from './pages/Search';
// import Custom from './pages/Custom';
// import Saved from './pages/Saved';
// import ShoppingList from './pages/ShoppingList';
// import TapOff from './pages/TapOff';

// auxiliary pages
// import NoMatch from './pages/NoMatch';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Success from './pages/Success';
// import OrderHistory from './pages/OrderHistory';

// Ant Design React Component Library
import './App.css';

// Font Awesome React Component Icon Library
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faCircle, faPen, faCircleXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus } from '@fortawesome/free-solid-svg-icons';
library.add(faBars, faEgg, faCircleInfo, faCookie, faMagnifyingGlass, faCartShopping, faCircle, faPen, faCircleXmark, faAdd, faFloppyDisk, faTrash, faCubesStacked, faRightToBracket, faRightFromBracket, faUserPlus);

// const httpLink = createHttpLink({
//   uri: '/graphql'
// });

// const authLink = setContext((_, { headers }) => {
//   const token = localStorage.getItem('id_token');
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : ''
//     }
//   };
// });

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache()
// });

function App() {
  const title = 'ingré';
  useEffect(() => {
    document.title = title;
  }, []);

  return (
    // <ApolloProvider client={client}>
    <Router>
      <StoreProvider>
        <Header />
        {/* <Layout> */}
        {/* <SiderLeft /> */}
        {/* <Main>
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
            </Main> */}
        {/* </Layout> */}
      </StoreProvider>
    </Router>
    // </ApolloProvider>
  );
}

export default App;
