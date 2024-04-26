const jwt = require('jsonwebtoken')
require('dotenv').config()

const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET
const expiration = '1m'

module.exports = {
  authMiddleware: function ({ req }) {
    if (!req) {
      console.error('No req')
      return req
    }

    let token = req.body?.token || req.query?.token || req.headers?.authorization?.split(' ').pop().trim()

    if (!token) {
      console.error('No token was found!')
      return req
    }

    let data = null
    try {
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

    if (!data) {
      console.error('500 Error with data')
      return req
    }

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
