import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { AuthenticatedRequest, MyContext } from 'schemas/types'
import { Types } from 'mongoose'
import { UserSchema } from 'models/User'

dotenv.config()
const expiration = '1h'

export const authMiddleware = ({
  req
}: {
  req: AuthenticatedRequest
}): MyContext => {
  try {
    const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET
    if (!secret) throw new Error('Secret key is missing!')

    const token = req.headers.authorization
    if (!token) throw new Error('No token was found!')
    const tokenWithoutBearer = token.split('Bearer ')[1]

    const { data } = jwt.verify(tokenWithoutBearer, secret, {
      maxAge: expiration
    }) as jwt.JwtPayload
    req.user = data
  } catch (error: any) {
    req.user = undefined
  }
  return req
}

export const signToken = (
  user: UserSchema &
    Required<{
      _id: Types.ObjectId
    }>
) => {
  try {
    const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET
    if (!secret) throw new Error('no secret')
    const token = jwt.sign({ data: user }, secret, { expiresIn: expiration })
    return token
  } catch (error) {
    throw error
  }
}
