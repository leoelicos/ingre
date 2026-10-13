import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { AuthButton } from 'components/AuthButton'

const { Brand, Toggle, Collapse, Text } = Navbar

export const Header: React.FC<{
  Logo: React.FC
  LogoCollapsed: React.FC
  logoText: string
  links: Array<{ to: string; label: string }>
  loggedIn: boolean
}> = ({ Logo, logoText, LogoCollapsed, links, loggedIn }) => {
  return (
    <Navbar expand="lg">
      <Container>
        <Brand>
          <Link
            to="/"
            style={{ textDecoration: 'none' }}
          >
            <Logo />
            <span
              style={{
                color: 'var(--ingre-dark-brown)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '36px',
                letterSpacing: -1,
                fontWeight: '800'
              }}
            >
              {logoText}
            </span>
          </Link>
        </Brand>
        <Toggle aria-controls="basic-navbar-nav">
          <LogoCollapsed />
        </Toggle>
        <Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {links.map(({ to, label }) => (
              <Text key={to}>
                <Link
                  to={to}
                  className="me-3"
                  style={{ textDecoration: 'none' }}
                >
                  {label}
                </Link>
              </Text>
            ))}
            <Text>
              <AuthButton loggedIn={loggedIn} />
            </Text>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  )
}
