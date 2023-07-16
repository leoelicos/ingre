/*
 * ingre
 * This script implements authMiddleware, which uses JSON Web Token to prevents users from doing certain actions if they are not signed in.
 * It also implements signToken, which creates a token for a user that lasts a period of time
 * Copyright 2022 Leo Wong
 */

const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET
// const expiration = '24h'
const expiration = '1m'

module.exports = {
  authMiddleware: function ({ req }) {
    /* check req exists */
    if (!req) {
      console.error('No req')
      return req
    }

    let token = req.body?.token || req.query?.token || req.headers?.authorization?.split(' ').pop().trim()

    /* check token exists */
    if (!token) {
      console.error('No token was found!')
      return req
    }

    /* check jwt against token */
    let data = null
    try {
      /* this will throw if invalid */
      const verified = jwt.verify(
        token, //
        secret,
        { maxAge: '12h' }
      )

      if (!verified.data) {
        console.error('jwt promise has no data object')
        return req
      }

      data = verified.data
    } catch (error) {
      console.error('Token is invalid - sign in again')
      return req
    }

    /* some problem with the data */
    if (!data) {
      console.error('500 Error with data')
      return req
    }

    /* no problems - assign user to req */
    // console.info('✅ Logged in')
    req.user = data
    return req
  },
  signToken: function (user) {
    const { firstName, email, _id, pro } = user
    const data = { firstName, email, _id, pro }
    const payload = { data }
    const secretOrPrivateKey = secret
    const options = { expiresIn: expiration }
    const token = jwt.sign(payload, secretOrPrivateKey, options)
    return token
  }
}
