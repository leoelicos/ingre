/* react */
import React, { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/* components */
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Popconfirm,
  Row,
  Spin,
  Table
} from 'antd'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NotLoggedIn from '../../components/Authentication/NotLoggedIn.tsx'
import EditableRow from './EditableRow.tsx'
import EditableCell from './EditableCell.tsx'

/* data */
import { GET_SAVED_RECIPES, GET_RECIPE } from '../../utils/apollo/queries.ts'
import { useApolloClient, useLazyQuery } from '@apollo/client'

/* state */
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import {
  UPDATE_SAVED_RECIPES,
  FLAG_INGREDIENTS_GENERATED,
  UPDATE_SAVED_INGREDIENTS
} from '../../utils/state/actions.ts'

/* auth */
import Auth from '../../utils/auth/auth.ts'

/* utils */
import { changeTitle } from '../../utils/changeTitle.ts'

/* types */
import type { RecipeType } from '../../@types/recipe'

const Ingredients = () => {
  changeTitle('Ingredients')

  const [form] = Form.useForm()
  const [state, dispatch] = useStoreContext()
  const [updateRecipes, setUpdateRecipes] = useState(false)

  // send asynchronous query to the server
  const [
    ,
    {
      loading: savedRecipeLoading,
      error: savedRecipeError,
      data: savedRecipeData,
      refetch
      //
    }
  ] = useLazyQuery(GET_SAVED_RECIPES)

  const [savedRecipes, setSavedRecipes] = useState(state.savedRecipes)

  const [dataSource, setDataSource] = useState(state.savedIngredients)

  const client = useApolloClient()

  const reload = () => {
    console.log('reload')
    const getSavedIngredients = async () => {
      try {
        if (!savedRecipes) return
        const savedIngredientArray = []
        for (const recipe of savedRecipes) {
          const res = await client.query({
            query: GET_RECIPE,
            variables: { id: recipe._id }
          })
          const getRecipe: RecipeType = res.data.getRecipe
          getRecipe.ingredients.forEach((ingredient) => {
            const { _id, name, quantity, measure, category } = ingredient
            const savedIngredient = {
              _id,
              name,
              quantity,
              measure,
              category: category.name,
              recipe: recipe.name,
              recipeId: recipe._id.toString(),
              key: _id
            }
            savedIngredientArray.push(savedIngredient)
          })
        }
        // console.log('savedIngredientArray', savedIngredientArray);
        setDataSource(savedIngredientArray)
        dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: savedIngredientArray })
      } catch (error) {
        console.error(error)
      }
    }
    getSavedIngredients()
    return 1
  }

  // update global savedRecipes when local savedRecipes changes
  useEffect(() => {
    if (Auth.loggedIn() && updateRecipes && savedRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: savedRecipes })
      setUpdateRecipes(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateRecipes, savedRecipes])

  // update local savedRecipes when getSavedRecipes is loaded from server
  useEffect(() => {
    if (
      Auth.loggedIn() &&
      !savedRecipeLoading &&
      !savedRecipeError &&
      savedRecipeData?.getSavedRecipes
    ) {
      setSavedRecipes(savedRecipeData.getSavedRecipes)
      setUpdateRecipes(true)
    }
  }, [savedRecipeLoading, savedRecipeError, savedRecipeData])

  // run on first load
  useEffect(() => {
    if (!Auth.loggedIn()) return
    if (state.ingredientsDidGenerate) return
    const generateOnFirstLoad = async () => {
      dispatch({ type: FLAG_INGREDIENTS_GENERATED })
      await refetch()
      reload()
      setUpdateRecipes(true)
    }
    generateOnFirstLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, reload, state.ingredientsDidGenerate])

  const [count, setCount] = useState(2)

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key)
    setDataSource(newData)
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newData })
  }

  const defaultColumns = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      editable: true,
      sorter: function (a, b) {
        return a.name.localeCompare(b.name)
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      editable: true,
      sorter: function (a, b) {
        return parseFloat(a.quantity) - parseFloat(b.quantity)
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'measure',
      title: 'Measure',
      dataIndex: 'measure',
      editable: true,
      sorter: function (a, b) {
        return a.measure.localeCompare(b.measure)
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      editable: true,
      sorter: function (a, b) {
        return a.category.localeCompare(b.category)
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'recipe',
      title: 'From recipe',
      dataIndex: 'recipe',
      editable: true,

      sorter: function (a, b) {
        return a.recipe.localeCompare(b.recipe)
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      title: ' ',
      dataIndex: ' ',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            placement="leftTop"
            title="Confirm"
            icon={null}
            onConfirm={() => handleDelete(record.key)}
          >
            <Button
              shape="circle"
              icon={<FontAwesomeIcon icon="fa-solid fa-trash" />}
            />
          </Popconfirm>
        ) : null
    }
  ]

  const handleAdd = () => {
    const newData = {
      key: count,
      name: '_____',
      quantity: '_____',
      measure: '_____',
      category: '_____',
      recipe: 'Extra'
    }
    const newIngredients = [...dataSource, newData]
    setDataSource(newIngredients)
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newIngredients })
    setCount(count + 1)
  }

  const handleSave = (row) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, { ...item, ...row })
    setDataSource(newData)
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newData })
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  }
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave
      })
    }
  })

  const onFinish = () => {
    // console.log('[Ingredients] onFinish()');
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: dataSource })
  }

  return (
    <Col span={24}>
      <Row>
        <ContentTitle>Ingredients</ContentTitle>
      </Row>
      <Row style={{ paddingBottom: '1rem' }}>
        {Auth.loggedIn() ? (
          <>
            <Col span={24}>
              <Row>
                <Button
                  type="primary"
                  onClick={() => reload()}
                  shape="round"
                  icon={
                    <FontAwesomeIcon
                      icon="fa-solid fa-rotate-left"
                      style={{
                        marginRight: '4px'
                      }}
                    />
                  }
                  style={{
                    margin: '1rem 0'
                  }}
                >
                  Generate
                </Button>
              </Row>
            </Col>

            {savedRecipeLoading ? (
              <Divider>
                <Spin tip="Loading saved ingredients"></Spin>
              </Divider>
            ) : savedRecipeError ? (
              <Alert
                type="error"
                message="Couldn't load saved ingredients"
              />
            ) : (
              <Form
                form={form}
                component={false}
                style={{
                  marginTop: '1rem'
                }}
              >
                {dataSource.length ? (
                  <Table
                    style={{
                      width: '100%'
                    }}
                    components={{
                      body: {
                        row: EditableRow,
                        cell: EditableCell
                      }
                    }}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                  />
                ) : (
                  <Alert message="Click the Generate button to make a new list" />
                )}

                <Row style={{ marginTop: '1rem' }}>
                  <Button
                    onClick={handleAdd}
                    type="ghost"
                    icon={
                      <FontAwesomeIcon
                        icon="fa-solid fa-add"
                        style={{
                          marginRight: '4px'
                        }}
                      />
                    }
                    shape="round"
                    block
                  >
                    Ingredient
                  </Button>
                </Row>

                <Row
                  style={{
                    marginTop: '1rem'
                  }}
                >
                  <Link
                    to="/tapoff"
                    style={{ width: '100%' }}
                  >
                    <Button
                      htmlType="submit"
                      type="primary"
                      icon={
                        <FontAwesomeIcon
                          icon="fa-solid fa-floppy-disk"
                          style={{
                            marginRight: '4px'
                          }}
                        />
                      }
                      shape="round"
                      onClick={onFinish}
                      block
                    >
                      Tap Off
                    </Button>
                  </Link>
                </Row>
              </Form>
            )}
          </>
        ) : (
          <NotLoggedIn />
        )}
      </Row>
    </Col>
  )
}
export default Ingredients
