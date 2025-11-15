import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { hashPassword } from '../utils/password';

export class ClientController {
  async createClient(req: AuthRequest, res: Response) {
    try {
      const { businessName, slug, logo, primaryColor, secondaryColor, mikrotikSettings } = req.body;

      // Check if slug is already taken
      const existingClient = await prisma.client.findUnique({
        where: { slug },
      });

      if (existingClient) {
        throw new AppError('Slug already taken', 400);
      }

      // Create client
      const client = await prisma.client.create({
        data: {
          userId: req.user!.userId,
          businessName,
          slug,
          logo,
          primaryColor: primaryColor || '#3B82F6',
          secondaryColor: secondaryColor || '#1E40AF',
          ...(mikrotikSettings && {
            mikrotikSettings: {
              create: {
                host: mikrotikSettings.host,
                port: mikrotikSettings.port || 8728,
                username: mikrotikSettings.username,
                password: await hashPassword(mikrotikSettings.password), // Encrypt password
                useSsl: mikrotikSettings.useSsl || false,
                timeout: mikrotikSettings.timeout || 5000,
              },
            },
          }),
        },
        include: {
          mikrotikSettings: true,
        },
      });

      res.status(201).json({
        message: 'Client created successfully',
        client,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllClients(req: AuthRequest, res: Response) {
    try {
      const clients = await prisma.client.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          mikrotikSettings: true,
          _count: {
            select: {
              hotspotProfiles: true,
              hotspotTickets: true,
              transactions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({ clients });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getClientById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          mikrotikSettings: true,
          hotspotProfiles: true,
        },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      res.json({ client });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getClientBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;

      const client = await prisma.client.findUnique({
        where: { slug },
        select: {
          id: true,
          businessName: true,
          slug: true,
          logo: true,
          primaryColor: true,
          secondaryColor: true,
          isActive: true,
        },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      if (!client.isActive) {
        throw new AppError('Client is not active', 403);
      }

      res.json({ client });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { businessName, logo, primaryColor, secondaryColor, isActive } = req.body;

      const client = await prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      const updatedClient = await prisma.client.update({
        where: { id },
        data: {
          ...(businessName && { businessName }),
          ...(logo && { logo }),
          ...(primaryColor && { primaryColor }),
          ...(secondaryColor && { secondaryColor }),
          ...(typeof isActive === 'boolean' && { isActive }),
        },
        include: {
          mikrotikSettings: true,
        },
      });

      res.json({
        message: 'Client updated successfully',
        client: updatedClient,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async deleteClient(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const client = await prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      await prisma.client.delete({
        where: { id },
      });

      res.json({ message: 'Client deleted successfully' });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateMikrotikSettings(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { host, port, username, password, useSsl, timeout } = req.body;

      const client = await prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      const settings = await prisma.mikrotikSettings.upsert({
        where: { clientId: id },
        create: {
          clientId: id,
          host,
          port: port || 8728,
          username,
          password: await hashPassword(password),
          useSsl: useSsl || false,
          timeout: timeout || 5000,
        },
        update: {
          ...(host && { host }),
          ...(port && { port }),
          ...(username && { username }),
          ...(password && { password: await hashPassword(password) }),
          ...(typeof useSsl === 'boolean' && { useSsl }),
          ...(timeout && { timeout }),
        },
      });

      res.json({
        message: 'MikroTik settings updated successfully',
        settings: {
          ...settings,
          password: undefined, // Don't return password
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
}

export default new ClientController();
