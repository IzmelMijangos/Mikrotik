import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import profileRoutes from './profile.routes';
import ticketRoutes from './ticket.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/profiles', profileRoutes);
router.use('/tickets', ticketRoutes);
router.use('/public', publicRoutes);

export default router;
