import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { ITokenCreate } from '../interfaces';
import { ErrorHandler } from '../utils';

let jwtSecret = process.env.TOKEN_SECRET || 'xyz007abcnk7891';
let refreshTokenSecret =
  process.env.REFRESH_TOKEN_SECRET || '#$!xyz007abcnk7891%&*';

export const getToken = (req: Request) => {
  let error = null;
  if (!req?.headers?.authorization?.trim().length) {
    error = new ErrorHandler('Invalid Request', 403);
  }

  return [error, req.headers.authorization || ''];
};

export const verifyToken = (token: string) => {
  let error = null;
  let user = null;
  const message =
    'JWT token is malformed or expired, please login to obtain a new one';

  try {
    user = jwt.verify(token, jwtSecret);
  } catch (err) {
    console.log('Error @verifyToken', err.message);
    error = new ErrorHandler(message, 403);
  }

  return [error, user];
};

export const createToken: ITokenCreate = (
  payload: string | object,
  tokenDuration = '1d',
  refreshTokenDuration = '7d'
) => {
  const token = jwt.sign(payload, jwtSecret, { expiresIn: tokenDuration });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: refreshTokenDuration,
  });

  return { token, refreshToken };
};
