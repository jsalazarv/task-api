# 🚀 Guía de Despliegue en Dokploy

Esta guía te ayudará a desplegar el backend de HomeTasks en Dokploy.

---

## 📋 Pre-requisitos

1. **Cuenta en Dokploy** activa
2. **Repositorio Git** con el código del backend
3. **Base de datos PostgreSQL** (puede ser en Dokploy o externa)

---

## 🗂️ Preparación del Proyecto

### 1. Archivos Necesarios

Asegúrate de que estos archivos existan en tu proyecto:

- ✅ `Dockerfile` - Para construir la imagen
- ✅ `.dockerignore` - Para optimizar el build
- ✅ `.env.production.example` - Template de variables de entorno
- ✅ `prisma/schema.prisma` - Schema de la base de datos
- ✅ `prisma/migrations/` - Migraciones de Prisma

### 2. Verificar el Build Localmente (Opcional pero Recomendado)

```bash
# Construir la imagen Docker
docker build -t hometasks-api:test .

# Probar la imagen (ajusta DATABASE_URL)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NODE_ENV=production \
  hometasks-api:test

# Verificar que funciona
curl http://localhost:3000/health
```

---

## 🌐 Despliegue en Dokploy

### Paso 1: Crear Base de Datos PostgreSQL

#### Opción A: Usar Dokploy PostgreSQL

1. En el dashboard de Dokploy, ve a **Databases**
2. Click en **Create Database**
3. Selecciona **PostgreSQL**
4. Configura:
   - **Name**: `hometasks-db`
   - **Version**: `16` (o la última disponible)
   - **Username**: `hometasks_user`
   - **Password**: Genera una contraseña segura
   - **Database Name**: `hometasks_db`
5. Click en **Create**
6. **Copia la Connection String** (la necesitarás después)
   - Formato: `postgresql://user:password@host:5432/database`

#### Opción B: Usar Base de Datos Externa

Si ya tienes una base de datos PostgreSQL (ej: Neon, Supabase, Railway):
- Solo necesitas la **Connection String**
- Asegúrate de que Dokploy pueda acceder a ella (whitelist de IPs)

---

### Paso 2: Crear Aplicación en Dokploy

1. En el dashboard de Dokploy, ve a **Applications**
2. Click en **Create Application**
3. Selecciona **Docker**
4. Configura:

   **Basic Settings:**
   - **Name**: `hometasks-api-dev`
   - **Repository**: URL de tu repositorio Git
     - Si es privado, agrega las credenciales de acceso
   - **Branch**: `main` (o la branch que quieras desplegar)
   - **Build Context**: `./` (raíz del proyecto)
   - **Dockerfile Path**: `./Dockerfile`

   **Port Settings:**
   - **Container Port**: `3000`
   - **Exposed Port**: `80` (o el que prefieras)
   - **Domain**: Asigna un dominio (ej: `hometasks-api-dev.tu-dominio.com`)
     - O usa el subdominio de Dokploy: `*.dokploy.app`

---

### Paso 3: Configurar Variables de Entorno

En la sección **Environment Variables** de tu aplicación:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database

# Genera valores seguros para producción
JWT_SECRET=tu_secreto_jwt_muy_seguro_y_largo_cambiar_esto
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=tu_secreto_refresh_token_muy_seguro_cambiar_esto
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS - Permitir tu app Flutter (ajusta después)
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

**⚠️ IMPORTANTE:**
- Reemplaza `DATABASE_URL` con tu connection string real
- Genera **secrets seguros** para `JWT_SECRET` y `REFRESH_TOKEN_SECRET`
  ```bash
  # En tu terminal local:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

### Paso 4: Ejecutar Migraciones de Prisma

Dokploy no ejecuta migraciones automáticamente. Tienes 2 opciones:

#### Opción A: Script de Inicio (Recomendado para Dev)

Modifica el `Dockerfile` para ejecutar migraciones al iniciar:

```dockerfile
# Al final del Dockerfile, antes de CMD
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
```

#### Opción B: Ejecutar Manualmente

1. Conecta a tu base de datos desde tu máquina local:
   ```bash
   DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma migrate deploy
   ```

2. O usa el terminal de Dokploy (si está disponible) dentro del container

---

### Paso 5: Ejecutar Seeders (Opcional)

Para crear el usuario admin inicial:

1. Conecta a la base de datos
2. Ejecuta el seeder:
   ```bash
   DATABASE_URL="postgresql://..." npm run prisma:seed
   ```

O modifica el `CMD` para ejecutar seeders solo la primera vez:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npm run prisma:seed || true && node dist/src/main.js"]
```

---

### Paso 6: Deploy

1. Click en **Deploy** en Dokploy
2. Espera a que el build termine (puede tomar 3-5 minutos)
3. Verifica los logs para detectar errores
4. Una vez completado, tu API estará disponible en:
   - `https://hometasks-api-dev.tu-dominio.com`
   - O el dominio que hayas configurado

---

## ✅ Verificación del Despliegue

### 1. Health Check

```bash
curl https://hometasks-api-dev.tu-dominio.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-21T...",
  "uptime": 123.45
}
```

### 2. Test de Registro

```bash
curl -X POST https://hometasks-api-dev.tu-dominio.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

**Respuesta esperada (201):**
```json
{
  "id": "uuid...",
  "email": "test@example.com",
  "name": "Test User",
  "role": "USER",
  "subscription": {
    "tier": "FREE",
    "billingInterval": null,
    "expiresAt": null,
    "isActive": false
  },
  ...
}
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

**Causa:** DATABASE_URL incorrecta o base de datos inaccesible.

**Solución:**
1. Verifica que la `DATABASE_URL` sea correcta
2. Asegúrate de que la base de datos esté corriendo
3. Verifica las reglas de firewall/whitelist

### Error: "Prisma Client not generated"

**Causa:** `npx prisma generate` no se ejecutó durante el build.

**Solución:**
Asegúrate de que el `Dockerfile` incluya:
```dockerfile
RUN npx prisma generate
```

### Error: "Module not found: dist/src/main.js"

**Causa:** El build de NestJS falló o la ruta es incorrecta.

**Solución:**
1. Verifica que `npm run build` funcione localmente
2. Verifica que el `CMD` apunte a `dist/src/main.js`
3. Revisa los logs del build en Dokploy

### Error: 500 al registrar usuario

**Causa:** Migraciones no ejecutadas o error en la base de datos.

**Solución:**
1. Ejecuta `npx prisma migrate deploy` manualmente
2. Verifica los logs de la aplicación en Dokploy
3. Verifica que las tablas existan en la base de datos

---

## 🔐 Seguridad en Producción

### 1. Variables de Entorno

**NUNCA** uses valores por defecto en producción:

```env
# ❌ MAL
JWT_SECRET=your-super-secret-jwt-key

# ✅ BIEN
JWT_SECRET=8f7d9a2e4c5b6a1d3f8e9c7a6b5d4e3f2a1c9b8d7e6f5a4b3c2d1e0f9a8b7c6
```

Genera secrets seguros:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. CORS

Restringe `CORS_ORIGIN` a tu dominio de Flutter:

```env
# En desarrollo
CORS_ORIGIN=*

# En producción
CORS_ORIGIN=https://app.hometasks.com
```

### 3. Rate Limiting

Considera agregar rate limiting en NestJS (futuro):
```typescript
// Protección contra ataques de fuerza bruta
@UseGuards(ThrottlerGuard)
```

### 4. HTTPS

Asegúrate de que Dokploy esté configurado con **HTTPS** (SSL/TLS).

---

## 📊 Monitoreo

### Logs

Accede a los logs en tiempo real desde Dokploy:
1. Ve a tu aplicación
2. Click en **Logs**
3. Filtra por nivel: `error`, `warn`, `info`

### Métricas

Dokploy proporciona métricas básicas:
- CPU usage
- Memory usage
- Network traffic
- Request count

---

## 🔄 CI/CD (Opcional)

### Auto-Deploy en Git Push

Dokploy puede configurarse para hacer deploy automático:

1. En tu aplicación, ve a **Settings**
2. Habilita **Auto Deploy**
3. Selecciona la branch: `main`
4. Cada push a `main` disparará un nuevo deployment

### Webhooks

Configura webhooks de GitHub/GitLab para notificar a Dokploy:
- URL del webhook la encuentras en Dokploy settings
- Agrega el webhook en tu repositorio

---

## 📝 Checklist de Despliegue

- [ ] Base de datos PostgreSQL creada
- [ ] Connection string obtenida
- [ ] Aplicación creada en Dokploy
- [ ] Repositorio Git conectado
- [ ] Variables de entorno configuradas (especialmente DATABASE_URL)
- [ ] Secrets seguros generados (JWT_SECRET, etc.)
- [ ] Build exitoso (sin errores)
- [ ] Migraciones de Prisma ejecutadas
- [ ] Health check responde correctamente
- [ ] Endpoint de registro funciona
- [ ] Usuario admin creado (seeder)
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Logs monitoreados

---

## 🎯 Próximos Pasos

Una vez que el backend esté desplegado:

1. **Obtén la URL final** de tu API (ej: `https://hometasks-api-dev.dokploy.app`)
2. **Anota las credenciales** del usuario admin
3. **Prueba todos los endpoints** con Postman/Bruno
4. **Actualiza la app Flutter** con la nueva URL
5. **Integra el registro** en Flutter

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los **logs en Dokploy**
2. Verifica la **conexión a la base de datos**
3. Prueba los endpoints manualmente con `curl`
4. Revisa esta documentación paso por paso

---

**¡Tu backend está listo para ser consumido por la app Flutter! 🎉**
