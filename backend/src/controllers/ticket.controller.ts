import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { generateRandomUsername, generateRandomPassword } from '../utils/password';
import { MikrotikService } from '../services/mikrotik.service';
import stripeService from '../services/stripe.service';

export class TicketController {
  async createCheckoutSession(req: AuthRequest, res: Response) {
    try {
      const { profileId, customerEmail } = req.body;

      const profile = await prisma.hotspotProfile.findUnique({
        where: { id: profileId },
        include: { client: true },
      });

      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      if (!profile.isActive) {
        throw new AppError('Profile is not active', 400);
      }

      // Create pending ticket
      const username = generateRandomUsername('hotspot');
      const password = generateRandomPassword(8);

      const ticket = await prisma.hotspotTicket.create({
        data: {
          clientId: profile.clientId,
          profileId: profile.id,
          username,
          password,
          status: 'PENDING',
          purchaseEmail: customerEmail,
        },
      });

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          clientId: profile.clientId,
          ticketId: ticket.id,
          amount: Number(profile.price),
          currency: profile.currency,
          status: 'PENDING',
          paymentMethod: 'stripe',
          customerEmail,
        },
      });

      // Create Stripe checkout session
      const session = await stripeService.createCheckoutSession({
        profileId: profile.id,
        profileName: profile.name,
        price: Number(profile.price),
        currency: profile.currency,
        clientSlug: profile.client.slug,
        customerEmail,
        metadata: {
          ticketId: ticket.id,
          transactionId: transaction.id,
        },
      });

      // Update transaction with Stripe session ID
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          stripeSessionId: session.id,
        },
      });

      res.json({
        sessionId: session.id,
        sessionUrl: session.url,
        ticketId: ticket.id,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      const transaction = await prisma.transaction.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          ticket: {
            include: {
              profile: true,
              client: {
                include: {
                  mikrotikSettings: true,
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // Retrieve session from Stripe
      const session = await stripeService.retrieveSession(sessionId);

      if (session.payment_status === 'paid' && transaction.status === 'PENDING') {
        // Update transaction
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            paymentIntentId: session.payment_intent as string,
          },
        });

        // Activate ticket and create user in MikroTik
        const ticket = transaction.ticket;
        const mikrotikSettings = ticket.client.mikrotikSettings;

        if (mikrotikSettings) {
          try {
            const mikrotik = new MikrotikService({
              host: mikrotikSettings.host,
              port: mikrotikSettings.port,
              username: mikrotikSettings.username,
              password: mikrotikSettings.password,
              timeout: mikrotikSettings.timeout,
            });

            // Calculate expiry
            const now = new Date();
            const expiresAt = ticket.profile.duration
              ? new Date(now.getTime() + ticket.profile.duration * 1000)
              : null;

            // Create user in MikroTik
            await mikrotik.createHotspotUser({
              username: ticket.username,
              password: ticket.password,
              profile: ticket.profile.mikrotikProfile,
              limitUptime: ticket.profile.duration ? `${ticket.profile.duration}s` : undefined,
              limitBytesTotal: ticket.profile.dataLimit ? ticket.profile.dataLimit.toString() : undefined,
              comment: `Ticket ID: ${ticket.id}`,
            });

            // Update ticket
            await prisma.hotspotTicket.update({
              where: { id: ticket.id },
              data: {
                status: 'ACTIVE',
                purchasedAt: new Date(),
                activatedAt: new Date(),
                expiresAt,
              },
            });
          } catch (error: any) {
            console.error('Error creating MikroTik user:', error);
            // Update ticket but mark as error
            await prisma.hotspotTicket.update({
              where: { id: ticket.id },
              data: {
                status: 'PENDING',
                purchasedAt: new Date(),
              },
            });
          }
        }

        res.json({
          success: true,
          ticket: {
            id: ticket.id,
            username: ticket.username,
            password: ticket.password,
            status: 'ACTIVE',
          },
        });
      } else {
        res.json({
          success: false,
          status: transaction.status,
        });
      }
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getTicketById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const ticket = await prisma.hotspotTicket.findUnique({
        where: { id },
        include: {
          profile: true,
          client: true,
        },
      });

      if (!ticket) {
        throw new AppError('Ticket not found', 404);
      }

      res.json({
        ticket: {
          ...ticket,
          usedDataBytes: ticket.usedDataBytes ? ticket.usedDataBytes.toString() : '0',
        },
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getTicketsByClient(req: AuthRequest, res: Response) {
    try {
      const { clientId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      const where: any = { clientId };
      if (status) {
        where.status = status;
      }

      const tickets = await prisma.hotspotTicket.findMany({
        where,
        include: {
          profile: true,
          transaction: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: Number(limit),
        skip: Number(offset),
      });

      const total = await prisma.hotspotTicket.count({ where });

      res.json({
        tickets: tickets.map(t => ({
          ...t,
          usedDataBytes: t.usedDataBytes ? t.usedDataBytes.toString() : '0',
        })),
        total,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async cancelTicket(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const ticket = await prisma.hotspotTicket.findUnique({
        where: { id },
        include: {
          client: {
            include: {
              mikrotikSettings: true,
            },
          },
        },
      });

      if (!ticket) {
        throw new AppError('Ticket not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && ticket.client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      // Remove from MikroTik if active
      if (ticket.status === 'ACTIVE' && ticket.client.mikrotikSettings) {
        try {
          const mikrotik = new MikrotikService({
            host: ticket.client.mikrotikSettings.host,
            port: ticket.client.mikrotikSettings.port,
            username: ticket.client.mikrotikSettings.username,
            password: ticket.client.mikrotikSettings.password,
            timeout: ticket.client.mikrotikSettings.timeout,
          });

          await mikrotik.removeHotspotUser(ticket.username);
        } catch (error) {
          console.error('Error removing user from MikroTik:', error);
        }
      }

      // Update ticket status
      await prisma.hotspotTicket.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });

      res.json({ message: 'Ticket cancelled successfully' });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async handleStripeWebhook(req: AuthRequest, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const event = await stripeService.constructWebhookEvent(req.body, signature);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as any;
          // Handle successful payment
          // This is already handled in verifyPayment
          break;

        case 'payment_intent.succeeded':
          // Handle successful payment intent
          break;

        case 'payment_intent.payment_failed':
          // Handle failed payment
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TicketController();
