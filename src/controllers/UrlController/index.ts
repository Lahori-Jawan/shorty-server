import { Request, Response, NextFunction } from 'express';
import URL from '../../models/Url';
import User from '../../models/User';
import { ErrorHandler, hasValidFields, isValidId } from '../../utils';

export default class UrlController {
  /**
   * @function findOrCreate
   * @description Create new shortened url
   * @param     {Object} req.body - required
   * @param     {string} req.body.url - required
   */

  async shortenUrl(req: Request, res: Response, next: NextFunction) {
    const data = Object.assign({}, req.body, req.params);

    if (!hasValidFields(req.body, ['userId', 'url']))
      return next(new ErrorHandler('Required fields are missing', 400));

    req.body.url = req.body.url.startsWith('http')
      ? req.body.url
      : `https://${req.body.url}`;

    console.log('req.body', req.body);
    const { record, message, status } = await URL.findOrCreate(req.body);

    if (status >= 400) return next(new ErrorHandler(message, status));

    res.status(status).json({
      url: record,
      message,
    });
  }

  /**
   * @function getAll
   * @description Return all shortened urls for a User
   * @param     {Object} req.body - required
   * @param     {string} req.body.user - required
   */

  async getAll(req: Request, res: Response, next: NextFunction) {
    if (!hasValidFields(req.body, ['userId'])) {
      return next(new ErrorHandler('Required fields are missing'));
    }

    if (!isValidId(req.body.userId)) {
      return next(new ErrorHandler('id is not valid'));
    }

    const urls = await URL.find({ user: req.body.userId });

    res.status(200).json({
      urls,
    });
  }

  /**
   * @function getURL
   * @description Redirect to url or not found page
   * @param     {Object} req - required
   * @param     {string} req.params.url - required
   */

  async getURL(req: Request, res: Response, next: NextFunction) {
    const url = `${req.protocol}://${req.headers.host}/${req.params.url}`;
    const found = await URL.findOne({ short: url }).lean();

    if (!found) res.status(302).redirect(`${process.env.WEB_APP_URL}/404`);
    else res.status(302).redirect(found.url);
  }
}
