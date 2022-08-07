import { gql } from '@apollo/client';

export const ADD_USER = gql`
  mutation addUser($input: UserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
      }
    }
  }
`;
export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`;

export const ADD_RANDOM_RECIPES = gql`
  mutation addRandomRecipes($input: EdamamAPIInput) {
    addRandomRecipes(input: $input) {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        text
        category {
          _id
          name
        }
      }
      picture_url
    }
  }
`;
