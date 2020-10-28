import { Router } from 'express';
import urlController from '../../controllers/UrlController';

const router = Router();

const URLController = new urlController();

router.get('/:url', URLController.getURL);

export default router;
