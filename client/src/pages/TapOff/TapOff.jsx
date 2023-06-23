/* react */
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/* state */
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import { UPDATE_TAP_OFF } from '../../utils/state/actions.ts'

/* components */
import {
  Col,
  Card,
  Tag,
  Row,
  Space,
  Checkbox,
  Typography,
  Button,
  Alert
} from 'antd'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import ContentSubtitle from '../../components/Text/ContentSubtitle.tsx'
import NotLoggedIn from '../../components/Authentication/NotLoggedIn.tsx'
import Masonry from 'react-masonry-css'

/* auth */
import Auth from '../../utils/auth/auth.ts'

/* utils */
import compress from '../../utils/compress.ts'
import { changeTitle } from '../../utils/changeTitle.ts'

/* style */
import './style.css'

const TapOff = () => {
  changeTitle('tapoff')

  const handleChange = (ri, ii, checked) => {
    const x = JSON.parse(JSON.stringify(compressedRecipes))
    x[ri].items[ii].checked = checked
    setCompressedRecipes(x)
  }

  const [state, dispatch] = useStoreContext()
  const { savedIngredients } = state
  const [compressedRecipes, setCompressedRecipes] = useState([
    { items: ['Loading'], category: 'Loading' }
  ])

  useEffect(() => {
    const compressed = compress(savedIngredients)
    // console.table(compressed);
    setCompressedRecipes(compressed)
    dispatch({ type: UPDATE_TAP_OFF, data: compressed })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Col
      span={24}
      className="tap-off-column"
    >
      <Row>
        <ContentTitle>Tap Off</ContentTitle>
      </Row>
      <Row style={{ paddingBottom: '1rem', width: '100%' }}>
        {!Auth.loggedIn() ? (
          <NotLoggedIn />
        ) : (
          <Masonry
            breakpointCols={
              state.leftSidebarCollapsed
                ? { default: 3, 1050: 2, 750: 1 }
                : { default: 3, 1208: 2, 875: 1 }
            }
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
            //
          >
            {compressedRecipes?.length ? (
              compressedRecipes.map((r, ri) => (
                <Card
                  key={r.category}
                  style={{
                    borderRadius: '0 1rem 0 0 ',
                    boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                    paddingBottom: '4px'
                  }}
                  className={
                    r.items.every((i) => i.checked) ? 'card-all-tapped' : ''
                  }
                >
                  <Row
                    justify="center"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    <ContentSubtitle>{r.category}</ContentSubtitle>
                  </Row>
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                  >
                    {r.items.map((i, ii) => (
                      <Tag.CheckableTag
                        key={r.category + i.description}
                        checked={i.checked}
                        onChange={(checked) => handleChange(ri, ii, checked)}
                        className="checkable-tag"
                        //
                      >
                        <Checkbox
                          checked={i.checked}
                          className="tap-off-check-box"
                        />
                        <Typography.Text style={{ fontSize: '14px' }}>
                          {i.description}
                        </Typography.Text>
                      </Tag.CheckableTag>
                    ))}
                  </Space>
                </Card>
              ))
            ) : (
              <Card
                key="ungenerated"
                style={{ padding: '1rem' }}
              >
                <Alert
                  type="warning"
                  message={
                    <Space
                      direction="vertical"
                      align="center"
                      style={{ textAlign: 'center' }}
                    >
                      Generate an ingredient list first
                      <Button
                        type="primary"
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Link to="/ingredients">Ingredients</Link>
                      </Button>
                    </Space>
                  }
                />
              </Card>
            )}
          </Masonry>
        )}
      </Row>
    </Col>
  )
}
export default TapOff
