/*
 * ingre
 * seeds/user-seeds.js
 * This script implements authMiddleware, which uses JSON Web Token to prevents users from doing certain actions if they are not signed in.
 * It also implements signToken, which creates a token for a user that lasts 2 hours
 * Copyright 2022 Leo Wong
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET;
console.log('the secret is ', secret);
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    return req;
  },
  signToken: function ({ firstName, email, _id }) {
    const payload = { firstName, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  }
};
