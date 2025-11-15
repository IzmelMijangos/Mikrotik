import { Router } from 'express';
import ticketController from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/checkout', ticketController.createCheckoutSession.bind(ticketController));
router.get('/verify/:sessionId', ticketController.verifyPayment.bind(ticketController));
router.post('/webhook', ticketController.handleStripeWebhook.bind(ticketController));

// Protected routes
router.use(authenticate);

router.get('/:id', ticketController.getTicketById.bind(ticketController));
router.get('/client/:clientId', ticketController.getTicketsByClient.bind(ticketController));
router.delete('/:id', ticketController.cancelTicket.bind(ticketController));

export default router;
