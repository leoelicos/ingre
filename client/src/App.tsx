import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { Layout } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import React, { CSSProperties, FC } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Drawer from './components/Layout/Drawer/Drawer.tsx'
import Header from './components/Layout/Header/Header.tsx'
import MainLayout from './components/Layout/MainLayout.tsx'
import SiderLeft from './components/Layout/SiderLeft/SiderLeft.tsx'
import Login from './pages/Admin/Login.tsx'
import Logout from './pages/Admin/Logout.tsx'
import NoMatch from './pages/Admin/NoMatch.tsx'
import Signup from './pages/Admin/Signup.tsx'
import Success from './pages/Admin/Success.tsx'
import Upgrade from './pages/Admin/Upgrade.tsx'
import Customise from './pages/Customise/Customise.tsx'
import Home from './pages/Home/Home.tsx'
import Ingredients from './pages/Ingredients/Ingredients.tsx'
import Saved from './pages/Saved/Saved.tsx'
import Search from './pages/Search/Search.tsx'
import TapOff from './pages/TapOff/TapOff.tsx'
import './style/index.scss'
import addFontAwesome from './utils/addFontAwesome.ts'
import { AuthProvider } from './utils/auth/AuthContext.tsx'
import { changeTitle } from './utils/changeTitle.ts'
import { StoreProvider } from './utils/state/GlobalState.tsx'

addFontAwesome()

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
// console.log({ uri })
const httpLink = createHttpLink({ uri })
const link = authLink.concat(httpLink)
const cache = new InMemoryCache()
const client = new ApolloClient({ link, cache })

const Ingre: FC = () => {
  changeTitle('Recipes')
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
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
                      path="/logout"
                      element={<Logout />}
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
        </AuthProvider>
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
