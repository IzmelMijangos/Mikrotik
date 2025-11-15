# 📡 Configuración de MikroTik para Hotspot SaaS

Esta guía te ayudará a configurar tu MikroTik RouterBoard para trabajar con la plataforma SaaS de Hotspot.

## 🔧 Requisitos Previos

- MikroTik RouterBoard con RouterOS 6.x o superior
- Acceso administrativo al router
- IP pública o DNS dinámico (para acceso API)
- Conexión a Internet

## 📋 Paso 1: Habilitar API

### Vía WinBox/WebFig

1. Ir a **IP > Services**
2. Encontrar el servicio **api**
3. Hacer doble clic y marcar **Enabled**
4. Puerto por defecto: **8728**

### Vía Terminal

```bash
/ip service enable api
/ip service set api port=8728
```

## 👤 Paso 2: Crear Usuario API

### Vía Terminal

```bash
# Crear grupo de API
/user group add name=api-users policy=read,write,test,api

# Crear usuario para la API
/user add name=apiuser password=TuPasswordSegura123 group=api-users
```

### Permisos Recomendados

Para la API del SaaS, necesitamos los siguientes permisos:
- **read**: Leer configuración
- **write**: Crear/modificar usuarios
- **test**: Probar conexiones
- **api**: Acceso a la API

## 🌐 Paso 3: Configurar Hotspot

### Configuración Básica

```bash
# Iniciar asistente de Hotspot
/ip hotspot setup

# Responder las siguientes preguntas:
# hotspot interface: [seleccionar tu interfaz LAN, ej: ether2]
# local address of network: 10.5.50.1/24
# address pool of network: 10.5.50.2-10.5.50.254
# select certificate: none
# ip address of smtp server: 0.0.0.0
# dns servers: 8.8.8.8
# dns name: hotspot.local
# name of local hotspot user: admin
# password for user: [dejar en blanco]
```

### Configuración Avanzada

```bash
# Configurar tiempo de inactividad
/ip hotspot profile
set default idle-timeout=5m keepalive-timeout=5m

# Configurar página de login
/ip hotspot profile
set default login-by=http-chap,http-pap
```

## 🔒 Paso 4: Configurar Walled Garden

El Walled Garden permite acceso a ciertos sitios sin autenticación. Esto es crucial para el portal de pagos.

```bash
# Permitir acceso al portal
/ip hotspot walled-garden
add dst-host=tu-dominio.com comment="Portal de Hotspot"
add dst-host=*.tu-dominio.com comment="Subdominios del portal"

# Permitir Stripe para pagos
add dst-host=*.stripe.com comment="Stripe Payment"
add dst-host=*.stripe.network comment="Stripe Network"
add dst-host=js.stripe.com comment="Stripe JS"

# Permitir servicios esenciales
add dst-host=*.google.com comment="Google Services"
add dst-host=*.facebook.com comment="Facebook Login"
```

### Permitir por IP (alternativa)

```bash
/ip hotspot walled-garden ip
add action=accept dst-address=104.16.0.0/12 comment="Cloudflare CDN"
```

## 📱 Paso 5: Configurar Redirección al Portal Externo

### Método 1: HTML personalizado

1. Crear archivo HTML personalizado
2. Subir a MikroTik vía FTP
3. Configurar en Hotspot Profile

```bash
# Configurar redirect
/ip hotspot profile
set default html-directory=hotspot-custom
```

### Método 2: Redirección automática

Configurar la página de login para redirigir automáticamente:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://tu-dominio.com/hotspot/tu-slug?mac=$(mac)&ip=$(ip)">
</head>
<body>
    Redirigiendo...
</body>
</html>
```

## 🔐 Paso 6: Crear Perfiles de Usuario

Crear perfiles que coincidan con los planes del SaaS:

```bash
# Perfil 1 Hora
/ip hotspot user profile
add name="1-hora" session-timeout=1h rate-limit="2M/2M"

# Perfil 1 Día
/ip hotspot user profile
add name="1-dia" session-timeout=1d rate-limit="5M/5M"

# Perfil 1 Semana
/ip hotspot user profile
add name="1-semana" session-timeout=7d rate-limit="10M/10M"

# Perfil con límite de datos
/ip hotspot user profile
add name="5gb-plan" shared-users=1 rate-limit="10M/10M" \
    add-mac-cookie=yes keepalive-timeout=5m
```

### Parámetros Importantes

- **session-timeout**: Tiempo máximo de sesión (formato: XdXhXmXs)
- **idle-timeout**: Tiempo de inactividad antes de desconectar
- **rate-limit**: Límite de velocidad (upload/download)
- **shared-users**: Número de sesiones simultáneas

## 🛡️ Paso 7: Configurar Firewall

```bash
# Permitir API desde IP específica
/ip firewall filter
add chain=input protocol=tcp dst-port=8728 src-address=TU-IP-SERVIDOR \
    action=accept comment="API Access"

# Bloquear API desde otras IPs
/ip firewall filter
add chain=input protocol=tcp dst-port=8728 action=drop \
    comment="Block API from others"
```

## 🌍 Paso 8: Configurar NAT (si es necesario)

Si tu servidor está detrás de NAT:

```bash
# Port forwarding para API
/ip firewall nat
add chain=dstnat dst-port=8728 protocol=tcp \
    to-addresses=192.168.1.100 to-ports=8728 \
    comment="API Port Forward"
```

## 📊 Paso 9: Verificar Configuración

### Verificar API

```bash
# Desde terminal MikroTik
/system resource print

# Debería responder con información del sistema
```

### Verificar Hotspot

```bash
# Listar perfiles
/ip hotspot user profile print

# Listar usuarios activos
/ip hotspot active print
```

## 🔍 Paso 10: Solución de Problemas

### API no responde

```bash
# Verificar servicio API
/ip service print detail

# Verificar que esté habilitado y en el puerto correcto
```

### Usuarios no se crean

```bash
# Verificar permisos del usuario API
/user print detail

# El usuario debe tener permisos: read, write, test, api
```

### Walled Garden no funciona

```bash
# Listar reglas de Walled Garden
/ip hotspot walled-garden print

# Verificar que los dominios estén correctos
# Probar con IPs en lugar de dominios si es necesario
```

### Logs de Hotspot

```bash
# Ver logs del sistema
/log print where topics~"hotspot"

# Ver usuarios activos
/ip hotspot active print detail
```

## 📝 Configuración Completa de Ejemplo

```bash
# 1. Habilitar API
/ip service enable api
/ip service set api port=8728 address=0.0.0.0/0

# 2. Crear usuario API
/user group add name=api-users policy=read,write,test,api
/user add name=apiuser password=MiPassword123 group=api-users

# 3. Crear perfiles
/ip hotspot user profile
add name="1-hora" session-timeout=1h rate-limit="2M/2M"
add name="1-dia" session-timeout=1d rate-limit="5M/5M"
add name="1-semana" session-timeout=7d rate-limit="10M/10M"

# 4. Configurar Walled Garden
/ip hotspot walled-garden
add dst-host=tu-dominio.com
add dst-host=*.stripe.com
add dst-host=*.stripe.network

# 5. Configurar Hotspot (si no está configurado)
/ip hotspot setup

# 6. Firewall para API
/ip firewall filter
add chain=input protocol=tcp dst-port=8728 src-address=TU-IP-SERVIDOR \
    action=accept comment="API Access"
add chain=input protocol=tcp dst-port=8728 action=drop \
    comment="Block API"
```

## ✅ Checklist de Configuración

- [ ] API habilitada en puerto 8728
- [ ] Usuario API creado con permisos correctos
- [ ] Hotspot configurado
- [ ] Perfiles de usuario creados
- [ ] Walled Garden configurado
- [ ] Firewall configurado para API
- [ ] Redirección al portal externo configurada
- [ ] Prueba de conexión API exitosa
- [ ] Prueba de creación de usuario exitosa

## 🔗 Integración con el SaaS

Al crear un cliente en el panel MASTER del SaaS, necesitarás:

1. **IP del MikroTik**: La IP pública o privada del router
2. **Puerto API**: Por defecto 8728
3. **Usuario**: El usuario API que creaste (ej: apiuser)
4. **Password**: La contraseña del usuario API
5. **Nombres de Perfiles**: Los nombres exactos de los perfiles creados

Ejemplo de configuración en el SaaS:
```json
{
  "host": "192.168.1.1",
  "port": 8728,
  "username": "apiuser",
  "password": "MiPassword123",
  "useSsl": false
}
```

## 📞 Soporte

Si tienes problemas con la configuración, revisa:
1. Logs de MikroTik
2. Firewall rules
3. Permisos de usuario API
4. Conectividad de red

## 📚 Referencias

- [MikroTik Hotspot Manual](https://wiki.mikrotik.com/wiki/Manual:Hotspot)
- [MikroTik API](https://wiki.mikrotik.com/wiki/Manual:API)
- [MikroTik User Manager](https://wiki.mikrotik.com/wiki/Manual:User_Manager)
