# 🌐 MikroTik Hotspot SaaS Platform

Plataforma completa para administrar Hotspots MikroTik con venta de fichas integrada mediante Stripe.

## 📋 Descripción

Este es un sistema SaaS completo que permite a negocios administrar sus Hotspots MikroTik con las siguientes características:

- ✅ Portal de login externo personalizado para cada cliente
- ✅ Venta de fichas de acceso (vouchers) mediante tarjeta de crédito
- ✅ Integración completa con MikroTik RouterOS API
- ✅ Procesamiento de pagos con Stripe
- ✅ Panel administrativo para clientes
- ✅ Panel MASTER para administrador del SaaS
- ✅ Branding personalizado por cliente
- ✅ Multi-tenant (múltiples clientes)

## 🏗️ Arquitectura

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticación**: JWT
- **Pagos**: Stripe
- **MikroTik**: RouterOS API

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Estilos**: TailwindCSS
- **Estado**: Zustand (opcional)
- **HTTP Client**: Axios

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o cuenta en Neon)
- Cuenta de Stripe
- MikroTik Router con Hotspot configurado
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/IzmelMijangos/Mikrotik.git
cd mikrotik-hotspot-saas
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente de Prisma
npx prisma generate

# Sincronizar base de datos
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará corriendo en `http://localhost:3001`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en `http://localhost:3000`

## ⚙️ Configuración

### Variables de Entorno - Backend (.env)

```env
# Database
DATABASE_URL="postgresql://usuario:password@host/database?sslmode=require"

# JWT
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# MikroTik
MIKROTIK_DEFAULT_PORT=8728
MIKROTIK_USE_SSL=false
```

### Variables de Entorno - Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_stripe
```

### Configuración de Stripe

1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener las claves API (Dashboard > Developers > API keys)
3. Configurar webhook en Stripe:
   - URL: `https://tu-dominio.com/api/tickets/webhook`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`

### Configuración de MikroTik

1. Habilitar API en MikroTik:
```
/ip service enable api
/ip service set api port=8728
```

2. Crear usuario API:
```
/user add name=apiuser password=tu-password group=full
```

3. Configurar Hotspot:
```
/ip hotspot setup
# Seguir el asistente de configuración
```

4. Configurar Walled Garden para permitir acceso al portal:
```
/ip hotspot walled-garden
add dst-host=tu-dominio.com
add dst-host=api.stripe.com
```

## 📚 Uso

### Crear un Cliente (Negocio)

1. Registrarse como ADMIN o CLIENT
2. Crear un nuevo cliente con:
   - Nombre del negocio
   - Slug único (ej: "mi-cafe")
   - Logo (opcional)
   - Colores personalizados
   - Configuración de MikroTik (IP, usuario, password)

### Configurar Perfiles de Hotspot

1. Ir al panel de administración
2. Crear perfiles con:
   - Nombre (ej: "1 Hora", "1 Día")
   - Precio en centavos (ej: 2000 = $20.00)
   - Duración en segundos
   - Límite de datos (opcional)
   - Velocidad (opcional)

### Flujo de Compra de Ficha

1. Usuario accede a `https://tu-dominio.com/hotspot/[slug]`
2. Selecciona "Comprar Ficha"
3. Elige un plan
4. Ingresa email y paga con tarjeta (Stripe)
5. Recibe credenciales de acceso
6. Inicia sesión en el Hotspot

## 📁 Estructura del Proyecto

```
mikrotik-hotspot-saas/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración (DB, env)
│   │   ├── controllers/    # Controladores
│   │   ├── middlewares/    # Middlewares (auth, errors)
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios (MikroTik, Stripe)
│   │   ├── utils/          # Utilidades
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Schema de base de datos
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── hotspot/        # Portal público de hotspot
│   │   ├── dashboard/      # Panel cliente
│   │   ├── admin/          # Panel admin
│   │   └── layout.tsx
│   ├── lib/                # Librerías y servicios
│   └── package.json
└── README.md
```

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Passwords hasheados con bcrypt
- ✅ CORS configurado
- ✅ Validación de datos con Zod
- ✅ Variables de entorno para secretos
- ✅ HTTPS recomendado en producción

## 🗄️ Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema (ADMIN/CLIENT)
- **clients**: Negocios con hotspot
- **mikrotik_settings**: Configuración de MikroTik por cliente
- **hotspot_profiles**: Planes de acceso (1 hora, 1 día, etc.)
- **hotspot_tickets**: Fichas generadas
- **transactions**: Transacciones de pago
- **hotspot_logs**: Logs de actividad

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/register    - Registrar usuario
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/me          - Obtener usuario actual
```

### Clientes
```
POST   /api/clients          - Crear cliente
GET    /api/clients          - Listar clientes (ADMIN)
GET    /api/clients/:id      - Obtener cliente
PUT    /api/clients/:id      - Actualizar cliente
DELETE /api/clients/:id      - Eliminar cliente (ADMIN)
```

### Perfiles
```
POST   /api/profiles         - Crear perfil
GET    /api/profiles/client/:id - Listar perfiles de cliente
GET    /api/profiles/slug/:slug - Listar perfiles por slug (público)
PUT    /api/profiles/:id     - Actualizar perfil
DELETE /api/profiles/:id     - Eliminar perfil
```

### Tickets
```
POST   /api/tickets/checkout      - Crear sesión de pago
GET    /api/tickets/verify/:id    - Verificar pago
GET    /api/tickets/:id           - Obtener ticket
GET    /api/tickets/client/:id    - Listar tickets de cliente
DELETE /api/tickets/:id            - Cancelar ticket
```

## 🎨 Personalización

Cada cliente puede personalizar:
- Logo
- Color primario
- Color secundario
- Nombre del negocio
- Slug único (URL)

## 🚢 Deployment

### Backend (Railway, Render, VPS)

```bash
npm run build
npm start
```

### Frontend (Vercel, Netlify)

```bash
npm run build
```

### Base de Datos

Usar Neon, Supabase, o cualquier PostgreSQL compatible.

## 🔄 Flujo de MikroTik

1. Usuario se conecta a WiFi
2. MikroTik redirige a portal externo
3. Usuario compra ficha o inicia sesión
4. Backend crea usuario en MikroTik vía API
5. Usuario se conecta automáticamente

## 📝 Notas Importantes

- Configurar Walled Garden en MikroTik para permitir acceso al portal sin internet
- Usar HTTPS en producción
- Configurar Stripe webhooks correctamente
- Hacer backups regulares de la base de datos
- Monitorear logs de MikroTik

## 🐛 Troubleshooting

### Error de conexión con MikroTik
- Verificar que el puerto 8728 esté abierto
- Verificar credenciales de usuario API
- Verificar que el servicio API esté habilitado

### Pagos no se completan
- Verificar claves de Stripe
- Verificar que el webhook esté configurado
- Revisar logs en Stripe Dashboard

### Portal no carga
- Verificar que el cliente esté activo
- Verificar que el slug sea correcto
- Revisar configuración de DNS

## 📞 Soporte

Para reportar bugs o solicitar características, crear un issue en GitHub.

## 📄 Licencia

MIT License

## 👨‍💻 Autor

Desarrollado para administración de Hotspots MikroTik
