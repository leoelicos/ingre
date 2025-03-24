import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import React, { FC } from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Header } from 'components/Header'
import { Login } from 'pages/Admin/Login'
import { NoMatch } from 'pages/Admin/NoMatch'
import { Signup } from 'pages/Admin/Signup'
import { Success } from 'pages/Admin/Success'
import Upgrade from 'pages/Admin/Upgrade'
import Customise from 'pages/Customise/Customise'
import Home from 'pages/Home/Home'
import { Ingredients } from 'pages/Ingredients/Ingredients'
import { Saved } from 'pages/Saved/Saved'
import Search from 'pages/Search/Search'
import TapOff from 'pages/TapOff/TapOff'
import { addFontAwesome } from 'utils/addFontAwesome'
import { AuthProvider } from 'utils/auth/AuthContext'
import { changeTitle } from 'utils/changeTitle'
import { StoreProvider } from 'utils/state/GlobalState'
import 'bootstrap/dist/css/bootstrap.min.css'

addFontAwesome()

const authLink = setContext((_, { headers: oldHeaders }) => {
  const token = localStorage.getItem('id_token')
  const authorization = token ? `Bearer ${token}` : ''
  const headers = { ...oldHeaders, authorization }
  return { headers }
})

const uri =
  process.env.NODE_ENV === 'production'
    ? 'https://ingre-backend.onrender.com/graphql'
    : 'http://localhost:3001/graphql'
const httpLink = createHttpLink({ uri })
const link = authLink.concat(httpLink)
const cache = new InMemoryCache()
const client = new ApolloClient({ link, cache })

export const Ingre: FC = () => {
  changeTitle('Recipes')
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
          <StoreProvider>
            <Header />
            <Routes>
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
          </StoreProvider>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  )
}
