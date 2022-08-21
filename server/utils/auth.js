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
const expiration = '2h';

module.exports = {
  authMiddleware: function ({ req }) {
    try {
      if (!req) throw new Error('req missing');
      let token = req.body?.token || req.query?.token || req.headers?.authorization?.split(' ').pop().trim();
      if (!token) throw new Error('No token was found!');
      const secretOrPrivateKey = secret;
      const options = { maxAge: expiration };
      ({ data: req.user } = jwt.verify(token, secretOrPrivateKey, options));
    } catch (error) {
      console.error(error);
    } finally {
      return req;
    }
  },
  signToken: function ({ firstName, email, _id }) {
    const payload = { data: { firstName, email, _id } };
    const secretOrPrivateKey = secret;
    const options = { expiresIn: expiration };
    return jwt.sign(payload, secretOrPrivateKey, options);
  }
};
