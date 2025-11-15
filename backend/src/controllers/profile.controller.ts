import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class ProfileController {
  async createProfile(req: AuthRequest, res: Response) {
    try {
      const { clientId, name, description, mikrotikProfile, price, currency, duration, dataLimit, speedLimit } = req.body;

      // Check if client exists
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

      // Create profile
      const profile = await prisma.hotspotProfile.create({
        data: {
          clientId,
          name,
          description,
          mikrotikProfile,
          price: Math.round(price * 100), // Convert to cents
          currency: currency || 'MXN',
          duration,
          dataLimit: dataLimit ? BigInt(dataLimit) : null,
          speedLimit,
        },
      });

      res.status(201).json({
        message: 'Profile created successfully',
        profile: {
          ...profile,
          price: Number(profile.price),
          dataLimit: profile.dataLimit ? profile.dataLimit.toString() : null,
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

  async getProfilesByClient(req: AuthRequest, res: Response) {
    try {
      const { clientId } = req.params;

      const profiles = await prisma.hotspotProfile.findMany({
        where: {
          clientId,
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      });

      res.json({
        profiles: profiles.map(p => ({
          ...p,
          price: Number(p.price),
          dataLimit: p.dataLimit ? p.dataLimit.toString() : null,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProfilesBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;

      const client = await prisma.client.findUnique({
        where: { slug },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }

      const profiles = await prisma.hotspotProfile.findMany({
        where: {
          clientId: client.id,
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      });

      res.json({
        profiles: profiles.map(p => ({
          ...p,
          price: Number(p.price),
          dataLimit: p.dataLimit ? p.dataLimit.toString() : null,
        })),
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getProfileById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const profile = await prisma.hotspotProfile.findUnique({
        where: { id },
        include: {
          client: true,
        },
      });

      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      res.json({
        profile: {
          ...profile,
          price: Number(profile.price),
          dataLimit: profile.dataLimit ? profile.dataLimit.toString() : null,
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

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, duration, dataLimit, speedLimit, isActive } = req.body;

      const profile = await prisma.hotspotProfile.findUnique({
        where: { id },
        include: { client: true },
      });

      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && profile.client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      const updatedProfile = await prisma.hotspotProfile.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(price && { price: Math.round(price * 100) }),
          ...(duration !== undefined && { duration }),
          ...(dataLimit !== undefined && { dataLimit: dataLimit ? BigInt(dataLimit) : null }),
          ...(speedLimit !== undefined && { speedLimit }),
          ...(typeof isActive === 'boolean' && { isActive }),
        },
      });

      res.json({
        message: 'Profile updated successfully',
        profile: {
          ...updatedProfile,
          price: Number(updatedProfile.price),
          dataLimit: updatedProfile.dataLimit ? updatedProfile.dataLimit.toString() : null,
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

  async deleteProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const profile = await prisma.hotspotProfile.findUnique({
        where: { id },
        include: { client: true },
      });

      if (!profile) {
        throw new AppError('Profile not found', 404);
      }

      // Check authorization
      if (req.user!.role !== 'ADMIN' && profile.client.userId !== req.user!.userId) {
        throw new AppError('Forbidden', 403);
      }

      await prisma.hotspotProfile.delete({
        where: { id },
      });

      res.json({ message: 'Profile deleted successfully' });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

export default new ProfileController();
