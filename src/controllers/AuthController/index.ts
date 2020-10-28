import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import { ErrorHandler, hasValidFields } from '../../utils';
import { createToken } from '../../utils';

export default class AuthController {
  /**
   * @function Register
   * @description Register a User
   * @param     {Object} req.body - required
   * @param     {string} req.body.name - required
   * @param     {string} req.body.username - required
   * @param     {string} req.body.email - required
   * @param     {string} req.body.password - required
   * @param     {string} req.body.purchased - optional
   */

  async register(req: Request, res: Response, next: NextFunction) {
    if (!hasValidFields(req.body, ['name', 'username', 'email', 'password'])) {
      return next(new ErrorHandler('Required fields are missing', 400));
    }

    const { record, message, status } = await User.findOrCreate2(req.body);

    if (status >= 400) return next(new ErrorHandler(message, status)); // for any error i.e. server or client

    delete record._doc.password;

    res.status(status).json({
      message,
      user: record,
    });
  }

  /**
   * @function login
   * @description Login a User
   * @param     {Object} req.body - required
   * @param     {string} req.body.email - required
   * @param     {string} req.body.password - required
   */

  async login(req: Request, res: Response, next: NextFunction) {
    if (!hasValidFields(req.body, ['email', 'password'])) {
      return next(new ErrorHandler('Required fields are missing', 400));
    }

    const { email, password: plainPassowrd } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return next(new Error('User does not exist'));

      const validPassword = await user.comparePassword(
        plainPassowrd,
        user.password
      );

      if (!validPassword) {
        return next(new Error('Password or email is not correct'));
      }

      const { token } = createToken({ userId: user._id });

      user.accessToken = token;

      await user.save();

      delete user._doc.password;

      res.status(200).json({
        user,
        message: 'You have logged in successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
