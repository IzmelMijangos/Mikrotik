'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import api from '@/lib/api';

interface Stats {
  totalClients: number;
  totalUsers: number;
  activeClients: number;
  totalProfiles: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        const userData = await authService.getCurrentUser();

        // Verify admin role
        if (userData.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }

        setUser(userData);

        // Load stats (you'll need to implement these endpoints in backend)
        try {
          const statsResponse = await api.get('/admin/stats');
          setStats(statsResponse.data);
        } catch (error) {
          console.error('Error loading stats:', error);
          // Set default stats if endpoint doesn't exist yet
          setStats({
            totalClients: 0,
            totalUsers: 0,
            activeClients: 0,
            totalProfiles: 0,
          });
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
              <p className="text-sm text-blue-100">Bienvenido, {user.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Clientes Activos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeClients}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl">👤</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Perfiles/Planes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProfiles}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Gestión del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => alert('Funcionalidad en desarrollo: Gestión de Clientes')}
              className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
            >
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Gestión de Clientes
              </h3>
              <p className="text-sm text-gray-600">
                Administra los clientes y sus hotspots
              </p>
            </button>

            <button
              onClick={() => alert('Funcionalidad en desarrollo: Gestión de Usuarios')}
              className="p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition text-left"
            >
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Gestión de Usuarios
              </h3>
              <p className="text-sm text-gray-600">
                Administra usuarios y permisos
              </p>
            </button>

            <button
              onClick={() => alert('Funcionalidad en desarrollo: Perfiles de Hotspot')}
              className="p-6 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition text-left"
            >
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Perfiles de Hotspot
              </h3>
              <p className="text-sm text-gray-600">
                Gestiona planes y perfiles de servicio
              </p>
            </button>

            <button
              onClick={() => alert('Funcionalidad en desarrollo: Configuración MikroTik')}
              className="p-6 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition text-left"
            >
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Configuración MikroTik
              </h3>
              <p className="text-sm text-gray-600">
                Administra conexiones a routers
              </p>
            </button>

            <button
              onClick={() => alert('Funcionalidad en desarrollo: Reportes')}
              className="p-6 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition text-left"
            >
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Reportes
              </h3>
              <p className="text-sm text-gray-600">
                Visualiza estadísticas y reportes
              </p>
            </button>

            <button
              onClick={() => alert('Funcionalidad en desarrollo: Configuración del Sistema')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition text-left"
            >
              <div className="text-3xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Configuración
              </h3>
              <p className="text-sm text-gray-600">
                Ajustes generales del sistema
              </p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Actividad Reciente
          </h2>
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📭</p>
            <p>No hay actividad reciente para mostrar</p>
            <p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
          </div>
        </div>
      </main>
    </div>
  );
}
