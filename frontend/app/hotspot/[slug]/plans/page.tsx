'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { hotspotService, Client, HotspotProfile } from '@/lib/hotspot';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PlansPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<Client | null>(null);
  const [profiles, setProfiles] = useState<HotspotProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const [clientData, profilesData] = await Promise.all([
        hotspotService.getClientBySlug(slug),
        hotspotService.getProfilesBySlug(slug),
      ]);
      setClient(clientData);
      setProfiles(profilesData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Ilimitado';
    const hours = Math.floor(seconds / 3600);
    if (hours < 24) return `${hours} horas`;
    const days = Math.floor(hours / 24);
    return `${days} días`;
  };

  const formatDataLimit = (bytes?: string) => {
    if (!bytes) return 'Ilimitado';
    const gb = parseInt(bytes) / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  };

  const handlePurchase = async (profileId: string) => {
    if (!purchaseEmail) {
      alert('Por favor ingresa tu correo electrónico');
      return;
    }

    setProcessing(true);
    try {
      const { sessionUrl } = await hotspotService.createCheckoutSession(
        profileId,
        purchaseEmail
      );

      // Redirect to Stripe Checkout
      window.location.href = sessionUrl;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al procesar el pago');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Portal no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: `linear-gradient(135deg, ${client.primaryColor} 0%, ${client.secondaryColor} 100%)`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {client.logo ? (
            <div className="relative h-20 w-20 mx-auto mb-4">
              <Image
                src={client.logo}
                alt={client.businessName}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div
              className="h-20 w-20 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {client.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-4xl font-bold text-white mb-2">
            Planes de Acceso
          </h1>
          <p className="text-white/90">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        {/* Email Input */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico (para recibir tu ficha)
            </label>
            <input
              type="email"
              value={purchaseEmail}
              onChange={(e) => setPurchaseEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {profile.name}
                </h3>
                {profile.description && (
                  <p className="text-gray-600 text-sm">{profile.description}</p>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold" style={{ color: client.primaryColor }}>
                  {formatPrice(profile.price, profile.currency)}
                </div>
                <div className="text-gray-500 text-sm mt-1">pago único</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-3"
                    style={{ color: client.primaryColor }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Tiempo: {formatDuration(profile.duration)}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-3"
                    style={{ color: client.primaryColor }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Datos: {formatDataLimit(profile.dataLimit)}</span>
                </div>

                {profile.speedLimit && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-3"
                      style={{ color: client.primaryColor }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Velocidad: {profile.speedLimit}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handlePurchase(profile.id)}
                disabled={processing || !purchaseEmail}
                className="w-full py-3 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: client.primaryColor }}
              >
                {processing ? 'Procesando...' : 'Comprar Ahora'}
              </button>
            </div>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center text-white">
            <p className="text-xl">No hay planes disponibles en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
