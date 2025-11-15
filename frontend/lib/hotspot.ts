import api from './api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Client {
  id: string;
  businessName: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
}

export interface HotspotProfile {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration?: number;
  dataLimit?: string;
  speedLimit?: string;
  isActive: boolean;
}

export const hotspotService = {
  async getClientBySlug(slug: string): Promise<Client> {
    // Public endpoint - no auth required
    const response = await axios.get(`${API_URL}/public/client/${slug}`);
    return response.data.client;
  },

  async getProfilesBySlug(slug: string): Promise<HotspotProfile[]> {
    // Public endpoint - no auth required
    const response = await axios.get(`${API_URL}/profiles/slug/${slug}`);
    return response.data.profiles;
  },

  async createCheckoutSession(profileId: string, customerEmail?: string) {
    // Public endpoint - no auth required
    const response = await axios.post(`${API_URL}/tickets/checkout`, {
      profileId,
      customerEmail,
    });
    return response.data;
  },

  async verifyPayment(sessionId: string) {
    // Public endpoint - no auth required
    const response = await axios.get(`${API_URL}/tickets/verify/${sessionId}`);
    return response.data;
  },
};
