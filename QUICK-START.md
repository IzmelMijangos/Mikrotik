# 🚀 Guía de Inicio Rápido - MikroTik Hotspot SaaS

Esta guía te permitirá tener el sistema funcionando en menos de 10 minutos.

## ⚡ Instalación Express

### 1. Requisitos Previos

```bash
# Verificar versiones
node --version  # Debe ser 18+
npm --version
```

### 2. Clonar y Configurar Backend

```bash
# Clonar repositorio
git clone https://github.com/IzmelMijangos/Mikrotik.git
cd Mikrotik/backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# IMPORTANTE: Editar .env con tu información
# Especialmente DATABASE_URL, JWT_SECRET, y STRIPE_SECRET_KEY
nano .env  # o usa tu editor favorito

# Generar cliente de Prisma y sincronizar BD
npx prisma generate
npx prisma db push

# Poblar base de datos con datos de demo (OPCIONAL)
npm run prisma:seed

# Iniciar servidor
npm run dev
```

El backend estará corriendo en **http://localhost:3001** ✅

### 3. Configurar Frontend

```bash
# En otra terminal
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.local.example .env.local

# Editar .env.local
nano .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará corriendo en **http://localhost:3000** ✅

## 🎮 Probar el Sistema

### Opción A: Con Datos de Demo (Recomendado)

Si ejecutaste el seed (`npm run prisma:seed`), ya tienes datos de prueba:

#### 1. Portal de Hotspot Demo

Visita: **http://localhost:3000/hotspot/cafe-demo**

- Verás el portal personalizado de "Café WiFi Demo"
- Puedes ver los planes disponibles
- Puedes simular una compra (necesitas Stripe configurado)

#### 2. Iniciar Sesión como Cliente

Visita: **http://localhost:3000/auth/login**

Credenciales:
- Email: `demo@cafewifi.com`
- Password: `demo123`

#### 3. Iniciar Sesión como Admin

Credenciales:
- Email: `admin@hotspot.com`
- Password: `admin123`

### Opción B: Crear Tu Propio Cliente

#### 1. Registrarse

1. Ir a **http://localhost:3000/auth/register**
2. Crear una cuenta

#### 2. Crear Cliente (Backend)

Usando curl o Postman:

```bash
# Obtener token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tupassword"}' \
  | jq -r '.token')

# Crear cliente
curl -X POST http://localhost:3001/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Mi Negocio",
    "slug": "mi-negocio",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "mikrotikSettings": {
      "host": "192.168.1.1",
      "port": 8728,
      "username": "apiuser",
      "password": "mikrotikpass"
    }
  }'
```

#### 3. Crear Perfiles de Hotspot

```bash
curl -X POST http://localhost:3001/api/profiles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "ID_DE_TU_CLIENTE",
    "name": "1 Hora",
    "description": "Acceso por 1 hora",
    "mikrotikProfile": "1-hora",
    "price": 20.00,
    "currency": "MXN",
    "duration": 3600
  }'
```

#### 4. Acceder al Portal

Visita: **http://localhost:3000/hotspot/mi-negocio**

## 🔧 Configuración de Stripe (Para Pagos)

### 1. Crear Cuenta

1. Ir a https://stripe.com
2. Crear cuenta
3. Activar modo de prueba

### 2. Obtener Claves API

1. Dashboard > Developers > API keys
2. Copiar:
   - **Publishable key** → Frontend `.env.local`
   - **Secret key** → Backend `.env`

### 3. Configurar Webhook

1. Dashboard > Developers > Webhooks
2. Agregar endpoint: `http://localhost:3001/api/tickets/webhook`
3. Eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copiar **Signing secret** → Backend `.env`

### 4. Probar Pago

Usa tarjetas de prueba de Stripe:
- **Éxito**: 4242 4242 4242 4242
- **Fallo**: 4000 0000 0000 0002

## 📱 Configurar MikroTik

Ver guía completa en: `docs/MIKROTIK-SETUP.md`

Configuración mínima:

```bash
# En terminal de MikroTik
/ip service enable api
/user add name=apiuser password=tupassword group=full

# Crear perfil
/ip hotspot user profile add name="1-hora" session-timeout=1h

# Configurar Walled Garden
/ip hotspot walled-garden add dst-host=localhost
```

## 🎯 Flujo Completo

### Para el Usuario Final:

1. Se conecta a WiFi del Hotspot
2. Es redirigido a: `http://localhost:3000/hotspot/mi-negocio`
3. Click en "Comprar Ficha"
4. Selecciona un plan
5. Ingresa email y paga con tarjeta
6. Recibe credenciales (usuario/contraseña)
7. Inicia sesión en el Hotspot
8. Navega por Internet ✅

### Para el Administrador del Negocio:

1. Login en: `http://localhost:3000/auth/login`
2. Ve dashboard con:
   - Estadísticas de ventas
   - Fichas generadas
   - Usuarios activos
   - Transacciones
3. Puede:
   - Crear/editar planes
   - Personalizar portal
   - Ver reportes
   - Gestionar fichas

### Para el Admin del SaaS:

1. Login como ADMIN
2. Ve todos los clientes
3. Puede:
   - Crear nuevos clientes
   - Ver métricas globales
   - Gestionar configuraciones

## 📊 Estructura de URLs

```
Frontend:
http://localhost:3000/                          # Página principal
http://localhost:3000/auth/login                # Login admin/cliente
http://localhost:3000/auth/register             # Registro
http://localhost:3000/hotspot/[slug]            # Portal de hotspot
http://localhost:3000/hotspot/[slug]/plans      # Planes disponibles
http://localhost:3000/hotspot/[slug]/login      # Login de usuario final
http://localhost:3000/hotspot/[slug]/success    # Confirmación de pago
http://localhost:3000/dashboard                 # Panel cliente
http://localhost:3000/admin                     # Panel admin

Backend API:
http://localhost:3001/health                    # Health check
http://localhost:3001/api/auth/*                # Autenticación
http://localhost:3001/api/clients/*             # Clientes
http://localhost:3001/api/profiles/*            # Perfiles
http://localhost:3001/api/tickets/*             # Tickets/Fichas
```

## 🔍 Verificar que Todo Funciona

### Backend

```bash
# Health check
curl http://localhost:3001/health

# Debería responder:
# {"status":"ok","timestamp":"..."}
```

### Frontend

Abrir navegador en: http://localhost:3000

Deberías ver la página principal con botones de "Iniciar Sesión" y "Registrarse"

### Base de Datos

```bash
cd backend
npx prisma studio
```

Se abrirá en: http://localhost:5555
Podrás ver todas las tablas y datos

### MikroTik (Opcional)

```bash
# Desde terminal de MikroTik
/ip hotspot user print

# Debería mostrar los usuarios creados por el sistema
```

## 🐛 Problemas Comunes

### Backend no inicia

```bash
# Verificar puerto 3001
lsof -i :3001

# Si está ocupado, cambiar en .env
PORT=3002
```

### Frontend no inicia

```bash
# Verificar puerto 3000
lsof -i :3000

# Limpiar cache
rm -rf .next
npm run dev
```

### Error de base de datos

```bash
# Regenerar cliente de Prisma
npx prisma generate

# Re-sincronizar
npx prisma db push
```

### Error de MikroTik

1. Verificar que el servicio API esté habilitado
2. Verificar credenciales en `.env`
3. Verificar que el puerto 8728 esté abierto
4. Verificar firewall de MikroTik

## 📚 Siguiente Pasos

1. **Configurar Stripe** para pagos reales
2. **Configurar MikroTik** con tu router real
3. **Personalizar** el portal (logo, colores)
4. **Crear planes** de acceso
5. **Configurar dominio** propio
6. **Hacer deploy** en producción

## 🚀 Deploy en Producción

Ver guía completa en: `README.md` sección Deployment

Recomendaciones:
- **Backend**: Railway, Render, o VPS
- **Frontend**: Vercel, Netlify
- **Base de Datos**: Neon, Supabase, o Railway
- **Dominio**: Namecheap, GoDaddy
- **SSL**: Obligatorio (Let's Encrypt gratis)

## 💡 Tips

1. Usa el **seed** para datos de prueba
2. Usa **Prisma Studio** para ver/editar la BD
3. Activa **modo de prueba** en Stripe
4. Usa **Walled Garden** para el portal
5. Configura **webhooks** de Stripe correctamente
6. Revisa **logs** en caso de errores
7. Usa **Postman** para probar la API

## 📞 Soporte

- **Documentación**: `README.md`
- **API**: `docs/API-EXAMPLES.md`
- **MikroTik**: `docs/MIKROTIK-SETUP.md`
- **GitHub**: https://github.com/IzmelMijangos/Mikrotik

## ✅ Checklist de Inicio

- [ ] Node.js 18+ instalado
- [ ] Backend corriendo en :3001
- [ ] Frontend corriendo en :3000
- [ ] Base de datos sincronizada
- [ ] Datos de seed cargados (opcional)
- [ ] Stripe configurado (para pagos)
- [ ] MikroTik configurado (para producción)
- [ ] Portal de prueba accesible
- [ ] Login funcionando
- [ ] Creación de tickets funcionando

¡Listo! Ya tienes el sistema completo funcionando 🎉
