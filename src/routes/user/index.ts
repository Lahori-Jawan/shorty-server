import { Router } from 'express';
import UserRoutes from './user';

const router = Router();

router.use('/users', UserRoutes);

export default router;
