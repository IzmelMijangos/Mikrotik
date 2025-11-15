'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hotspotService, Client } from '@/lib/hotspot';
import Image from 'next/image';

export default function HotspotPortal() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClient();
  }, [slug]);

  const loadClient = async () => {
    try {
      const data = await hotspotService.getClientBySlug(slug);
      setClient(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar el portal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
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
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${client.primaryColor} 0%, ${client.secondaryColor} 100%)`,
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          {client.logo ? (
            <div className="relative h-24 w-24 mx-auto mb-4">
              <Image
                src={client.logo}
                alt={client.businessName}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div
              className="h-24 w-24 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: client.primaryColor }}
            >
              {client.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {client.businessName}
          </h1>
          <p className="text-gray-600 mt-2">Bienvenido al portal WiFi</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <button
            onClick={() => router.push(`/hotspot/${slug}/plans`)}
            className="w-full py-4 rounded-lg font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: client.primaryColor }}
          >
            Comprar Ficha de Acceso
          </button>

          <button
            onClick={() => router.push(`/hotspot/${slug}/login`)}
            className="w-full py-4 rounded-lg font-semibold border-2 transition hover:bg-gray-50"
            style={{
              borderColor: client.primaryColor,
              color: client.primaryColor,
            }}
          >
            Ya tengo ficha - Iniciar Sesión
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Conectado de forma segura</p>
        </div>
      </div>
    </div>
  );
}
