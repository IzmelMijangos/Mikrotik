import { Router } from 'express';
import clientController from '../controllers/client.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', clientController.createClient.bind(clientController));
router.get('/', authorize('ADMIN'), clientController.getAllClients.bind(clientController));
router.get('/:id', clientController.getClientById.bind(clientController));
router.put('/:id', clientController.updateClient.bind(clientController));
router.delete('/:id', authorize('ADMIN'), clientController.deleteClient.bind(clientController));
router.put('/:id/mikrotik', clientController.updateMikrotikSettings.bind(clientController));

export default router;
