import { Request, Response, NextFunction } from 'express';
import { handleError, ErrorHandler } from '../utils';

const unhandledPromiseRejectionHandler = (
  reason: string | any,
  promise: any
) => {
  // logger.error({ reason, message: 'Unhandled Rejection at Promise', p });
  console.log('Unhandled Rejection at:', reason.stack || reason);
};

const uncaughtExceptionHandler = async (err: any) => {
  // logger.error(err);
  console.log('uncaughtExceptionHandler', err);
  process.exitCode = 1;
};

const finalErrorHandler = (
  error: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // logger.error(
  //   `${req.method} ${req.originalUrl} ${err.statusCode} ${
  //     err.message
  //   } ${JSON.stringify(req.body)} ${req.ip}`,
  //   req.info
  // );

  if (res.headersSent) {
    return next(error);
  }

  handleError(error, res);
};

export {
  unhandledPromiseRejectionHandler,
  uncaughtExceptionHandler,
  finalErrorHandler,
};
