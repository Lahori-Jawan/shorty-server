import { Request, Response, NextFunction } from 'express';
import { getToken, verifyToken } from '../utils';
// import User from '../models/User';

export default (req: Request, res: Response, next: NextFunction) => {
  const [error, token] = getToken(req);

  if (error) return next(error);

  const [verifyError, user] = verifyToken(token);

  if (verifyError) return next(verifyError);

  req.body.userId = user.userId;
  next();
};
