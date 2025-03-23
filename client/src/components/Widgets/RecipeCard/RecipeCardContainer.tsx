import React, { FC } from 'react'
import { useAuthContext } from 'utils/auth/AuthContext'
import RecipeCard from './RecipeCard'
import { Col, Container, Row } from 'react-bootstrap'

type RecipeCardContainerType = FC<{
  results: any[]
  loading: boolean
  onSavedPage: boolean
}>

const RecipeCardContainer: RecipeCardContainerType = ({
  results,
  loading,
  onSavedPage
}) => {
  const [auth] = useAuthContext()
  const pro = auth.profile?.data.pro || false
  return (
    <Container className="p-0 pb-3">
      {loading ? (
        <div>"Loading saved recipes…"</div>
      ) : !results || results.length === 0 ? (
        <div>No recipes</div>
      ) : (
        <Row
          xs="1"
          sm="1"
          md="2"
          lg="3"
          xl="4"
          xxl="4"
          className="g-3"
        >
          {results?.map((recipe, idx) => {
            return (
              <Col key={recipe.name}>
                <RecipeCard
                  key={idx}
                  recipe={recipe}
                  onSavedPage={onSavedPage}
                  pro={pro}
                />
              </Col>
            )
          })}
        </Row>
      )}
    </Container>
  )
}

export default RecipeCardContainer
