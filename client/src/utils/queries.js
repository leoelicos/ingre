import { gql } from '@apollo/client';

export const GET_USER = gql`
  {
    getUser {
      _id
      firstName
      lastName
      email
      savedRecipes {
        _id
        name
        portions
        ingredients {
          _id
          name
          quantity
          measure
          category {
            _id
            name
          }
        }
        picture_url
      }
      libraryRecipes {
        _id
        name
        portions
        ingredients {
          _id
          name
          quantity
          measure
          category {
            _id
            name
          }
        }
        picture_url
      }
      orders {
        _id
        purchaseDate
        products {
          _id
          name
          description
          image
          quantity
          price
        }
      }
    }
  }
`;

export const GET_RECIPES = gql`
  {
    getRecipes {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
      picture_url
    }
  }
`;

export const GET_RECIPE = gql`
  query getRecipe($id: ID!) {
    getRecipe(_id: $id) {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
      picture_url
    }
  }
`;

export const GET_INGREDIENTS = gql`
  query getIngredients($category: ID) {
    getIngredients(category: $category) {
      _id
      name
      quantity
      measure
      category {
        _id
        name
      }
    }
  }
`;

export const GET_INGREDIENT = gql`
  query getIngredient($id: ID!) {
    getIngredient(_id: $id) {
      _id
      name
      quantity
      measure
      category {
        _id
        name
      }
    }
  }
`;

export const GET_ORDER = gql`
  query getOrder($id: ID!) {
    getOrder(_id: $id) {
      _id
      purchaseDate
      products {
        _id
        name
        description
        image
        quantity
        price
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query getCategories {
    getCategories {
      _id
      name
    }
  }
`;

export const GET_CATEGORY = gql`
  query getCategory($id: ID!) {
    getCategory(_id: $id) {
      _id
      name
    }
  }
`;

export const GET_PRODUCTS = gql`
  query getProducts {
    getProducts {
      _id
      name
      description
      image
      quantity
      price
    }
  }
`;

export const GET_PRODUCT = gql`
  query getProduct($id: ID!) {
    getProduct(_id: $id) {
      _id
      name
      description
      image
      quantity
      price
    }
  }
`;

export const QUERY_CHECKOUT = gql`
  query getCheckout($products: [ID]!) {
    checkout(products: $products) {
      session
    }
  }
`;
