import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/slug/:slug', profileController.getProfilesBySlug.bind(profileController));

// Protected routes
router.use(authenticate);

router.post('/', profileController.createProfile.bind(profileController));
router.get('/client/:clientId', profileController.getProfilesByClient.bind(profileController));
router.get('/:id', profileController.getProfileById.bind(profileController));
router.put('/:id', profileController.updateProfile.bind(profileController));
router.delete('/:id', profileController.deleteProfile.bind(profileController));

export default router;
