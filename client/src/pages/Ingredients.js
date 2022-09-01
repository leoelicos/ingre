// React
import React, { useContext, useEffect, useRef, useState } from 'react';

// Ant components
import { Button, Form, Input, Popconfirm, Table, Row, Col, Divider, Spin, Empty } from 'antd';

// Custom components
import ContentTitle from '../components/ContentTitle';

// Apollo
import { GET_SAVED_RECIPES, GET_RECIPE } from '../utils/apollo/queries';
import { useApolloClient, useQuery } from '@apollo/client';

// GlobalState
import { useStoreContext } from '../utils/state/GlobalState';
import { UPDATE_SAVED_RECIPES, FLAG_INGREDIENTS_GENERATED, UPDATE_SAVED_INGREDIENTS } from '../utils/state/actions';

// Assets
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex]
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`
          }
        ]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
          //
        />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const Ingredients = () => {
  const [form] = Form.useForm();
  const [state, dispatch] = useStoreContext();

  const { loading: savedRecipeLoading, error: savedRecipeError, data: savedRecipeData } = useQuery(GET_SAVED_RECIPES);

  const [savedRecipes, setSavedRecipes] = useState([]);

  const [dataSource, setDataSource] = useState([
    {
      key: '0',
      name: 'Loading',
      quantity: 'Loading',
      measure: 'Loading',
      category: 'Loading',
      recipe: 'Loading'
    }
  ]);

  const client = useApolloClient();

  const reload = () => {
    console.log('reload');
    const getSavedIngredients = async () => {
      const { savedRecipes } = state;
      if (!savedRecipes.length) return [{ name: 'blank', measure: 'blank', quantity: 0, category: 'blank' }];
      const savedIngredientArray = [];
      for (const recipe of savedRecipes) {
        const res = await client.query({ query: GET_RECIPE, variables: { id: recipe._id } });
        res.data.getRecipe.ingredients.forEach((ingredient) => {
          const { _id, name, quantity, measure, category } = ingredient;
          const savedIngredient = { _id, name, quantity, measure, category: category.name, recipe: recipe.name, recipeId: recipe._id.toString(), key: _id };
          savedIngredientArray.push(savedIngredient);
        });
      }
      setDataSource(savedIngredientArray);
      dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: savedIngredientArray });
    };
    getSavedIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  // server > local
  useEffect(() => {
    if (savedRecipeData) setSavedRecipes(savedRecipeData.getSavedRecipes);
  }, [savedRecipeData]);

  // local > global
  useEffect(() => {
    dispatch({ type: UPDATE_SAVED_RECIPES, data: savedRecipes });
  }, [dispatch, savedRecipes]);

  // generate on first load
  useEffect(() => {
    if (state.ingredientsDidGenerate === false) {
      dispatch({ type: FLAG_INGREDIENTS_GENERATED });
      reload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = 'Ingredients';
  }, []);

  const [count, setCount] = useState(2);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newData });
  };

  const defaultColumns = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      // width: '25%',
      editable: true,
      sorter: function (a, b) {
        return a.name.localeCompare(b.name);
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      // width: '15%',
      editable: true,
      sorter: function (a, b) {
        return parseFloat(a.quantity) - parseFloat(b.quantity);
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'measure',
      title: 'Measure',
      dataIndex: 'measure',
      // width: '15%',
      editable: true,
      sorter: function (a, b) {
        return a.measure.localeCompare(b.measure);
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      // width: '25%',
      editable: true,
      sorter: function (a, b) {
        return a.category.localeCompare(b.category);
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      key: 'recipe',
      title: 'From recipe',
      dataIndex: 'recipe',
      editable: true,
      // width: '15%',

      sorter: function (a, b) {
        return a.recipe.localeCompare(b.recipe);
      },
      sortDirections: ['ascend', 'descend']
    },
    {
      title: ' ',
      dataIndex: ' ',
      // width: '5%',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm placement="leftTop" title="Confirm" icon={null} onConfirm={() => handleDelete(record.key)}>
            <Button shape="circle" icon={<FontAwesomeIcon icon="fa-solid fa-trash" />} />
          </Popconfirm>
        ) : null
    }
  ];

  const handleAdd = () => {
    const newData = {
      key: count,
      name: '_____',
      quantity: '_____',
      measure: '_____',
      category: '_____',
      recipe: 'Extra'
    };
    const newIngredients = [...dataSource, newData];
    setDataSource(newIngredients);
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newIngredients });
    setCount(count + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: newData });
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
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
    };
  });

  const onFinish = () => {
    console.log('[Ingredients] onFinish()');
    dispatch({ type: UPDATE_SAVED_INGREDIENTS, data: dataSource });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Col span={24}>
      <Row>
        <ContentTitle>Ingredients</ContentTitle>
      </Row>
      <Row style={{ marginTop: '1rem' }}>
        <Button
          type="primary"
          onClick={() => reload()}
          shape="round"
          icon={<FontAwesomeIcon icon="fa-solid fa-rotate-left" style={{ marginRight: '4px' }} />}
          //
        >
          Generate
        </Button>
      </Row>

      <Row style={{ marginTop: '1rem', paddingBottom: '1rem', height: '100%' }}>
        {savedRecipeLoading ? (
          <Spin>Loading</Spin>
        ) : savedRecipeError ? (
          <Empty />
        ) : (
          <Form
            form={form}
            component={false}
            style={{ marginTop: '1rem' }}
            // onFinish={onFinish}
            //
          >
            <Table
              style={{ width: '100%' }}
              components={components}
              rowClassName={() => 'editable-row'}
              bordered
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              //
            />
            <Row style={{ marginTop: '1rem' }}>
              <Button
                onClick={handleAdd}
                type="ghost"
                icon={<FontAwesomeIcon icon="fa-solid fa-add" style={{ marginRight: '4px' }} />}
                shape="round"
                style={{ width: '100%' }}
                //
              >
                Ingredient
              </Button>
            </Row>

            <Row style={{ marginTop: '1rem' }}>
              <Link to="/tapoff" style={{ width: '100%' }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  style={{ width: '100%' }}
                  icon={<FontAwesomeIcon icon="fa-solid fa-floppy-disk" style={{ marginRight: '4px' }} />}
                  shape="round"
                  onClick={onFinish}
                  //
                >
                  Tap Off
                </Button>
              </Link>
            </Row>
          </Form>
        )}
        <Divider />
      </Row>
    </Col>
  );
};
export default Ingredients;
