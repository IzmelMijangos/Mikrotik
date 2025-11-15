'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Información de tu Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-medium text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Correo Electrónico</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rol</p>
              <p className="font-medium text-gray-900">
                {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID de Usuario</p>
              <p className="font-medium text-gray-900 font-mono text-xs">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info (if exists) */}
        {user.client && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Tu Hotspot
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre del Negocio</p>
                <p className="font-medium text-gray-900">
                  {user.client.businessName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Slug</p>
                <p className="font-medium text-gray-900">
                  {user.client.slug}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-medium">
                  {user.client.isActive ? (
                    <span className="text-green-600">Activo</span>
                  ) : (
                    <span className="text-red-600">Inactivo</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Página del Hotspot</p>
                <Link
                  href={`/hotspot/${user.client.slug}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Ver Página
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.client && (
              <>
                <Link
                  href={`/hotspot/${user.client.slug}`}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition text-center"
                >
                  <div className="text-3xl mb-2">🌐</div>
                  <h3 className="font-semibold text-gray-800">
                    Ver Hotspot
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visita tu página de hotspot
                  </p>
                </Link>
                <Link
                  href={`/hotspot/${user.client.slug}/plans`}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition text-center"
                >
                  <div className="text-3xl mb-2">💳</div>
                  <h3 className="font-semibold text-gray-800">
                    Ver Planes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Administra tus planes de servicio
                  </p>
                </Link>
              </>
            )}
            <button
              onClick={() => alert('Funcionalidad en desarrollo')}
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition text-center"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-800">
                Configuración
              </h3>
              <p className="text-sm text-gray-600">
                Ajusta tu cuenta
              </p>
            </button>
          </div>
        </div>

        {/* Info Message for non-client users */}
        {!user.client && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Aún no tienes un hotspot configurado. Contacta con soporte
                  para configurar tu primer hotspot.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
