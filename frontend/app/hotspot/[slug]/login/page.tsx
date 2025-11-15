'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { hotspotService, Client } from '@/lib/hotspot';
import Image from 'next/image';

export default function HotspotLoginPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<Client | null>(null);
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [password, setPassword] = useState(searchParams.get('password') || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // This would normally redirect to MikroTik login page
    // For now, we'll create a form and submit it to MikroTik
    // The actual implementation depends on your MikroTik configuration

    // Example: Redirect to MikroTik login with credentials
    // This is a placeholder - you'll need to adjust based on your MikroTik setup
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://192.168.88.1/login'; // Replace with your MikroTik IP

    const usernameInput = document.createElement('input');
    usernameInput.type = 'hidden';
    usernameInput.name = 'username';
    usernameInput.value = username;

    const passwordInput = document.createElement('input');
    passwordInput.type = 'hidden';
    passwordInput.name = 'password';
    passwordInput.value = password;

    const dstInput = document.createElement('input');
    dstInput.type = 'hidden';
    dstInput.name = 'dst';
    dstInput.value = '';

    form.appendChild(usernameInput);
    form.appendChild(passwordInput);
    form.appendChild(dstInput);

    document.body.appendChild(form);
    form.submit();

    setSubmitting(false);
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
            Iniciar Sesión
          </h1>
          <p className="text-gray-600 mt-2">
            Ingresa con tu ficha de acceso
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRing: client.primaryColor }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: client.primaryColor }}
          >
            {submitting ? 'Conectando...' : 'Conectar'}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una ficha?{' '}
            <a
              href={`/hotspot/${slug}/plans`}
              className="font-semibold hover:underline"
              style={{ color: client.primaryColor }}
            >
              Comprar ahora
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{client.businessName}</p>
          <p className="mt-1">Conexión segura</p>
        </div>
      </div>
    </div>
  );
}
