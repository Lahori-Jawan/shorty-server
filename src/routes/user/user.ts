import { Router } from 'express';
import urlController from '../../controllers/UrlController';
import userController from '../../controllers/UserController';

const router = Router();

const URLController = new urlController();
const UserController = new userController();

router.get('/urls', URLController.getAll);
router.post('/shorten-url', URLController.shortenUrl);
router.post('/purchase', UserController.purchase);
router.post('/set-active-domain', UserController.setActiveDomain);
router.get('/user', UserController.getUser);

export default router;
