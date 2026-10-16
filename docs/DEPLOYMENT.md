# Guía de Despliegue y Puesta en Producción - KalTech

Esta guía proporciona las instrucciones completas para desplegar **KalTech E-Commerce** en servidores de producción (VPS como DigitalOcean, Hetzner, AWS EC2, Linode) o plataformas administradas (PaaS como Render, Railway o Fly.io).

---

## 1. Arquitectura de Producción

```
       [ Internet / Clientes ]
                  │
                  ▼ (HTTPS :443)
       ┌──────────────────────┐
       │   Nginx (Frontend)   │  <─── Sirve la SPA (React + Vite optimizado)
       │    Puerto 80/443     │  <─── Enruta /api/ hacia el backend
       └──────────┬───────────┘
                  │ (Red interna privada)
                  ▼
       ┌──────────────────────┐
       │  Node.js API Server  │  <─── Express 5 (TypeScript compilado)
       │      Puerto 5000     │  <─── Graceful Shutdown (SIGTERM/SIGINT)
       └──────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌──────────────────────────┐
│    MongoDB    │   │ Servicios Externos Cloud │
│ (Contenedor o │   │ • Cloudinary (Imágenes)  │
│  Mongo Atlas) │   │ • Stripe / PayPal (Pago) │
└───────────────┘   │ • Google / Facebook Auth │
                    └──────────────────────────┘
```

---

## 2. Opción Recomendada: Despliegue con Docker Compose (VPS)

### Requisitos Previos en el Servidor
- Sistema Operativo: Ubuntu 22.04 LTS / 24.04 LTS o Debian 12.
- [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) y [Docker Compose v2](https://docs.docker.com/compose/install/).
- Un nombre de dominio apuntando a la IP pública de tu servidor (ej. `kaltech.tudominio.com`).

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Kal2403/kaltech.git
cd kaltech
```

### Paso 2: Configurar las Variables de Entorno
Copia la plantilla de producción:
```bash
cp .env.docker.example .env
```

Edita el archivo `.env` con tus credenciales reales:
```bash
nano .env
```

Variables clave a configurar:
- `JWT_SECRET`: Cadena aleatoria segura de al menos 32 caracteres (puedes generar una con `openssl rand -hex 32`).
- `CLIENT_URL`: URL de tu dominio (ej. `https://kaltech.tudominio.com`).
- `ADMIN_EMAIL` y `ADMIN_PASSWORD`: Credenciales para tu cuenta de administrador inicial.
- `CLOUDINARY_*`: Credenciales de Cloudinary para subida y procesamiento de imágenes.
- `STRIPE_*` / `PAYPAL_*`: Claves de tus pasarelas de pago.

### Paso 3: Construir y Levantar los Contenedores
```bash
docker compose up -d --build
```

### Paso 4: Verificar el Estado de los Servicios
```bash
# Ver estado de salud de los contenedores
docker compose ps

# Ver registros en tiempo real
docker compose logs -f server
```

### Paso 5: Inicializar Datos y Cuenta Administradora
Una vez que el backend esté saludable, ejecuta el seed dentro del contenedor:
```bash
# Crear la cuenta de administrador
docker compose exec server npm run seed:admin

# (Opcional) Cargar catálogo de prueba inicial
docker compose exec server npm run seed:dummy
```

---

## 3. Configuración de Dominio y Certificados SSL/HTTPS (Let's Encrypt)

Para producción con tráfico cifrado HTTPS seguro, se recomienda usar **Certbot** y Nginx en el host o un proxy inverso como Traefik / Nginx Proxy Manager.

### Instalación de Certbot en Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Obtención del Certificado SSL:
```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot renovará automáticamente los certificados antes de que caduquen (verificable con `sudo certbot renew --dry-run`).

---

## 4. Opción Alternativa: Plataformas PaaS (Render, Railway, etc.)

Si prefieres no administrar un VPS, puedes desplegar cada servicio individualmente:

### A. Base de Datos
- Crea un clúster gratuito o de producción en [MongoDB Atlas](https://www.mongodb.com/atlas).
- Obtén la cadena de conexión (URI) con formato `mongodb+srv://...` y añade las IPs de tu servidor a la lista de acceso (Network Access).

### B. Backend (`server/`)
- Crea un nuevo servicio web en Render/Railway apuntando al subdirectorio `server/`.
- Comando de instalación: `npm ci`
- Comando de build: `npm run build`
- Comando de inicio: `npm start`
- Configura las variables de entorno del servidor documentadas en [`server/.env.example`](../server/.env.example).

### C. Frontend (`client/`)
- Crea un servicio de sitio estático apuntando a `client/`.
- Comando de build: `npm run build`
- Directorio de publicación: `dist`
- Variable de entorno de build: `VITE_API_URL=https://api.tudominio.com/api`

---

## 5. Herramienta de Verificación Pre-Vuelo

Antes de lanzar la tienda al público o tras realizar cualquier cambio en las variables de entorno, puedes ejecutar en el servidor:

```bash
cd server
npm run verify:prod
```

Este script comprobará automáticamente:
- [x] Conectividad y latencia con MongoDB.
- [x] Fortaleza criptográfica de la clave `JWT_SECRET`.
- [x] Integración de Cloudinary.
- [x] Modo activo de pasarelas de pago (Stripe / PayPal).
- [x] Credenciales de correo SMTP y autenticación social.

---

## 6. Mantenimiento y Respaldos (Backups)

### Realizar una Copia de Seguridad de MongoDB
```bash
# Si usas Docker Compose local
docker compose exec mongo mongodump --archive=/data/db/backup-$(date +%F).gz --gzip --db kaltech

# Si usas MongoDB Atlas o remoto
mongodump --uri="mongodb+srv://..." --archive="backup-$(date +%F).gz" --gzip
```

### Restaurar una Copia de Seguridad
```bash
docker compose exec mongo mongorestore --archive=/data/db/backup-2026-10-16.gz --gzip --drop
```

### Actualizaciones sin Caída de Servicio (Zero-Downtime)
El servidor implementa **Graceful Shutdown** en `src/index.ts`. Al desplegar nuevas versiones:
```bash
git pull origin main
docker compose build
docker compose up -d --no-deps server
```
El contenedor anterior terminará de procesar todas las compras activas antes de desconectar MongoDB y ceder el tráfico a la nueva versión.

---

## 7. Checklist Final Pre-Lanzamiento

- [ ] Dominio configurado con DNS y certificado SSL HTTPS activo.
- [ ] `JWT_SECRET` generado con alta entropía (mínimo 32 caracteres).
- [ ] Base de datos MongoDB en producción con usuarios protegidos y backups activos.
- [ ] Variables de Cloudinary configuradas para subida de fotos de productos.
- [ ] Claves de producción de Stripe y PayPal configuradas en pasarelas reales.
- [ ] Webhooks de Stripe (`/api/payments/webhook`) y PayPal registrados en sus respectivos portales de desarrollador.
- [ ] Credenciales de Administrador cambiadas a través de `npm run seed:admin`.
- [ ] `npm run verify:prod` ejecutado con resultado libre de errores críticos.
