/*
 * ingre
 * seeds/user-seeds.js
 * This script implements authMiddleware, which uses JSON Web Token to prevents users from doing certain actions if they are not signed in.
 * It also implements signToken, which creates a token for a user that lasts a period of time
 * Copyright 2022 Leo Wong
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET;
const expiration = '24h';

module.exports = {
  authMiddleware: function ({ req }) {
    try {
      if (!req) throw new Error('req missing');
      let token = req.body?.token || req.query?.token || req.headers?.authorization?.split(' ').pop().trim();
      if (!token) throw new Error('No token was found!');
      // console.log('token = ', token);
      const secretOrPrivateKey = secret;
      const options = { maxAge: expiration };
      const jwtRes = jwt.verify(token, secretOrPrivateKey, options);
      req.user = jwtRes.data;
    } catch (error) {
      console.error(error);
    } finally {
      return req;
    }
  },
  signToken: function (user) {
    const { firstName, email, _id, pro } = user;
    const data = { firstName, email, _id, pro };
    const payload = { data };
    const secretOrPrivateKey = secret;
    const options = { expiresIn: expiration };
    return jwt.sign(payload, secretOrPrivateKey, options);
  }
};
