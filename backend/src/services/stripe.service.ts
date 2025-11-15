import Stripe from 'stripe';
import { config } from '../config/env';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-11-20.acacia',
});

export interface CreateCheckoutSessionParams {
  profileId: string;
  profileName: string;
  price: number;
  currency: string;
  clientSlug: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.profileName,
              description: `Acceso a Internet - ${params.profileName}`,
            },
            unit_amount: Math.round(params.price), // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${config.frontendUrl}/hotspot/${params.clientSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/hotspot/${params.clientSlug}/plans`,
      customer_email: params.customerEmail,
      metadata: {
        profileId: params.profileId,
        clientSlug: params.clientSlug,
        ...params.metadata,
      },
    });

    return session;
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    return stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      params.amount = Math.round(amount);
    }

    return stripe.refunds.create(params);
  }
}

export default new StripeService();
