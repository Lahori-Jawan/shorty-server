import { Router } from 'express';
import authController from '../../controllers/AuthController';

const router = Router();
const AuthController = new authController();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

export default router;
