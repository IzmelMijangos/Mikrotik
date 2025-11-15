# 📡 Ejemplos de API - MikroTik Hotspot SaaS

Esta guía contiene ejemplos prácticos de cómo usar la API del sistema.

## 🔐 Autenticación

### Registrar un nuevo usuario

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "password123"
  }'
```

**Respuesta:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clxx1234567890",
    "email": "juan@ejemplo.com",
    "name": "Juan Pérez",
    "role": "CLIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Iniciar sesión

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "password123"
  }'
```

### Obtener usuario actual

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🏢 Gestión de Clientes

### Crear un nuevo cliente (negocio)

```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Café WiFi",
    "slug": "cafe-wifi",
    "logo": "https://ejemplo.com/logo.png",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "mikrotikSettings": {
      "host": "192.168.1.1",
      "port": 8728,
      "username": "apiuser",
      "password": "mikrotik123"
    }
  }'
```

### Obtener cliente por ID

```bash
curl -X GET http://localhost:3001/api/clients/clxx1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener cliente por slug (público)

```bash
curl -X GET http://localhost:3001/api/public/client/cafe-wifi
```

**Respuesta:**
```json
{
  "client": {
    "id": "clxx1234567890",
    "businessName": "Café WiFi",
    "slug": "cafe-wifi",
    "logo": "https://ejemplo.com/logo.png",
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "isActive": true
  }
}
```

### Actualizar cliente

```bash
curl -X PUT http://localhost:3001/api/clients/clxx1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Café WiFi Premium",
    "primaryColor": "#10B981"
  }'
```

### Actualizar configuración de MikroTik

```bash
curl -X PUT http://localhost:3001/api/clients/clxx1234567890/mikrotik \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "192.168.1.1",
    "port": 8728,
    "username": "apiuser",
    "password": "newpassword123"
  }'
```

## 📋 Gestión de Perfiles

### Crear un perfil de Hotspot

```bash
curl -X POST http://localhost:3001/api/profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "clxx1234567890",
    "name": "1 Hora",
    "description": "Acceso por 1 hora a velocidad media",
    "mikrotikProfile": "1-hora",
    "price": 20.00,
    "currency": "MXN",
    "duration": 3600,
    "dataLimit": 1073741824,
    "speedLimit": "2M/2M"
  }'
```

**Nota:** El precio se guarda en centavos (20.00 = 2000 centavos)

### Obtener perfiles de un cliente

```bash
curl -X GET http://localhost:3001/api/profiles/client/clxx1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener perfiles por slug (público)

```bash
curl -X GET http://localhost:3001/api/profiles/slug/cafe-wifi
```

**Respuesta:**
```json
{
  "profiles": [
    {
      "id": "prof_123",
      "name": "1 Hora",
      "description": "Acceso por 1 hora",
      "price": 2000,
      "currency": "MXN",
      "duration": 3600,
      "dataLimit": "1073741824",
      "speedLimit": "2M/2M",
      "isActive": true
    }
  ]
}
```

### Actualizar perfil

```bash
curl -X PUT http://localhost:3001/api/profiles/prof_123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 25.00,
    "description": "Acceso por 1 hora a alta velocidad"
  }'
```

## 🎫 Gestión de Tickets (Fichas)

### Crear sesión de pago (público)

```bash
curl -X POST http://localhost:3001/api/tickets/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "prof_123",
    "customerEmail": "cliente@ejemplo.com"
  }'
```

**Respuesta:**
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6",
  "sessionUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "ticketId": "ticket_789"
}
```

### Verificar pago (público)

```bash
curl -X GET http://localhost:3001/api/tickets/verify/cs_test_a1b2c3d4e5f6
```

**Respuesta (pago exitoso):**
```json
{
  "success": true,
  "ticket": {
    "id": "ticket_789",
    "username": "hotspot_abc123",
    "password": "xyz789",
    "status": "ACTIVE"
  }
}
```

### Obtener ticket por ID

```bash
curl -X GET http://localhost:3001/api/tickets/ticket_789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Listar tickets de un cliente

```bash
curl -X GET "http://localhost:3001/api/tickets/client/clxx1234567890?status=ACTIVE&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Parámetros de query:**
- `status`: PENDING, ACTIVE, USED, EXPIRED, CANCELLED
- `limit`: número de resultados (default: 50)
- `offset`: offset para paginación (default: 0)

**Respuesta:**
```json
{
  "tickets": [
    {
      "id": "ticket_789",
      "username": "hotspot_abc123",
      "password": "xyz789",
      "status": "ACTIVE",
      "purchaseEmail": "cliente@ejemplo.com",
      "purchasedAt": "2024-11-14T10:30:00.000Z",
      "expiresAt": "2024-11-14T11:30:00.000Z",
      "profile": {
        "name": "1 Hora",
        "price": 2000
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Cancelar ticket

```bash
curl -X DELETE http://localhost:3001/api/tickets/ticket_789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 💳 Webhooks de Stripe

### Endpoint de webhook

```
POST http://localhost:3001/api/tickets/webhook
```

Stripe enviará eventos automáticamente. Asegúrate de:
1. Configurar el webhook en Stripe Dashboard
2. Copiar el signing secret a tu `.env`
3. Agregar los eventos: `checkout.session.completed`, `payment_intent.succeeded`

## 🧪 Ejemplos con JavaScript/Node.js

### Crear cliente con fetch

```javascript
const createClient = async () => {
  const response = await fetch('http://localhost:3001/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      businessName: 'Mi Negocio',
      slug: 'mi-negocio',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      mikrotikSettings: {
        host: '192.168.1.1',
        port: 8728,
        username: 'apiuser',
        password: 'password123'
      }
    })
  });

  const data = await response.json();
  console.log(data);
};
```

### Obtener perfiles públicos

```javascript
const getProfiles = async (slug) => {
  const response = await fetch(
    `http://localhost:3001/api/profiles/slug/${slug}`
  );
  const data = await response.json();
  return data.profiles;
};
```

### Crear checkout de Stripe

```javascript
const createCheckout = async (profileId, email) => {
  const response = await fetch('http://localhost:3001/api/tickets/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      profileId,
      customerEmail: email
    })
  });

  const data = await response.json();

  // Redirigir a Stripe Checkout
  window.location.href = data.sessionUrl;
};
```

## 🔍 Códigos de Estado HTTP

- `200` - OK
- `201` - Created (recurso creado exitosamente)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error (error del servidor)

## 📊 Formato de Errores

```json
{
  "error": "Mensaje descriptivo del error"
}
```

Con validación (usando Zod):
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Required"
    }
  ]
}
```

## 💡 Tips

1. **Tokens**: Los tokens JWT expiran en 7 días por defecto
2. **Precios**: Siempre enviar precios en centavos (20.00 = 2000)
3. **Datos**: Los límites de datos se guardan en bytes
4. **Duración**: La duración se especifica en segundos
5. **Slugs**: Los slugs deben ser únicos y URL-friendly

## 🔗 Integración con Frontend

### React/Next.js

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Uso
import api from '@/lib/api';

const createProfile = async (data) => {
  const response = await api.post('/profiles', data);
  return response.data;
};
```

## 📝 Notas Importantes

- Todos los endpoints protegidos requieren el header `Authorization: Bearer TOKEN`
- Los endpoints públicos no requieren autenticación
- Los precios siempre se manejan en centavos
- Las fechas están en formato ISO 8601
- Los BigInt se convierten a string en JSON

## 🚀 Testing

### Con Postman

1. Importar la colección de endpoints
2. Configurar variable de entorno `API_URL`
3. Configurar variable de entorno `TOKEN`
4. Ejecutar requests

### Con curl

```bash
# Guardar token en variable
TOKEN="tu_token_aqui"

# Usar en requests
curl -X GET http://localhost:3001/api/clients \
  -H "Authorization: Bearer $TOKEN"
```
