import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from 'utils/auth/AuthContext'
import AuthButton from './AuthButton.tsx'
import { IngreIconLogoEgg, IngreIconLogoMenuCollapsed } from 'lib/icon/Icon'
import LogoText from './LogoText.tsx'
import {
  IngreIconCustomise,
  IngreIconIngredients,
  IngreIconPro,
  IngreIconSave,
  IngreIconSearch,
  IngreIconTapOff
} from 'lib/icon/Icon'
import { Container, Nav, Navbar } from 'react-bootstrap'

const links = [
  { to: '/search', icon: <IngreIconSearch />, label: 'Search' },
  { to: '/customise', icon: <IngreIconCustomise />, label: 'Customise' },
  { to: '/saved', icon: <IngreIconSave />, label: 'Saved' },
  { to: '/ingredients', icon: <IngreIconIngredients />, label: 'Ingredients' },
  { to: '/tapoff', icon: <IngreIconTapOff />, label: 'Tap Off' },
  { to: '/upgrade', icon: <IngreIconPro />, label: 'PRO' }
] as const

export const Header: FC = () => {
  const [auth] = useAuthContext()

  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand>
          <Link
            to="/"
            style={{ textDecoration: 'none' }}
          >
            <IngreIconLogoEgg />
            <LogoText>ingré</LogoText>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <IngreIconLogoMenuCollapsed />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {links.map(({ to, label }) => (
              <Navbar.Text key="label">
                <Link
                  to={to}
                  className="me-3"
                  style={{ textDecoration: 'none' }}
                >
                  {label}
                </Link>
              </Navbar.Text>
            ))}
            <Navbar.Text>
              <AuthButton loggedIn={auth.loggedIn} />
            </Navbar.Text>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
