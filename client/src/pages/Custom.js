import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import Cart from '../components/Cart';
import { useDispatch, useSelector } from 'react-redux';
import { REMOVE_FROM_CART, UPDATE_CART_QUANTITY, ADD_TO_CART, UPDATE_RECIPES } from '../utils/actions';
import { QUERY_RECIPES } from '../utils/queries';
import { idbPromise } from '../utils/helpers';
import spinner from '../assets/spinner.gif';

function Custom() {
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const { id } = useParams();

  const [currentRecipe, setCurrentRecipe] = useState({});

  const { loading, data } = useQuery(QUERY_RECIPES);

  const { recipes, cart } = state;

  useEffect(() => {
    // already in global store
    if (recipes.length) {
      setCurrentRecipe(recipes.find((product) => product._id === id));
    }
    // retrieved from server
    else if (data) {
      dispatch({
        type: UPDATE_RECIPES,
        recipes: data.recipes
      });

      data.recipes.forEach((product) => {
        idbPromise('recipes', 'put', product);
      });
    }
    // get cache from idb
    else if (!loading) {
      idbPromise('recipes', 'get').then((indexedRecipes) => {
        dispatch({
          type: UPDATE_RECIPES,
          recipes: indexedRecipes
        });
      });
    }
  }, [recipes, data, loading, dispatch, id]);

  const addToCart = () => {
    const itemInCart = cart.find((cartItem) => cartItem._id === id);
    if (itemInCart) {
      dispatch({
        type: UPDATE_CART_QUANTITY,
        _id: id,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
      idbPromise('cart', 'put', {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1
      });
    } else {
      dispatch({
        type: ADD_TO_CART,
        product: { ...currentRecipe, purchaseQuantity: 1 }
      });
      idbPromise('cart', 'put', { ...currentRecipe, purchaseQuantity: 1 });
    }
  };

  const removeFromCart = () => {
    dispatch({
      type: REMOVE_FROM_CART,
      _id: currentRecipe._id
    });

    idbPromise('cart', 'delete', { ...currentRecipe });
  };

  return (
    <>
      {currentRecipe && cart ? (
        <div className="container my-1">
          <Link to="/">← Back to Recipes</Link>

          <h2>{currentRecipe.name}</h2>

          <p>{currentRecipe.description}</p>

          <p>
            <strong>Price:</strong>${currentRecipe.price} <button onClick={addToCart}>Add to Cart</button>
            <button disabled={!cart.find((p) => p._id === currentRecipe._id)} onClick={removeFromCart}>
              Remove from Cart
            </button>
          </p>

          <img src={`/images/${currentRecipe.image}`} alt={currentRecipe.name} />
        </div>
      ) : null}
      {loading ? <img src={spinner} alt="loading" /> : null}
      <Cart />
    </>
  );
}

export default Custom;
