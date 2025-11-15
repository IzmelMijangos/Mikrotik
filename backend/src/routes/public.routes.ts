import { Router } from 'express';
import clientController from '../controllers/client.controller';

const router = Router();

// Public route to get client info by slug
router.get('/client/:slug', clientController.getClientBySlug.bind(clientController));

export default router;
