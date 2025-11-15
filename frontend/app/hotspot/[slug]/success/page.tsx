'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { hotspotService, Client } from '@/lib/hotspot';
import Image from 'next/image';

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const sessionId = searchParams.get('session_id');

  const [client, setClient] = useState<Client | null>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError('Sesión no válida');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const [clientData, paymentData] = await Promise.all([
        hotspotService.getClientBySlug(slug),
        hotspotService.verifyPayment(sessionId!),
      ]);

      setClient(clientData);

      if (paymentData.success) {
        setTicket(paymentData.ticket);
      } else {
        setError('El pago no ha sido completado');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al verificar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push(`/hotspot/${slug}/login?username=${ticket.username}&password=${ticket.password}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'No se pudo verificar el pago'}</p>
          <button
            onClick={() => router.push(`/hotspot/${slug}/plans`)}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{
        background: `linear-gradient(135deg, ${client.primaryColor} 0%, ${client.secondaryColor} 100%)`,
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4"
            style={{ backgroundColor: client.primaryColor }}
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu ficha de acceso ha sido generada
          </p>
        </div>

        {/* Logo */}
        {client.logo && (
          <div className="relative h-16 w-16 mx-auto mb-6">
            <Image
              src={client.logo}
              alt={client.businessName}
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* Credentials */}
        {ticket && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Tus Credenciales de Acceso
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Usuario:
                </label>
                <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
                  <span className="font-mono text-gray-800">{ticket.username}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(ticket.username)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contraseña:
                </label>
                <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
                  <span className="font-mono text-gray-800">{ticket.password}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(ticket.password)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                También hemos enviado estas credenciales a tu correo electrónico.
                Guárdalas en un lugar seguro.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: client.primaryColor }}
          >
            Iniciar Sesión Ahora
          </button>

          <button
            onClick={() => router.push(`/hotspot/${slug}`)}
            className="w-full py-3 rounded-lg font-semibold border-2 transition hover:bg-gray-50"
            style={{
              borderColor: client.primaryColor,
              color: client.primaryColor,
            }}
          >
            Volver al Portal
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>{client.businessName}</p>
        </div>
      </div>
    </div>
  );
}
