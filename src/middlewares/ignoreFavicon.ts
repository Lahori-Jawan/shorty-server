import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl && req.originalUrl.includes('favicon')) {
    console.log('ignoring favicon request');
    return res.sendStatus(204);
  }

  return next();
};
