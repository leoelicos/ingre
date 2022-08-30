import { useEffect, useState } from 'react';
import { Table } from 'antd';

import { GET_SAVED_INGREDIENTS } from '../utils/apollo/queries';
import { useApolloClient } from '@apollo/client';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity'
  },
  {
    title: 'Measure',
    dataIndex: 'measure',
    key: 'measure'
  },
  {
    title: 'Category',
    key: 'category',
    dataIndex: 'category'
  },
  {
    title: 'Recipe',
    key: 'recipe',
    dataIndex: 'recipe'
  }
];

const Ingredients = () => {
  const client = useApolloClient();

  const getSavedIngredients = async () => {
    const res = await client.query({ query: GET_SAVED_INGREDIENTS });
    if (!res) throw new Error('[Ingredients] GET_SAVED_RECIPES error');
    const data = res.data.getSavedIngredients;
    console.log('data', data);
  };

  useEffect(() => {
    document.title = 'ingré Shopping List';
  }, []);

  return (
    <Table
      columns={columns}
      dataSource={getSavedIngredients()}
      pagination={false}
      //
    />
  );
};
export default Ingredients;
