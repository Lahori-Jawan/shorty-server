import { Router } from 'express';
import UserRoutes from './user/';

const router = Router();

router.use(UserRoutes);

export default router;
