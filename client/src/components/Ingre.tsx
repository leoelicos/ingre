// react
import React, { CSSProperties, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// data
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

// state
import { StoreProvider } from '../utils/state/GlobalState.tsx'

// Pages
import Home from '../pages/Home/Home.jsx'
import Search from '../pages/Search/Search.jsx'
import Customise from '../pages/Customise/Customise.jsx'
import Saved from '../pages/Saved/Saved.jsx'
import Ingredients from '../pages/Ingredients/Ingredients.jsx'
import TapOff from '../pages/TapOff/TapOff.jsx'
import Login from '../pages/Admin/Login/Login.jsx'
import Signup from '../pages/Admin/Signup/Signup.jsx'
import NoMatch from '../pages/Admin/NoMatch/NoMatch.tsx'
import Success from '../pages/Admin/Success/Success.jsx'
import Upgrade from '../pages/Admin/Upgrade/Upgrade.tsx'

// Components
import Drawer from './Layout/Drawer.jsx'
import Header from './Layout/Header/Header.jsx'
import MainLayout from './Layout/MainLayout.tsx'
import SiderLeft from './Layout/SiderLeft.jsx'
import { Layout } from 'antd'
import { Content } from 'antd/lib/layout/layout'

// style
import './Ingre.css'

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
  faXmark,
  faAdd,
  faFloppyDisk,
  faTrash,
  faCubesStacked,
  faRightToBracket,
  faRightFromBracket,
  faUserPlus,
  faTruckLoading,
  faRotateRight,
  faRotateLeft,
  faEraser,
  faExclamation,
  faCropSimple,
  faDownLeftAndUpRightToCenter,
  faMagnifyingGlassChart,
  faUserGroup,
  faSpinner,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons'

// Add Font Awesome to library so they can be accessed by children
import { library } from '@fortawesome/fontawesome-svg-core'

library.add(
  faBars,
  faEgg,
  faCircleInfo,
  faCookie,
  faMagnifyingGlass,
  faCartShopping,
  faSquareCheck,
  faPen,
  faCircleXmark,
  faXmark,
  faAdd,
  faFloppyDisk,
  faTrash,
  faCubesStacked,
  faRightToBracket,
  faRightFromBracket,
  faUserPlus,
  faTruckLoading,
  faRotateRight,
  faRotateLeft,
  faEraser,
  faExclamation,
  faCropSimple,
  faDownLeftAndUpRightToCenter,
  faMagnifyingGlassChart,
  faUserGroup,
  faSpinner,
  faBookOpen
)

// ApolloClient
const authLink = setContext((_, { headers: oldHeaders }) => {
  const token = localStorage.getItem('id_token')
  const authorization = token ? `Bearer ${token}` : ''
  const headers = { ...oldHeaders, authorization }
  return { headers }
})

const uri =
  process.env.NODE_ENV === 'production'
    ? 'https://ingre-backend.onrender.com/graphql'
    : '/graphql'
console.log({ uri })
const httpLink = createHttpLink({ uri })
const link = authLink.concat(httpLink)
const cache = new InMemoryCache()
const client = new ApolloClient({ link, cache })

function Ingre() {
  useEffect(() => {
    document.title = 'ingré'
  }, [])

  return (
    <ApolloProvider client={client}>
      <Router>
        <StoreProvider>
          <Layout>
            <Header />
            <MainLayout>
              <SiderLeft />
              <Content style={contentStyle}>
                <Routes>
                  {/* pages */}
                  <Route
                    path="/"
                    element={<Home />}
                  />
                  <Route
                    path="/search"
                    element={<Search />}
                  />
                  <Route
                    path="/customise"
                    element={<Customise />}
                  />
                  <Route
                    path="/saved"
                    element={<Saved />}
                  />
                  <Route
                    path="/ingredients"
                    element={<Ingredients />}
                  />
                  <Route
                    path="/tapoff"
                    element={<TapOff />}
                  />
                  {/* admin */}
                  <Route
                    path="/login"
                    element={<Login />}
                  />
                  <Route
                    path="/signup"
                    element={<Signup />}
                  />
                  <Route
                    path="/upgrade"
                    element={<Upgrade />}
                  />
                  <Route
                    path="/success"
                    element={<Success />}
                  />
                  <Route
                    path="*"
                    element={<NoMatch />}
                  />
                </Routes>
                <Drawer />
              </Content>
            </MainLayout>
          </Layout>
        </StoreProvider>
      </Router>
    </ApolloProvider>
  )
}

export default Ingre

const contentStyle: CSSProperties = {
  backgroundColor: 'var(--ingre-light-red)',
  padding: '1rem',
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flex: 1,
  height: '100%',
  overflowY: 'auto'
}
