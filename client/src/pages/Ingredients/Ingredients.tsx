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
import {
  IngreIconAddIngredient,
  IngreIconClearCustom,
  IngreIconRemove,
  IngreIconSave
} from '../../components/Icons/Icon.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import NotLoggedIn from '../../components/Authentication/NotLoggedIn.tsx'
import EditableRow from './EditableRow.tsx'
import EditableCell from './EditableCell.tsx'

/* data */
import {
  GET_SAVED_RECIPES,
  GET_RECIPE
} from '../../lib/apollo/graphQL/queries.ts'
import { useApolloClient, useLazyQuery } from '@apollo/client'

/* state */
import { useStoreContext } from '../../utils/state/GlobalState.tsx'
import {
  UPDATE_SAVED_RECIPES,
  FLAG_INGREDIENTS_GENERATED,
  UPDATE_SAVED_INGREDIENTS
} from '../../utils/state/actions.ts'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

/* utils */
import { changeTitle } from '../../utils/changeTitle.ts'

/* types */
import type { RecipeType } from '../../@types/recipe.ts'
import type {
  IngredientGeneratedType,
  IngredientGeneratedTypeWithKey
} from '../../@types/ingredientGenerated.ts'
import { ColumnsType } from 'antd/lib/table/interface'

const Ingredients: FC = () => {
  changeTitle('Ingredients')

  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn
  if (!loggedIn)
    return (
      <Col span={24}>
        <Row>
          <ContentTitle>Ingredients</ContentTitle>
        </Row>
        <Row style={{ paddingBottom: '1rem' }}>
          <NotLoggedIn />
        </Row>
      </Col>
    )

  const [form] = Form.useForm()
  const [state, dispatch] = useStoreContext()
  const [updateRecipes, setUpdateRecipes] = useState(false)

  // send asynchronous query to the server
  const [
    _,
    {
      loading: savedRecipeLoading,
      error: savedRecipeError,
      data: savedRecipeData,
      refetch
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
        const savedIngredientArray: IngredientGeneratedTypeWithKey[] = []
        for (const recipe of savedRecipes) {
          /* //TODO this is promise chaining - it should be replaced by getSavedIngredients */
          const recipeName = recipe.name
          const recipeId = recipe._id.toString()
          const res = await client.query({
            query: GET_RECIPE,
            variables: { id: recipe._id }
          })
          const getRecipe: RecipeType = res.data.getRecipe
          /* push serialized into savedIngredient[] */
          getRecipe.ingredients.forEach((ingredient) => {
            const { _id, name, quantity, measure, category } = ingredient
            const savedIngredient = {
              _id: _id || '',
              name,
              quantity,
              measure,
              category: category.name,
              recipe: recipeName,
              recipeId,
              key: _id || ''
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
    if (updateRecipes && savedRecipes) {
      dispatch({ type: UPDATE_SAVED_RECIPES, data: savedRecipes })
      setUpdateRecipes(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateRecipes, savedRecipes])

  // update local savedRecipes when getSavedRecipes is loaded from server
  useEffect(() => {
    if (
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

  const handleDelete = (key: string) => {
    const newData = dataSource.filter((item) => item.key !== key)
    setDataSource(newData)
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newData })
  }
  interface defaultColumnType {
    key: string
    title: string
    dataIndex: string
    editable?: boolean
    sorter?: (a: IngredientGeneratedType, b: IngredientGeneratedType) => number
    sortDirections?: ('ascend' | 'descend')[]
    render?: (_: never, record: { key: string }) => React.JSX.Element | null
  }
  const defaultColumns: defaultColumnType[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      editable: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      editable: true,
      sorter: (a, b) => a.quantity - b.quantity,
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'measure',
      title: 'Measure',
      dataIndex: 'measure',
      editable: true,
      sorter: (a, b) => a.measure.localeCompare(b.measure),
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      editable: true,
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'recipe',
      title: 'From recipe',
      dataIndex: 'recipe',
      editable: true,

      sorter: (a, b) => a.recipe.localeCompare(b.recipe),
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'delete',
      title: ' ',
      dataIndex: ' ',
      render: (_: never, record: { key: string }) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            placement="leftTop"
            title="Confirm"
            icon={null}
            onConfirm={() => handleDelete(record.key)}
          >
            <Button
              shape="circle"
              icon={<IngreIconRemove />}
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

  type HandleSaveType = (row: IngredientGeneratedTypeWithKey) => void
  const handleSave: HandleSaveType = (row) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, { ...item, ...row })
    setDataSource(newData)
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newData })
  }

  const columns = defaultColumns.map((col) => {
    if (!Object.hasOwn(col, 'editable')) return col

    return {
      ...col,
      onCell: (record: any) => ({
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
        <Col span={24}>
          <Row>
            <Button
              type="primary"
              onClick={() => reload()}
              shape="round"
              icon={<IngreIconClearCustom />}
              style={{
                margin: '1rem 0 1rem 4px'
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
                columns={columns as ColumnsType<any>}
                pagination={false}
              />
            ) : (
              <Alert message="Click the Generate button to make a new list" />
            )}

            <Row style={{ marginTop: '1rem' }}>
              <Button
                onClick={handleAdd}
                type="ghost"
                icon={<IngreIconAddIngredient />}
                shape="round"
                block
              >
                <span style={{ marginLeft: '4px' }}>Ingredient</span>
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
                  icon={<IngreIconSave />}
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
      </Row>
    </Col>
  )
}
export default Ingredients
