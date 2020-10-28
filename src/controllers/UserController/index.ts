import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { ErrorHandler, hasValidFields, isValidId } from '../../utils';

export default class UserController {
  /**
   * @function purchase
   * @description Save domain into purchased domains for a User
   * @param     {Object} req.body - required
   * @param     {string} req.body.userId - required
   * @param     {array} req.body.domains - required
   */

  async purchase(req: Request, res: Response, next: NextFunction) {
    if (!hasValidFields(req.body, ['userId', 'domains'])) {
      return next(new ErrorHandler('Required fields are missing', 400));
    }

    if (!isValidId(req.body.userId)) {
      return next(new ErrorHandler('id is not valid', 400));
    }

    let [err, user] = await User.getUser(req.body.userId);

    if (err) return next(err);

    const { record, message, status } = await user.purchase(req.body.domains);

    if (status >= 400) return next(new ErrorHandler(message, status));

    delete record._doc.password;

    res.status(status).json({
      message,
      user: record,
    });
  }

  /**
   * @function setActiveDomain
   * @description Activate a specific domain
   * @param     {Object} req.body - required
   * @param     {string} req.body.userId - required
   * @param     {array} req.body.domainId - required
   */

  async setActiveDomain(req: Request, res: Response, next: NextFunction) {
    if (!hasValidFields(req.body, ['userId', 'domainId'])) {
      return next(new ErrorHandler('Required fields are missing', 400));
    }

    if (!isValidId(req.body.userId)) {
      return next(new ErrorHandler('id is not valid', 400));
    }

    const user = await User.findById(req.body.userId);

    const { record, message, status } = await user.setActiveDomain(
      req.body.domainId
    );

    if (status >= 400) return next(new ErrorHandler(message, status));

    delete record._doc.password;

    res.status(status).json({
      message,
      user: record,
    });
  }

  /**
   * @function getUser
   * @description Get user details
   * @param     {Object} req.body - required
   * @param     {string} req.body.userId - required
   */

  async getUser(req: Request, res: Response, next: NextFunction) {
    if (!hasValidFields(req.body, ['userId'])) {
      return next(new ErrorHandler('Required fields are missing', 400));
    }

    if (!isValidId(req.body.userId)) {
      return next(new ErrorHandler('id is not valid', 400));
    }

    let [err, user] = await User.getUser(req.body.userId);

    if (err) return next(err);

    delete user._doc.password;

    res.status(200).json({
      message: 'User Details',
      user,
    });
  }
}
