import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request } from 'express';
import { User } from 'schemas/types';

dotenv.config();

const secret = process.env.HEROKU_JWT_SECRET || process.env.JWT_SECRET;
const expiration = '1h';

interface AuthenticatedRequest extends Request {
  user?: Partial<User>;
}

export const authMiddleware = ({ req }: { req: AuthenticatedRequest }): AuthenticatedRequest => {
  try {
    if (!req) throw 'No request object found!';
    const token: string | undefined = req.body?.token || req.query?.token || req.headers?.authorization?.split(' ').pop()?.trim();
    if (!token) throw new Error('No token was found!');
    if (!secret) throw new Error('Secret key is missing!');
    const { data } = jwt.verify(token, secret, { maxAge: expiration }) as jwt.JwtPayload;
    req.user = data;
  } catch (error: any) {
    req.user = undefined;
  }
  return req;
};

export const signToken = async (user: AuthenticatedRequest['user']): Promise<string> => {
  try {
    if (!secret) throw 'no secret';
    const token = jwt.sign({ data: user }, secret, { expiresIn: expiration });
    return token;
  } catch (error) {
    throw error;
  }
};
